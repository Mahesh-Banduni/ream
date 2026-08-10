import { generateAssets } from "@/app/lib/generate-assets";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

type RouteContext = {
  params: Promise<{ reelId: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { reelId } = await context.params;
    await checkUserRole("CLIENT");

    const res = await generateAssets(
      reelId,
      req.headers.get("cookie") ?? undefined
    );

    return NextResponse.json(res);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to generate assets.",
      },
      {
        status: 500,
      }
    );
  }
}
