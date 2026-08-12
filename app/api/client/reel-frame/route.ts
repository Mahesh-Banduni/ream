import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try {
    const {frames, reelId} = await req.json();
    console.log("Creating reel frames");
    await checkUserRole("CLIENT");

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { error: "frames must be a non-empty array." },
        { status: 400 }
      );
    }

    const reel = await prisma.reel.findFirst({
      where: {
        id: reelId,
      },
      select: {
        id: true,
      },
    });

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Remove old reel frames
      await tx.reelFrame.deleteMany({
        where: {
          reelId,
        },
      });

      // Save new reel frames
      await tx.reelFrame.createMany({
        data: frames.map((frame: any) => ({
          reelId,
          orderId: frame.orderId,
          startTime: frame.startTime,
          endTime: frame.endTime,
          narration: frame.narration,
          visualDescription: frame.visualDescription,
          imagePrompt: frame.imageSearchQuery,
          cameraShot: frame.cameraShot,
          cameraMovement: frame.cameraMovement,
          transition: frame.transition,
        })),
      });
    });

    const savedFrames = await prisma.reelFrame.findMany({
      where: {
        reelId,
      },
      orderBy: {
        orderId: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      reelId,
      totalFrames: savedFrames.length,
      frames: savedFrames,
    });
  } catch (error) {
    console.error("Failed to save reel frames:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to save reel frames.",
      },
      {
        status: 500,
      }
    );
  }
}