import { findBackgroundMusic } from "@/app/lib/music-search";
import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

export async function POST(req: NextRequest) {
  try {
    const { reelId } = await req.json();
    await checkUserRole("CLIENT");

    const reel = await prisma.reel.findFirst({
      where: { id: reelId },
      include: { backgroundMusic: true },
    });

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found." },
        { status: 404 }
      );
    }

    const searchQuery =
      reel?.backgroundMusic?.style_description ||
      reel?.tone ||
      reel?.title ||
      "upbeat background music";

    const musicResult = await findBackgroundMusic(searchQuery);

    return NextResponse.json({
      success: true,
      music: musicResult,
      style_description: searchQuery,
    });
  } catch (error) {
    console.error("Error in assets bg-music route:", error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to search background music." },
      { status: 500 }
    );
  }
}