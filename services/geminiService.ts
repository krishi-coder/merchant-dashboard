
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult } from "../types";

export const extractBillData = async (base64Image: string): Promise<ExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        {
          text: `You are an expert cloth merchant accountant. 
          Extract the party/customer name and the grand total amount from this bill. 
          Also, extract a list of specific cloth items or descriptions (e.g., 'Cotton Silk', '2m Fabric').
          If the handwriting is messy, make your best guess for the merchant's records. 
          Return a clean JSON object.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerName: { type: Type.STRING, description: "The name of the party or customer." },
          amount: { type: Type.NUMBER, description: "The final total bill amount." },
          items: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of items or fabric descriptions."
          },
          date: { type: Type.STRING, description: "The date of transaction (YYYY-MM-DD)." }
        },
        required: ["customerName", "amount"]
      }
    },
  });

  try {
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data as ExtractionResult;
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("AI could not read the bill clearly. Please retry or enter manually.");
  }
};
