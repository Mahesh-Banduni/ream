import prisma from "@/app/lib/prisma";
import generateFrameAudio from "@/app/lib/generate-frame-audio";
import generateFrameImage from "@/app/lib/generate-frame-image";
import { ProcessingStatus } from "@prisma/client";

function buildAuthHeaders(cookie?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cookie) {
    headers.cookie = cookie;
  }
  return headers;
}

async function updateFrameTimeline(reelId: string, frameId: string, newDuration: number, oldEndTime?: number) {
  const frames = await prisma.reelFrame.findMany({
    where: { reelId },
    orderBy: { orderId: "asc" },
    select: { id: true, startTime: true, endTime: true, orderId: true },
  });

  if (frames.length === 0) {
    return;
  }

  const targetIndex = frames.findIndex((frame) => frame.id === frameId);
  if (targetIndex === -1) {
    return;
  }

  const targetFrame = frames[targetIndex];
  const oldDuration = oldEndTime ? oldEndTime - targetFrame.startTime : targetFrame.endTime - targetFrame.startTime;
  const delta = newDuration - oldDuration;

  if (Math.abs(delta) < 0.0001) {
    return;
  }

  const updates = frames.slice(targetIndex + 1).map((frame) => ({
    id: frame.id,
    startTime: frame.startTime + delta,
    endTime: frame.endTime + delta,
  }));

  if (updates.length === 0) {
    return;
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.reelFrame.update({
        where: { id: update.id },
        data: {
          startTime: update.startTime,
          endTime: update.endTime,
        },
      })
    )
  );
}

export type RegenerateMode =
  | "everything"
  | "voice_only"
  | "image_only";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function regenerateFrame({
  reelId,
  frameId,
  mode,
  cookie,
}: {
  reelId: string;
  frameId: string;
  mode: RegenerateMode;
  cookie?: string;
}) {
  // 1. Verify frame belongs to the reel
  const frame = await prisma.reelFrame.findFirst({
    where: { id: frameId, reelId },
  });

  if (!frame) {
    throw new Error("Frame not found or does not belong to this reel.");
  }

  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { voice: true },
  });

  const speaker = reel?.voice ?? "shubh";

  const shouldRegenerateScript =
    mode === "everything";
  const shouldRegenerateVoice =
    mode === "everything" || mode === "voice_only";
  const shouldRegenerateImage =
    mode === "everything" || mode === "image_only";

  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

  // ── 1. Script regeneration ──
  if (shouldRegenerateScript) {
    try {
      const scriptRes = await fetch(`${baseUrl}/api/client/script/frame`, {
        method: "POST",
        headers: buildAuthHeaders(cookie),
        body: JSON.stringify({ reelId, frameId }),
      });

      if (scriptRes.ok) {
        const updatedFrame = await scriptRes.json();

        await prisma.reelFrame.update({
          where: { id: frameId },
          data: {
            narration: updatedFrame.narration ?? frame.narration,
            visualDescription:
              updatedFrame.visualDescription ?? frame.visualDescription,
            imagePrompt: updatedFrame.imagePrompt ?? frame.imagePrompt,
          },
        });
      }
    } catch (err) {
      console.warn("Script regeneration fetch warning:", err);
    }
  }

  // ── 2. Voice regeneration ──
  if (shouldRegenerateVoice) {
    const freshFrame = await prisma.reelFrame.findUnique({ where: { id: frameId } });
    if (freshFrame) {
      const audioResult = await generateFrameAudio(freshFrame, speaker, cookie);

      try {
        const newEndTime = freshFrame.startTime + audioResult.duration;

        // Update frame voice via PUT API
        const voicePutRes = await fetch(`${baseUrl}/api/client/frame-voice`, {
          method: "PUT",
          headers: buildAuthHeaders(cookie),
          body: JSON.stringify({
            frameId,
            language: "en-IN",
            processingStatus: ProcessingStatus.COMPLETED,
            audioUrl: audioResult.url,
            durationSeconds: audioResult.duration,
            startTime: freshFrame.startTime,
            endTime: newEndTime,
          }),
        });

        if (!voicePutRes.ok) {
          throw new Error("PUT /api/client/frame-voice returned non-ok status");
        }

        await updateFrameTimeline(reelId, frameId, audioResult.duration, freshFrame.endTime);
      } catch (err) {
        console.warn("Falling back to direct DB update for voice:", err);
        await prisma.$transaction([
          prisma.frameVoice.deleteMany({ where: { frameId } }),
          prisma.frameVoice.create({
            data: {
              frameId,
              generationAttempt: 1,
              processingStatus: ProcessingStatus.COMPLETED,
              language: "en-IN",
              audioUrl: audioResult.url,
              durationSeconds: audioResult.duration,
            },
          }),
          prisma.reelFrame.update({
            where: { id: frameId },
            data: {
              startTime: freshFrame.startTime,
              endTime: freshFrame.startTime + audioResult.duration,
            },
          }),
        ]);

        await updateFrameTimeline(reelId, frameId, audioResult.duration);
      }
    }
  }

  // ── 3. Image regeneration ──
  if (shouldRegenerateImage) {
    const freshFrame = await prisma.reelFrame.findUnique({ where: { id: frameId } });
    if (freshFrame) {
      await sleep(300);
      const imageResult = await generateFrameImage(freshFrame, cookie);
      const imageUrl = imageResult?.image?.image?.url ?? null;

      try {
        // Update frame image via PUT API
        const imagePutRes = await fetch(`${baseUrl}/api/client/frame-image`, {
          method: "PUT",
          headers: buildAuthHeaders(cookie),
          body: JSON.stringify({
            frameId,
            prompt: freshFrame.imagePrompt,
            imageUrl,
            processingStatus: ProcessingStatus.COMPLETED,
          }),
        });

        if (!imagePutRes.ok) {
          throw new Error("PUT /api/client/frame-image returned non-ok status");
        }
      } catch (err) {
        console.warn("Falling back to direct DB update for image:", err);
        await prisma.$transaction([
          prisma.frameImage.deleteMany({ where: { frameId } }),
          prisma.frameImage.create({
            data: {
              frameId,
              processingStatus: ProcessingStatus.COMPLETED,
              prompt: freshFrame.imagePrompt,
              imageUrl,
            },
          }),
        ]);
      }
    }
  }

  // Return updated frame with all associated relations
  const updatedFrame = await prisma.reelFrame.findUnique({
    where: { id: frameId },
    include: {
      voices: true,
      images: true,
      videos: true,
    },
  });

  return updatedFrame;
}
