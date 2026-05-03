import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const simplifyNotice = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        text: `You are an expert Government Notice Simplifier for citizens of Karnataka. 
        Analyze the following government notice text.
        1. Extract a clear, concise Title.
        2. Provide a 'Plain Language' Summary in English (no legal jargon).
        3. Provide the same 'Plain Language' Summary in Kannada.
        4. Identify exactly what the citizen MUST do (Action Plan).
        5. Extract all specific Deadlines/Dates.
        6. Identify any Fees or Costs.
        7. Identify who is Eligible.
        
        The summaries should be extremely easy to understand for a common person.
        
        Notice Text:
        ${text}`,
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summaryEn: { type: Type.STRING },
          summaryKn: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Legal", "Health", "Education", "Employment", "Other"] },
          deadlines: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                date: { type: Type.STRING, description: "ISO format date" },
                isUrgent: { type: Type.BOOLEAN }
              },
              required: ["label", "date"]
            }
          },
          fees: { type: Type.STRING },
          eligibility: { type: Type.STRING },
          actions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "summaryEn", "summaryKn", "category", "deadlines", "actions"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not simplify the notice. Please try again.");
  }
};
