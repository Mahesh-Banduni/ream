import path from "path";
import os from "os";
import fs from "fs";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import prisma from "./prisma";
import type { ReelCompositionProps, ReelFrameInput } from "@/remotion/ReelComposition";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
const FPS = 30;

// ─────────────────────────────────────────────
// Main entry-point called by the render API route
// ─────────────────────────────────────────────
export async function generateVideo(reelId: string): Promise<string> {
  // 1. Load reel frames + assets from DB
  const frames = await prisma.reelFrame.findMany({
    where: { reelId },
    orderBy: { orderId: "asc" },
    include: {
      images: {
        where: { processingStatus: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      voices: {
        where: { processingStatus: "COMPLETED" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!frames.length) {
    throw new Error("No frames found for reel " + reelId);
  }

  // 2. Build input props
  const compositionFrames: ReelFrameInput[] = frames.map((frame) => {
    const image = frame.images[0];
    const voice = frame.voices[0];

    if (!image?.imageUrl) {
      throw new Error(
        `Frame ${frame.orderId} has no completed image. Generate images first.`
      );
    }

    return {
      id: frame.id,
      orderId: frame.orderId,
      imageUrl: image.imageUrl,
      audioUrl: voice?.audioUrl ?? null,
      narration: frame.narration,
      startTime: frame.startTime,
      endTime: frame.endTime,
      transition: frame.transition ?? "crossfade",
    };
  });

  const totalDurationSec = compositionFrames.reduce(
    (max, f) => Math.max(max, f.endTime),
    0
  );
  const durationInFrames = Math.max(1, Math.round(totalDurationSec * FPS));

  const inputProps: ReelCompositionProps = { frames: compositionFrames };

  // 3. Bundle the Remotion composition
  console.log("[generate-video] Bundling Remotion composition…");
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "remotion", "Root.tsx"),
    // Webpack override for Next.js compatibility
    webpackOverride: (config) => config,
  });

  // 4. Select composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "ReelComposition",
    inputProps,
  });

  // 5. Render to a temp file
  const tmpFile = path.join(os.tmpdir(), `reel-${reelId}-${Date.now()}.mp4`);
  console.log(`[generate-video] Rendering to ${tmpFile}…`);

  await renderMedia({
    composition: {
      ...composition,
      durationInFrames,
    },
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: tmpFile,
    inputProps,
    onProgress: ({ progress }) => {
      console.log(
        `[generate-video] Render progress: ${Math.round(progress * 100)}%`
      );
    },
  });

  console.log("[generate-video] Render complete. Uploading to ImageKit…");

  // 6. Upload the rendered MP4 to ImageKit via the existing /api/upload/video route
  const fileBuffer = fs.readFileSync(tmpFile);
  const blob = new Blob([fileBuffer], { type: "video/mp4" });
  const file = new File([blob], `reel-${reelId}.mp4`, { type: "video/mp4" });

  const formData = new FormData();
  formData.append("file", file);

  const uploadRes = await fetch(`${baseUrl}/api/upload/video`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`ImageKit upload failed: ${err}`);
  }

  const uploadResult = await uploadRes.json();
  const videoUrl: string = uploadResult.url;

  console.log(`[generate-video] Uploaded: ${videoUrl}`);

  // 7. Clean up temp file
  try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }

  // 8. Upsert FinalReel record in DB
  await prisma.finalReel.upsert({
    where: { reelId },
    create: {
      reelId,
      processingStatus: "COMPLETED",
      videoUrl,
      duration: totalDurationSec,
    },
    update: {
      processingStatus: "COMPLETED",
      videoUrl,
      duration: totalDurationSec,
    },
  });

  return videoUrl;
}
