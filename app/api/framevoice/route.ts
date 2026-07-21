import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reelId, voices } = await req.json();
    console.log("Creating frame voices");

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
          processingStatus:voice.processingStatus,
          audioUrl: voice.audioUrl
        })),
      });
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