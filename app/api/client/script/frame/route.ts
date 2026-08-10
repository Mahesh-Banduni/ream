import prisma from "@/app/lib/prisma";
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_2!,
});

export async function POST(req: NextRequest) {
  try {
    const { reelId, frameId } = await req.json();
    await checkUserRole("CLIENT");

    if (!reelId || !frameId) {
      return NextResponse.json(
        { error: "reelId and frameId are required." },
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

    const frame = await prisma.reelFrame.findUnique({
      where: { id: frameId },
    });

    if (!frame) {
      return NextResponse.json(
        { error: "Frame not found." },
        { status: 404 }
      );
    }

    const [previousFrame, nextFrame] = await Promise.all([
      prisma.reelFrame.findFirst({
        where: {
          reelId,
          orderId: frame.orderId - 1,
        },
      }),
      prisma.reelFrame.findFirst({
        where: {
          reelId,
          orderId: frame.orderId + 1,
        },
      }),
    ]);

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: `
You are an expert storyboard editor for short-form viral videos.

Your job is NOT to create a new frame.

Your job is to rewrite the CURRENT frame while preserving exactly the same meaning and keeping it perfectly consistent with the rest of the reel.

#############################
REEL INFORMATION
#############################

Title:
${reel.title}

Audience:
${reel.audience}

Tone:
${reel.tone ?? "Professional"}

#############################
PREVIOUS FRAME
#############################

${
  previousFrame
    ? `
Narration:
${previousFrame.narration}

Visual Description:
${previousFrame.visualDescription}
`
    : "No previous frame."
}

#############################
CURRENT FRAME
#############################

Narration:
${frame.narration}

Visual Description:
${frame.visualDescription}

Image Prompt:
${frame.imagePrompt}

Camera Shot:
${frame.cameraShot}

Camera Movement:
${frame.cameraMovement}

Transition:
${frame.transition}

#############################
NEXT FRAME
#############################

${
  nextFrame
    ? `
Narration:
${nextFrame.narration}

Visual Description:
${nextFrame.visualDescription}
`
    : "No next frame."
}

#############################
USER FEEDBACK
#############################

${"None"}

#############################
TASK
#############################

Rewrite ONLY the current frame.

Regenerate:

- narration
- visualDescription
- imagePrompt

Keep these EXACTLY the same:

- cameraShot
- cameraMovement
- transition

#############################
RULES
#############################

1. DO NOT change the meaning.
2. DO NOT change the story.
3. DO NOT introduce new concepts.
4. DO NOT remove important information.
5. Keep continuity with the previous and next frame.
6. Narration should remain approximately the same length.
7. Visual description should describe the same scene using different wording.
8. Image prompt should generate essentially the same image with improved wording.
9. Feel free to improve quality, clarity and creativity without changing the intent.
10. Respect the user's feedback if provided, but NEVER change the core meaning.

Return ONLY valid JSON.
`,

      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narration: {
              type: Type.STRING,
            },
            visualDescription: {
              type: Type.STRING,
            },
            imagePrompt: {
              type: Type.STRING,
            },
          },
          required: [
            "narration",
            "visualDescription",
            "imagePrompt",
          ],
        },
      },
    });

    const result = JSON.parse(response.text!);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      {
        error: "Failed to regenerate frame.",
      },
      {
        status: 500,
      }
    );
  }
}