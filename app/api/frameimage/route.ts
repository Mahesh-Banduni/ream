import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reelId, images } = await req.json();
    console.log("Creating frame images");
    console.log("Images: ",images);

    if (!reelId) {
      return NextResponse.json(
        { error: "reelId is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "images must be a non-empty array." },
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
      await tx.frameImage.deleteMany({
        where: {
          frame: {
            reelId,
          },
        },
      });

      await tx.frameImage.createMany({
        data: images.map((image: any) => ({
            frameId: image.frameId,
            imageUrl: image?.imageUrl,
            prompt: image?.prompt,
            processingStatus: image?.processingStatus
        })),
      });
    });

    const savedImages = await prisma.frameImage.findMany({
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
      totalImages: savedImages.length,
      images: savedImages,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save images.",
      },
      {
        status: 500,
      }
    );
  }
}