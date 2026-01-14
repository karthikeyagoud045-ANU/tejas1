import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from '../types';
import { withAPIKeyFallback, getKeysByProvider } from '../config/apiKeys';

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    severity: {
      type: Type.STRING,
      enum: ['green', 'yellow', 'red'],
      description: "Overall health status severity based on the report."
    },
    keyFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          item: { type: Type.STRING, description: "The specific metric or finding (e.g., 'Blood Sugar')." },
          status: { type: Type.STRING, enum: ['high', 'low', 'normal'], description: "The status of the finding." },
          normalRange: { type: Type.STRING, description: "The normal reference range if available." }
        },
        required: ['item', 'status']
      }
    },
    dos: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of recommended actions."
    },
    donts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of actions to avoid."
    },
    exercises: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of recommended exercises."
    },
    diet: {
      type: Type.OBJECT,
      properties: {
        include: { type: Type.ARRAY, items: { type: Type.STRING } },
        avoid: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ['include', 'avoid']
    }
  },
  required: ['severity', 'keyFindings', 'dos', 'donts', 'exercises', 'diet']
};

const mealSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    meal_name: { type: Type.STRING, description: "Short human title for the meal" },
    meal_type: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'unknown'] },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          estimated_quantity: { type: Type.STRING },
          estimated_calories: { type: Type.NUMBER },
          notes: { type: Type.STRING }
        }
      }
    },
    total_calories: { type: Type.NUMBER },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER, description: "Estimated protein in grams" },
        carbs: { type: Type.NUMBER, description: "Estimated carbs in grams" },
        fat: { type: Type.NUMBER, description: "Estimated fat in grams" }
      },
      required: ['protein', 'carbs', 'fat']
    },
    confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
    explanation: { type: Type.STRING }
  },
  required: ['meal_name', 'meal_type', 'items', 'total_calories', 'macros', 'confidence', 'explanation']
};

export const analyzeMedicalReport = async (
  base64File: string,
  mimeType: string,
  age: string,
  gender: string,
  conditions: string
): Promise<AnalysisResult> => {
  try {
    // Use API key fallback system for automatic retry with different keys
    return await withAPIKeyFallback(async (apiKey: string) => {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        Analyze this medical document image/PDF for a patient.
        Patient Details:
        - Age: ${age || 'Unknown'}
        - Gender: ${gender || 'Unknown'}
        - Existing Conditions: ${conditions || 'None'}

        Extract key findings, determine severity, and provide actionable health, exercise, and diet recommendations.
        Return the output strictly in JSON format.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64File
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          temperature: 0.2
        }
      });

      if (response.text) {
        return JSON.parse(response.text) as AnalysisResult;
      }

      throw new Error("No response text generated");
    });
  } catch (error) {
    console.error("All API keys failed for medical report analysis:", error);
    return {
      severity: 'yellow',
      keyFindings: [{ item: "Analysis Error - All API Keys Failed", status: "normal", normalRange: "N/A" }],
      dos: ["Retry upload", "Check API key configuration"],
      donts: ["Panic"],
      exercises: ["Walking"],
      diet: { include: ["Water"], avoid: ["Stress"] }
    };
  }
};

export const analyzeMeal = async (base64Image: string, mimeType: string): Promise<any> => {
  try {
    // Use API key fallback system for automatic retry with different keys
    return await withAPIKeyFallback(async (apiKey: string) => {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        You are an expert nutrition assistant embedded in a health‑tracking web app called HealthWise AI.
        The user uploads a photo of a meal (often South Indian food like dosa, idli, upma, rice with veg and non‑veg curries, sambar, rasam, curd, etc.).
        Your job is to identify the foods, estimate calories AND MACRONUTRIENTS (protein, carbs, fat), and format a JSON response.
        
        Use this structure exactly:
        {
          "meal_name": "<short human title>",
          "meal_type": "<breakfast | lunch | dinner | snack | unknown>",
          "items": [
            {
              "name": "<food name>",
              "estimated_quantity": "<approx quantity with unit>",
              "estimated_calories": <number, kcal>,
              "notes": "<optional extra context>"
            }
          ],
          "total_calories": <sum of item calories as number>,
          "macros": { "protein": <grams>, "carbs": <grams>, "fat": <grams> },
          "confidence": "<high | medium | low>",
          "explanation": "<1–2 sentence explanation for the user>"
        }

        Image understanding rules:
        - Focus on common Indian dishes, especially South Indian staples.
        - If multiple pieces are visible, estimate count and typical portion sizes.
        - Use typical Indian calorie ranges for these dishes.
        - If the image is not food, return a single item "name": "unknown" with 0 calories and confidence: "low".
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: mealSchema,
          temperature: 0.4
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }

      throw new Error("No response text generated");
    });
  } catch (error) {
    console.error("All API keys failed for meal analysis:", error);
    throw error;
  }
};