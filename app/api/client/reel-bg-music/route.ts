import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try {
    const { music, musicResponse, reelId } = await req.json();
    console.log("Creating/updating reel background music details");
    await checkUserRole("CLIENT");

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    const musicData = music || musicResponse?.result || musicResponse;

    if (!musicData) {
      return NextResponse.json(
        { error: "music detail is required" },
        { status: 400 }
      );
    }

    const reel = await prisma.reel.findFirst({
      where: { id: reelId },
      select: { id: true },
    });

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found." },
        { status: 404 }
      );
    }

    const musicUrl = musicData.musicUrl || musicData.url;
    const styleDescription =
      musicData.style_description ||
      musicData.style ||
      "Background music";

    const bgMusic = await prisma.reelBackgroundMusic.upsert({
      where: { reelId },
      create: {
        style_description: styleDescription,
        musicUrl: musicUrl,
        reel: {
          connect: { id: reelId },
        },
      },
      update: {
        musicUrl: musicUrl,
        style_description: styleDescription,
      },
    });

    return NextResponse.json({
      success: true,
      reelId,
      bgMusic,
    });
  } catch (error) {
    console.error("Failed to save reel background music:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to save reel background music.",
      },
      {
        status: 500,
      }
    );
  }
}

/** PUT /api/reel-bg-music
 *  Regenerates and replaces the background music for a given reel.
 *  Body: { reelId: string }
 */
export async function PUT(req: NextRequest) {
  try {
    const { reelId } = await req.json();
    await checkUserRole("CLIENT");

    if (!reelId) {
      return NextResponse.json({ error: "reelId is required." }, { status: 400 });
    }

    const reel = await prisma.reel.findFirst({
      where: { id: reelId },
      select: { id: true },
    });

    if (!reel) {
      return NextResponse.json({ error: "Reel not found." }, { status: 404 });
    }

    // Dynamically import to keep server-only code out of the client bundle
    const { generateReelBgMusic } = await import("@/app/lib/generate-bg-music");

    const musicResult = await generateReelBgMusic(reelId);

    if (!musicResult.success || !musicResult.result) {
      return NextResponse.json(
        { error: "Background music generation failed." },
        { status: 500 }
      );
    }

    const { musicUrl, style_description } = musicResult.result;

    const bgMusic = await prisma.reelBackgroundMusic.upsert({
      where: { reelId },
      create: {
        style_description: style_description ?? "Background music",
        musicUrl: musicUrl ?? null,
        reel: { connect: { id: reelId } },
      },
      update: {
        musicUrl: musicUrl ?? null,
        style_description: style_description ?? "Background music",
      },
    });

    return NextResponse.json({ success: true, reelId, bgMusic });
  } catch (error) {
    console.error("PUT /api/reel-bg-music error:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to regenerate background music." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { reelId, styleDescription } = await req.json();
    await checkUserRole("CLIENT");

    if (!reelId) {
      return NextResponse.json({ error: "reelId is required." }, { status: 400 });
    }

    if (typeof styleDescription !== "string" || !styleDescription.trim()) {
      return NextResponse.json({ error: "styleDescription is required." }, { status: 400 });
    }

    const bgMusic = await prisma.reelBackgroundMusic.upsert({
      where: { reelId },
      create: {
        style_description: styleDescription.trim(),
        musicUrl: null,
        reel: { connect: { id: reelId } },
      },
      update: {
        style_description: styleDescription.trim(),
      },
    });

    return NextResponse.json({ success: true, reelId, bgMusic });
  } catch (error) {
    console.error("PATCH /api/reel-bg-music error:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to update background music style." },
      { status: 500 }
    );
  }
}
