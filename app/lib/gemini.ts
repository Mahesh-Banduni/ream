import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateGeminiImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image-preview",
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType;
      const buffer = Buffer.from(part.inlineData.data!, "base64");

      return {
        buffer,
        mimeType,
        source: "GEMINI",
        generated: true,
      };
    }
  }

  throw new Error("No image was generated.");
}