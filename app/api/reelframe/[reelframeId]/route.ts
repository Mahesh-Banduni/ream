import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reelframeId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { reelframeId: reelId } = await context.params;
    const { frames } = await req.json();

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(frames)) {
      return NextResponse.json(
        { error: "frames must be an array." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      for (const frame of frames) {
        await tx.reelFrame.update({
          where: {
            id: frame.id,
          },
          data: {
            orderId: frame.orderId,
            startTime: frame.startTime,
            endTime: frame.endTime,
            narration: frame.narration,
            visualDescription: frame.visualDescription,
            imagePrompt: frame.imagePrompt,
            cameraShot: frame.cameraShot,
            cameraMovement: frame.cameraMovement,
            transition: frame.transition,
          },
        });
      }
    });

    const updatedFrames = await prisma.reelFrame.findMany({
      where: { reelId },
      orderBy: {
        orderId: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      frames: updatedFrames,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update reel frames." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { reelframeId: reelId } = await context.params;

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    await prisma.reelFrame.deleteMany({
      where: {
        reelId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Storyboard deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to delete reel frames." },
      { status: 500 }
    );
  }
}