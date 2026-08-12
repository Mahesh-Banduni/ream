import prisma from "@/app/lib/prisma";
import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { checkUserRole } from "@/app/lib/check-role";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_9!,
});

export async function POST(req: NextRequest) {
  try {
    await checkUserRole("CLIENT");
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
      model: "gemini-3.6-flash",
      contents: `
You are an expert viral short-form content creator and storyboard artist.

Your task has TWO parts.

PART 1 — Write the reel script & background music style.

Create a script that maximizes:
- audience retention
- curiosity
- watch time
- shares
- comments

Requirements:
- Strong hook in first 2 seconds.
- Conversational language matching the requested tone.
- Keep viewers engaged.
- Match the requested duration.
- Naturally incorporate key concepts or terms related to the keywords.
- Finish with a memorable CTA.
- Provide a very short background music style description (2-3 words) matching the tone and vibe of the reel (e.g., "Energetic synth pop", "Calm lo-fi beat", "Dramatic cinematic beat").

Target duration:
${reel.durationSeconds} seconds.

Estimate speaking speed at about 2.5 words per second.

Title:
${reel.title}

Audience:
${reel.audience}

Requested Tone:
${reel.tone || "Professional, engaging, and clear"}

Keywords / Key Topics to cover:
${reel.keywords && reel.keywords.length > 0 ? reel.keywords.join(", ") : "None specified"}

Reviewer Feedback:
${feedback ?? "None"}

--------------------------------------------

PART 2 — Generate the storyboard.

Using ONLY the script you just created, generate a production-ready storyboard.

Rules:

• Create between 10 and 15 storyboard frames based on the reel duration. Shorter reels should have fewer frames, while longer reels should have more.
Example:
20–30 second reel: 10–11 frames
30–45 second reel: 12–13 frames
45–60 second reel: 14–15 frames

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
- imageSearchQuery
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

imageSearchQuery is used ONLY to search stock photo websites like Unsplash and Pixabay.

Rules:
- 3 to 7 words only.
- Focus on the main visual subject.
- Do NOT include camera terms.
- Do NOT include lighting or style words.
- Do NOT write full sentences.
- Prefer nouns over adjectives.
- Make it highly searchable.
- If a person is involved, describe their role instead of a specific person.
- Use singular nouns where possible.

Examples:

"software developer laptop"

"online shopping"

"small business owner"

"cloud computing"

"office teamwork"

"customer support"

"electric vehicle charging"

The query should maximize the chance of finding relevant real photographs.

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
            bgMusic: {
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
                      imageSearchQuery: {  type: Type.STRING  },
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
                      "imageSearchQuery",
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
            "bgMusic",
            "estimatedDuration",
            "framePlan",
          ],
        }
      },
    });

    return NextResponse.json(JSON.parse(response.text!));
  } catch (error) {
    console.error(error);
    if (error instanceof Response) {
      return error;
    }
    return NextResponse.json(
      { error: "Failed to generate script." },
      { status: 500 }
    );
  }
}