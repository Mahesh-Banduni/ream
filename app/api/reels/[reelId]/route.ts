import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

type RouteContext = {
  params: Promise<{ reelId: string }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { reelId } = await context.params;

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

    return NextResponse.json(reel);
  } catch (error) {
    console.error(error);

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

    await prisma.reel.delete({
      where: {
        id: reelId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);

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