import { generateAssets } from "@/app/lib/generate-assets";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reelId: string }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { reelId } = await context.params;

    const res = await generateAssets(reelId);

    return NextResponse.json(res);
  } catch (error) {
    console.error(error);

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
