import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY_6!,
});

export async function POST(req: NextRequest) {
  try {
    const { reelId, script } = await req.json();

    console.log("Reviewing script");
    
    const reel = await prisma.reel.findFirst({
      where: {id: reelId}
    })

    if (!reel) {
      return NextResponse.json(
        { error: "Reel not found" },
        { status: 400 }
      );
    }

const completion = await gemini.models.generateContent({
  model: "gemini-3.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `
You are an expert content strategist.

Review the following reel script.

Title:
${reel.title}

Audience:
${reel.audience}

Duration:
${reel.durationSeconds} seconds

Script:
${JSON.stringify(script, null, 2)}

Review using these criteria:

1. Audience Relevance
- Does it fit the target audience?
- Is the tone appropriate?
- Is it valuable?

2. Engagement & Retention
- Strong hook?
- Curiosity?
- Smooth pacing?
- Memorable ending?

3. Script Quality & Structure
- Clear?
- Concise?
- Conversational?
- Fits duration?
- Grammar?

Provide concise feedback.

- strengths: maximum 3 items
- improvements: maximum 2 items
- feedback: maximum 80 words

Return ONLY JSON.

Return this JSON schema exactly:

{
  "overallScore": number,
  "approved": boolean,
  "scores": {
    "audienceRelevance": number,
    "engagementRetention": number,
    "scriptQuality": number
  },
  "strengths": [
    "string"
  ],
  "improvements": [
    "string"
  ],
  "feedback": "string"
}
`,
        },
      ],
    },
  ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
      
        required: [
          "overallScore",
          "approved",
          "scores",
          "strengths",
          "improvements",
          "feedback"
        ],
      
        properties: {
          overallScore: {
            type: "NUMBER"
          },
        
          approved: {
            type: "BOOLEAN"
          },
        
          scores: {
            type: "OBJECT",
          
            required: [
              "audienceRelevance",
              "engagementRetention",
              "scriptQuality"
            ],
          
            properties: {
              audienceRelevance: {
                type: "NUMBER"
              },
            
              engagementRetention: {
                type: "NUMBER"
              },
            
              scriptQuality: {
                type: "NUMBER"
              }
            }
          },
        
          strengths: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          },
        
          improvements: {
            type: "ARRAY",
            items: {
              type: "STRING"
            }
          },
        
          feedback: {
            type: "STRING"
          }
        }
      },
      maxOutputTokens: 4096,
    }
  });
    const raw = completion.text ?? "";

    let review;

    try {
      review = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid JSON received from Gemini");
      console.error(raw);
    
      return NextResponse.json(
        {
          error: "Gemini returned invalid JSON",
          rawResponse: raw,
        },
        {
          status: 500,
        }
      );
    }
    return NextResponse.json(review);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to review script.",
      },
      {
        status: 500,
      }
    );
  }
}