import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try {
    const { reelId, images } = await req.json();
    console.log("Creating frame images");
    await checkUserRole("CLIENT");

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
    if (error instanceof Response) {
      return error;
    }
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

export async function PUT(req: NextRequest) {
  try {
    const { frameId, prompt, imageUrl, processingStatus } = await req.json();
    await checkUserRole("CLIENT");

    if (!frameId) {
      return NextResponse.json(
        { error: "frameId is required." },
        { status: 400 }
      );
    }

    const frameImage = await prisma.$transaction(async (tx) => {
      await tx.frameImage.deleteMany({
        where: { frameId },
      });

      const image = await tx.frameImage.create({
        data: {
          frameId,
          prompt,
          imageUrl,
          processingStatus: processingStatus ?? "COMPLETED",
        },
      });

      return image;
    });

    return NextResponse.json({
      success: true,
      image: frameImage,
    });
  } catch (error) {
    console.error("PUT /api/frame-image error:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to update frame image." },
      { status: 500 }
    );
  }
}
