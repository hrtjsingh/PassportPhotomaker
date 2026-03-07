import { createAIClient, AI_MODEL, extractDataUrlFromText, normalizeGeminiModel } from "./aiClient";

export async function aiEnhanceImage(base64Image: string): Promise<string> {
  const ai = createAIClient();

  // Remove data:image/png;base64, prefix if present
  const base64Data = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

  const promptText = `Please enhance the quality of this passport photo. 
  
  CRITICAL INSTRUCTIONS:
  1. Improve clarity and sharpness for a high-resolution professional look.
  2. CORRECT LIGHTING: Ensure even lighting across the entire face. Remove harsh shadows, especially under the eyes, nose, and chin. 
  3. Ensure the subject is well-lit and the colors are natural and balanced.
  4. Maintain the original features and identity of the person accurately.
  5. Return ONLY the processed image data.`;

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

  throw new Error('AI failed to generate an enhanced image');
}
