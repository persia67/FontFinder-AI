import { GoogleGenAI, Type } from "@google/genai";

export interface FontInfo {
  name: string;
  confidence: number;
  isFree: boolean;
  downloadUrl: string;
  description: string;
  sampleCharacters: {
    english: string[];
    persian: string[];
    numbers: string[];
  };
}

export async function identifyFonts(base64Image: string): Promise<FontInfo[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the provided image and identify the fonts used in it. 
    For each distinct font found, provide its name, whether it's free or paid, a likely download or info URL, and a brief description.
    Also, provide a set of sample characters (English letters, Persian/Arabic letters, and numbers) that represent this font.
    
    Return the data in a strict JSON format as an array of objects.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            isFree: { type: Type.BOOLEAN },
            downloadUrl: { type: Type.STRING },
            description: { type: Type.STRING },
            sampleCharacters: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.ARRAY, items: { type: Type.STRING } },
                persian: { type: Type.ARRAY, items: { type: Type.STRING } },
                numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["english", "persian", "numbers"],
            },
          },
          required: ["name", "confidence", "isFree", "downloadUrl", "description", "sampleCharacters"],
        },
      },
    },
  });

  try {
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
