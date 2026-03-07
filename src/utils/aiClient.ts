import { GoogleGenAI } from "@google/genai";

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

// Default model for Gemini. Can be overridden via AI_MODEL in your environment.
export const AI_MODEL = process.env.AI_MODEL ?? "google/gemini-2.5-flash-image";

export function createAIClient() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      `Missing API key. Set GEMINI_API_KEY in your environment.`
    );
  }

  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export function normalizeGeminiModel(model: string) {
  // The Gemini SDK expects the model name without a provider prefix.
  return model.replace(/^google\//, "");
}

export function extractDataUrlFromText(text: string): string {
  const match = text.match(/(data:[^;]+;base64,[A-Za-z0-9+/=]+)/);
  if (!match) {
    throw new Error("AI response did not contain a valid base64 data URL");
  }
  return match[1];
}

