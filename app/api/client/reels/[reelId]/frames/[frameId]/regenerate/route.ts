import { NextRequest, NextResponse } from "next/server";
import { regenerateFrame, RegenerateMode } from "@/app/lib/regenerate-frame";
import { checkUserRole } from "@/app/lib/check-role";

type RouteContext = {
  params: Promise<{ reelId: string; frameId: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { reelId, frameId } = await context.params;
    const { mode } = (await req.json()) as { mode: RegenerateMode };
    await checkUserRole("CLIENT");

    const updatedFrame = await regenerateFrame({
      reelId,
      frameId,
      mode,
      cookie: req.headers.get("cookie") ?? undefined,
    });

    return NextResponse.json({ success: true, frame: updatedFrame });
  } catch (error) {
    console.error("[regenerate frame API]", error);
    if (error instanceof Response) {
      return error;
    }
    const message =
      error instanceof Error ? error.message : "Failed to regenerate frame assets.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
