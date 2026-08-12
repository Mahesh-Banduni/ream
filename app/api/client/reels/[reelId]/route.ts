import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { checkUserRole } from "@/app/lib/check-role";

type RouteContext = {
  params: Promise<{ reelId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { reelId } = await context.params;
    await checkUserRole("CLIENT");

    const scriptResponse = await req.json();

    const reel = await prisma.reel.update({
        where: { id: reelId },
        data: {
            hook: scriptResponse.script.hook,
            body: scriptResponse.script.body,
            ending: scriptResponse.script.ending,
            reviewScore: scriptResponse.reviewScore,
            reviewApproved: scriptResponse.reviewApproved,
            status: "REVIEWED",
        },
    });

    const bgMusicStyle = scriptResponse.script?.bgMusic || scriptResponse.bgMusic;
    if (bgMusicStyle) {
      await prisma.reelBackgroundMusic.upsert({
        where: { reelId },
        create: {
          style_description: bgMusicStyle,
          musicUrl: null,
          reel: {
            connect: { id: reelId },
          },
        },
        update: {
          style_description: bgMusicStyle,
        },
      });
    }

    return NextResponse.json(reel);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to update reel.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { reelId } = await context.params;
    await checkUserRole("CLIENT");
    await prisma.reel.delete({
      where: {
        id: reelId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to delete reel.",
      },
      {
        status: 500,
      }
    );
  }
}