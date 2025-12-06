import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "AIzaSyB68NBwShEPfGFZ2ub8twJSuqreEluC2fk"
});

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, JPG, or PNG' },
        { status: 400 }
      );
    }

    // Convert file to buffer and save temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temporary file path
    const tmpDir = join(process.cwd(), 'tmp');
    const fileName = `${uuidv4()}.${file.type.split('/')[1]}`;
    tempFilePath = join(tmpDir, fileName);

    // Ensure tmp directory exists
    try {
      await writeFile(tempFilePath, buffer);
    } catch (error) {
      // If tmp directory doesn't exist, create it
      const fs = require('fs');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      await writeFile(tempFilePath, buffer);
    }

    // Upload the image file to Gemini
    const myfile = await ai.files.upload({
      file: tempFilePath,
      config: { mimeType: file.type },
    });

    console.log("File uploaded successfully:", myfile.uri);

    // Generate content with structured output
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(myfile.uri, myfile.mimeType),
        "Analyze this fruit image and provide detailed information."
      ]),
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
    const result = JSON.parse(response.text);

    // Clean up temporary file
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (error) {
        console.error("Error deleting temporary file:", error);
      }
    }

    // Return the analysis results
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("Error analyzing fruit:", error);

    // Clean up temporary file in case of error
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temporary file:", cleanupError);
      }
    }

    return NextResponse.json(
      { error: error.message || 'An error occurred during analysis' },
      { status: 500 }
    );
  }
}

// Configure API route - disable body parser for file uploads
export const maxDuration = 60;