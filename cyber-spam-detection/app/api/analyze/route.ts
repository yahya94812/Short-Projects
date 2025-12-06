import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with API key
const apiKey: any = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

interface EmailRequest {
  type: 'email';
  subject: string;
  body: string;
  sender?: string;
}

interface URLRequest {
  type: 'url';
  url: string;
}

type AnalyzeRequest = EmailRequest | URLRequest;

interface DetectionResponse {
  spam: boolean;
  description: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<DetectionResponse | { error: string }>> {
  try {
    const body: AnalyzeRequest = await request.json();

    let prompt: string;

    if (body.type === 'email') {
      const { subject, body: emailBody, sender } = body;

      if (!subject || !emailBody) {
        return NextResponse.json(
          { error: 'Subject and body are required for email analysis' },
          { status: 400 }
        );
      }

      prompt = `Analyze this email for spam characteristics:
        
Subject: ${subject}
Sender: ${sender || 'Unknown'}
Body: ${emailBody}

Determine if this is spam and provide a brief explanation. 
Respond in this exact format:
SPAM: [true/false]
DESCRIPTION: [brief explanation in one sentence]`;
    } else if (body.type === 'url') {
      const { url } = body;

      if (!url) {
        return NextResponse.json(
          { error: 'URL is required for URL analysis' },
          { status: 400 }
        );
      }

      prompt = `Analyze this URL for phishing characteristics:

URL: ${url}

Determine if this appears to be a phishing URL based on:
- Suspicious domains
- Misspellings of popular sites
- Unusual characters or patterns
- Known phishing indicators

Respond in this exact format:
SPAM: [true/false]
DESCRIPTION: [brief explanation in one sentence]`;
    } else {
      return NextResponse.json(
        { error: 'Invalid request type. Must be "email" or "url"' },
        { status: 400 }
      );
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const lines = text.split('\n');

    let spamValue = false;
    let description = 'Unable to analyze';

    for (const line of lines) {
      if (line.startsWith('SPAM:')) {
        spamValue = line.toLowerCase().includes('true');
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.replace('DESCRIPTION:', '').trim();
      }
    }

    return NextResponse.json({ spam: spamValue, description });
  } catch (error) {
    console.error('Error analyzing:', error);
    return NextResponse.json(
      { error: `Error analyzing: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Spam & Phishing Detection API',
    usage: 'POST /api/analyze with { type: "email", subject, body, sender? } or { type: "url", url }',
  });
}
