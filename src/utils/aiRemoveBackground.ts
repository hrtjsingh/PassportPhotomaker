import { createAIClient, AI_MODEL, normalizeGeminiModel } from "./aiClient";

export async function aiRemoveBackground(
  base64Image: string,
  targetColor: string = "transparent"
): Promise<string> {
  // Remove data:image/png;base64, prefix if present
  const base64Data = base64Image.split(",")[1] || base64Image;
  const mimeType =
    base64Image.includes(";") && base64Image.includes(":")
      ? base64Image.split(";")[0].split(":")[1]
      : "image/png";
  const dataUrl = `data:${mimeType};base64,${base64Data}`;

  const colorPrompt =
    targetColor === "transparent"
      ? "a transparent background (alpha channel = 0)"
      : `a solid ${targetColor} background`;

  const promptText = `Please remove the background from this passport photo. 
  
  CRITICAL INSTRUCTIONS:
  1. Return ONLY the subject with ${colorPrompt}.
  2. Ensure the edges around hair and clothing are clean, sharp, and professional.
  3. The subject should be centered and properly framed.
  4. Return ONLY the processed image data as a base64-encoded image wrapped in a data URL (e.g. data:image/png;base64,...).`;

  const ai = createAIClient();

  const response = await ai.models.generateContent({
    model: normalizeGeminiModel(AI_MODEL),
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: promptText,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("AI failed to remove the background");
}
