import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyB68NBwShEPfGFZ2ub8twJSuqreEluC2fk"
});

export async function POST(request: NextRequest) {
  try {
    // Get the base64 image data from request body
    const body = await request.json();
    const { imageData, mimeType } = body;

    if (!imageData) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, JPG, or PNG' },
        { status: 400 }
      );
    }

    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    console.log("Processing image data directly from memory");

    // Generate content with structured output using inline data
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Analyze this fruit image and provide detailed information."
            }
          ]
        }
      ],
      config: {
        systemInstruction: "You are a fruit quality assessment expert. Analyze the fruit image and provide detailed information about the fruit including its name, freshness level, quality status, whether it's consumable/healthy, health benefits, and its peak season.",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            fruit_name: {
              type: "string",
              description: "Name of the fruit"
            },
            freshness: {
              type: "string",
              description: "Freshness level: Fresh, Moderate, Poor, Overripe, etc."
            },
            quality_status: {
              type: "string",
              description: "Overall quality: Excellent, Good, Fair, Poor"
            },
            consumable: {
              type: "boolean",
              description: "Whether the fruit is safe to consume"
            },
            healthy_for_consumption: {
              type: "string",
              description: "Health status: Healthy, Moderately Healthy, Not Recommended"
            },
            health_benefits: {
              type: "array",
              items: { type: "string" },
              description: "Key health benefits of this fruit"
            },
            season: {
              type: "string",
              description: "Peak season for this fruit"
            },
            additional_notes: {
              type: "string",
              description: "Any additional observations"
            }
          },
          required: ["fruit_name", "freshness", "quality_status", "consumable", "healthy_for_consumption", "health_benefits", "season"]
        }
      }
    });

    // Parse the JSON response
    const result = JSON.parse(response.text || '{}');

    // Return the analysis results
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Error analyzing fruit:", error);

    return NextResponse.json(
      { error: error.message || 'An error occurred during analysis' },
      { status: 500 }
    );
  }
}

// Configure API route
export const maxDuration = 60;