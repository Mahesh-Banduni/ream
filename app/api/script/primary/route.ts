import prisma from "@/app/lib/prisma";
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_4!,
});

export async function POST(req: NextRequest) {
  try {
    const { reelId, feedback } = await req.json();

    console.log("Calling primary script");

    const reel = await prisma.reel.findFirst({
      where: {id: reelId}
    })

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `
You are an expert viral short-form content creator and storyboard artist.

Your task has TWO parts.

PART 1 — Write the reel script.

Create a script that maximizes:
- audience retention
- curiosity
- watch time
- shares
- comments

Requirements:
- Strong hook in first 3 seconds.
- Conversational language.
- Keep viewers engaged.
- Match the requested duration.
- Finish with a memorable CTA.

Target duration:
${reel.durationSeconds} seconds.

Estimate speaking speed at about 2.5 words per second.

Title:
${reel.title}

Audience:
${reel.audience}

Reviewer Feedback:
${feedback ?? "None"}

--------------------------------------------

PART 2 — Generate the storyboard.

Using ONLY the script you just created, generate a production-ready storyboard.

Rules:

• Create between 8 and 10 storyboard frames.

• Preserve narration EXACTLY.
Do NOT rewrite.
Do NOT paraphrase.
Do NOT summarize.
Every word of the script must appear exactly once across all frames.

When all frame narrations are concatenated together they must exactly reconstruct:

hook + body + ending

• Split narration at sentence boundaries whenever possible.

• Distribute the total duration evenly.

Frame 1 starts at 0 seconds.

Final frame ends at ${reel.durationSeconds} seconds.

Every frame contains:

- orderId
- frameNumber
- startTime
- endTime
- narration
- visualDescription
- imagePrompt
- cameraShot
- cameraMovement
- transition

cameraShot must be one of:
Close Up
Medium Shot
Wide Shot
Overhead
POV
Macro

cameraMovement:
Static
Push In
Pull Out
Pan Left
Pan Right
Tilt Up
Tilt Down
Dolly
Zoom

transition:
Cut
Fade
Dissolve
Zoom
Whip Pan

visualDescription should describe exactly what appears on screen.

imagePrompt should be a cinematic AI image prompt including:
- subject
- environment
- lighting
- composition
- mood
- colors
- realism/style

Do NOT mention camera movement inside imagePrompt.

Return ONLY valid JSON.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: {
              type: Type.STRING,
            },
            body: {
              type: Type.STRING,
            },
            ending: {
              type: Type.STRING,
            },
            estimatedDuration: {
              type: Type.INTEGER,
            },
            framePlan: {
              type: Type.OBJECT,
              properties: {
                totalFrames: {
                  type: Type.INTEGER,
                },
                frames: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      orderId: { type: Type.INTEGER },
                      frameNumber: { type: Type.INTEGER },
                      startTime: { type: Type.NUMBER },
                      endTime: { type: Type.NUMBER },
                      narration: { type: Type.STRING },
                      visualDescription: { type: Type.STRING },
                      imagePrompt: { type: Type.STRING },
                      cameraShot: { type: Type.STRING },
                      cameraMovement: { type: Type.STRING },
                      transition: { type: Type.STRING },
                    },
                    required: [
                      "orderId",
                      "frameNumber",
                      "startTime",
                      "endTime",
                      "narration",
                      "visualDescription",
                      "imagePrompt",
                      "cameraShot",
                      "cameraMovement",
                      "transition",
                    ],
                  },
                },
              },
              required: ["totalFrames", "frames"],
            },
          },
          required: [
            "hook",
            "body",
            "ending",
            "estimatedDuration",
            "framePlan",
          ],
        }
      },
    });

    return NextResponse.json(JSON.parse(response.text!));
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to generate script." },
      { status: 500 }
    );
  }
}