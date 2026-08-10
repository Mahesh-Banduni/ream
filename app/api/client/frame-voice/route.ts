import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try {
    const { reelId, voices, frameUpdates } = await req.json();
    console.log("Creating frame voices");
    await checkUserRole("CLIENT");

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(voices) || voices.length === 0) {
      return NextResponse.json(
        { error: "voices must be a non-empty array." },
        { status: 400 }
      );
    }

    const reel = await prisma.reel.findUnique({
      where: { id: reelId },
    });

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.frameVoice.deleteMany({
        where: {
          frame: {
            reelId,
          },
        },
      });

      await tx.frameVoice.createMany({
        data: voices.map((voice: any) => ({
          frameId: voice.frameId,
          language: voice.language,
          processingStatus: voice.processingStatus,
          audioUrl: voice.audioUrl,
        })),
      });

      await Promise.all(
        frameUpdates.map((frame: any) =>
          tx.reelFrame.update({
            where: {
              id: frame.frameId,
            },
            data: {
              startTime: frame.startTime,
              endTime: frame.endTime,
            },
          })
        )
      );
    });

    const savedVoices = await prisma.frameVoice.findMany({
      where: {
        frame: {
          reelId,
        },
      },
      include: {
        frame: true,
      },
      orderBy: {
        frame: {
          orderId: "asc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      reelId,
      totalVoices: savedVoices.length,
      voices: savedVoices,
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to save voices.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { frameId, language, processingStatus, audioUrl, durationSeconds, startTime, endTime } = await req.json();

    if (!frameId) {
      return NextResponse.json(
        { error: "frameId is required." },
        { status: 400 }
      );
    }

    const frameVoice = await prisma.$transaction(async (tx) => {
      await tx.frameVoice.deleteMany({
        where: { frameId },
      });

      const voice = await tx.frameVoice.create({
        data: {
          frameId,
          generationAttempt: 1,
          language: language ?? "en-IN",
          processingStatus: processingStatus ?? "COMPLETED",
          audioUrl,
          durationSeconds,
        },
      });

      if (typeof endTime === "number" || typeof startTime === "number") {
        await tx.reelFrame.update({
          where: { id: frameId },
          data: {
            ...(typeof startTime === "number" ? { startTime } : {}),
            ...(typeof endTime === "number" ? { endTime } : {}),
          },
        });
      }

      return voice;
    });

    return NextResponse.json({
      success: true,
      voice: frameVoice,
    });
  } catch (error) {
    console.error("PUT /api/frame-voice error:", error);
    return NextResponse.json(
      { error: "Failed to update frame voice." },
      { status: 500 }
    );
  }
}
