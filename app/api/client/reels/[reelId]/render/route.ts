import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { generateVideo } from "@/app/lib/generate-video";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Force Node.js runtime — Remotion bundler + renderer require it
export const runtime = "nodejs";
// Allow up to 5 minutes for long renders (Vercel Pro/Enterprise only)
export const maxDuration = 300;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ reelId: string }> }
) {
  const { reelId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await prisma.client.findUnique({
    where: { client_id: session.user.id },
    select: { client_id: true },
  });

  if (!client) {
    return NextResponse.json(
      { error: "A client profile is required to render a reel." },
      { status: 403 }
    );
  }

  // 1. Validate reel exists
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    include: {
      frames: {
        include: {
          images: { where: { processingStatus: "COMPLETED" }, take: 1 },
          voices: { where: { processingStatus: "COMPLETED" }, take: 1 },
        },
      },
    },
  });

  if (!reel) {
    return NextResponse.json({ error: "Reel not found" }, { status: 404 });
  }

  if (!reel.frames.length) {
    return NextResponse.json(
      { error: "Reel has no frames. Generate a storyboard first." },
      { status: 400 }
    );
  }

  const framesWithImages = reel.frames.filter((f) => f.images.length > 0);
  if (framesWithImages.length === 0) {
    return NextResponse.json(
      { error: "No frames have completed images. Generate images first." },
      { status: 400 }
    );
  }

  // 2. Mark as RENDERING in both Reel status and FinalReel record
  try {
    await Promise.all([
      prisma.reel.update({
        where: { id: reelId },
        data: { status: "RENDERING" },
      }),
      prisma.finalReel.upsert({
        where: { reelId },
        create: {
          reelId,
          processingStatus: "PROCESSING",
        },
        update: { processingStatus: "PROCESSING", videoUrl: null },
      }),
    ]);
  } catch (err) {
    console.error("[render] Failed to set RENDERING status:", err);
  }

  // 3. Run the render pipeline
  try {
    const videoUrl = await generateVideo(reelId, client.client_id);

    // 4. Update reel status to COMPLETED
    await prisma.reel.update({
      where: { id: reelId },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json({ success: true, videoUrl });
  } catch (error) {
    console.error("[render] Render failed:", error);

    // Mark as FAILED
    await Promise.all([
      prisma.reel
        .update({ where: { id: reelId }, data: { status: "FAILED" } })
        .catch(() => {}),
      prisma.finalReel
        .upsert({
          where: { reelId },
          create: {
            reelId,
            processingStatus: "FAILED",
          },
          update: { processingStatus: "FAILED" },
        })
        .catch(() => {}),
    ]);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Render failed unexpectedly",
      },
      { status: 500 }
    );
  }
}
