import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

const isDemoMode = !process.env.GEMINI_API_KEY;

// Error types for better error handling
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class ValidationError extends APIError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

class AIServiceError extends APIError {
  constructor(message: string, public originalError?: unknown) {
    super(message, 503, 'AI_SERVICE_ERROR');
    this.name = 'AIServiceError';
  }
}

// Validate journal entry input
function validateJournalEntry(entry: string, periodName: string): void {
  if (!entry || typeof entry !== 'string') {
    throw new ValidationError(`${periodName} entry is required and must be a string`);
  }
  
  const trimmed = entry.trim();
  if (trimmed.length === 0) {
    throw new ValidationError(`${periodName} entry cannot be empty`);
  }
  
  if (trimmed.length > 5000) {
    throw new ValidationError(`${periodName} entry exceeds maximum length of 5000 characters`);
  }
}

// Validate and sanitize JSON response from AI
function validateAnalysisResponse(data: any): void {
  const requiredPeriods = ['morning', 'afternoon', 'evening'];
  const validMoods = ['Happy', 'Sad', 'Anxious', 'Excited', 'Stressed', 'Angry', 'Content', 'Confused', 'Hopeful', 'Neutral'];
  
  // Check structure
  for (const period of requiredPeriods) {
    if (!data[period]) {
      throw new ValidationError(`Missing ${period} analysis in response`);
    }
    
    const analysis = data[period];
    
    // Validate mood
    if (!validMoods.includes(analysis.mood)) {
      throw new ValidationError(`Invalid mood "${analysis.mood}" for ${period}`);
    }
    
    // Validate score
    const score = Number(analysis.score);
    if (isNaN(score) || score < 1 || score > 10) {
      throw new ValidationError(`Invalid score for ${period}: must be between 1-10`);
    }
    data[period].score = score;
    
    // Validate required fields
    if (!analysis.tips || typeof analysis.tips !== 'string') {
      throw new ValidationError(`Missing or invalid tips for ${period}`);
    }
    if (!analysis.insights || typeof analysis.insights !== 'string') {
      throw new ValidationError(`Missing or invalid insights for ${period}`);
    }
  }
  
  // Validate daily summary
  if (!data.dailySummary) {
    throw new ValidationError('Missing dailySummary in response');
  }
  
  const summary = data.dailySummary;
  
  if (!validMoods.includes(summary.overallMood)) {
    throw new ValidationError(`Invalid overall mood: ${summary.overallMood}`);
  }
  
  const avgScore = Number(summary.avgScore);
  if (isNaN(avgScore) || avgScore < 0 || avgScore > 10) {
    throw new ValidationError('Invalid avgScore: must be between 0-10');
  }
  data.dailySummary.avgScore = avgScore;
  
  if (!summary.summary || !summary.recommendations) {
    throw new ValidationError('Missing summary or recommendations');
  }
}

// Retry logic with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Log each attempt's error for debugging
      console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, {
        name: lastError.name,
        message: lastError.message,
        stack: lastError.stack?.split('\n').slice(0, 3).join('\n')
      });
      
      // Don't retry validation errors or API errors
      if (error instanceof ValidationError || error instanceof APIError) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }
      
      // Exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new AIServiceError(
    `Operation failed after ${maxRetries} attempts: ${lastError!.message}`,
    lastError!
  );
}

async function analyzeWithGemini(morning: string, afternoon: string, evening: string) {
  // Validate inputs
  validateJournalEntry(morning, 'Morning');
  validateJournalEntry(afternoon, 'Afternoon');
  validateJournalEntry(evening, 'Evening');

  if (isDemoMode) {
    throw new APIError(
      'AI service is not configured. Please add GEMINI_API_KEY to environment variables.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  return withRetry(async () => {
    try {
      const prompt = `You are a mental wellness AI assistant. Analyze these three journal entries from one person's day and provide a comprehensive emotional analysis.

MORNING ENTRY:
"${morning}"

AFTERNOON ENTRY:
"${afternoon}"

EVENING ENTRY:
"${evening}"

Return ONLY a valid JSON object with NO markdown, NO code blocks, NO additional text. The response must be pure JSON:

{
  "morning": {
    "mood": "one of [Happy, Sad, Anxious, Excited, Stressed, Angry, Content, Confused, Hopeful, Neutral]",
    "score": number between 1-10,
    "tips": "one actionable suggestion (max 100 chars)",
    "insights": "brief explanation (max 150 chars)"
  },
  "afternoon": {
    "mood": "one of [Happy, Sad, Anxious, Excited, Stressed, Angry, Content, Confused, Hopeful, Neutral]",
    "score": number between 1-10,
    "tips": "one actionable suggestion (max 100 chars)",
    "insights": "brief explanation (max 150 chars)"
  },
  "evening": {
    "mood": "one of [Happy, Sad, Anxious, Excited, Stressed, Angry, Content, Confused, Hopeful, Neutral]",
    "score": number between 1-10,
    "tips": "one actionable suggestion (max 100 chars)",
    "insights": "brief explanation (max 150 chars)"
  },
  "dailySummary": {
    "overallMood": "the dominant mood from the entire day",
    "avgScore": weighted average score considering emotional progression (decimal number 0-10),
    "summary": "brief overview of emotional patterns throughout the day (max 200 chars)",
    "recommendations": "personalized wellness advice based on all three entries (max 150 chars)"
  }
}

Important: 
- avgScore should be a weighted average, giving more weight to the evening mood as it often reflects the cumulative day
- Consider emotional progression when determining overallMood
- Return pure JSON only, no formatting`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (!response || !response.text) {
        throw new AIServiceError('Empty response from AI service');
      }

      const text = response.text.trim();
      
      console.log('Raw AI response:', text.substring(0, 200) + '...');
      
      // Remove markdown code blocks if present
      const jsonText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('JSON parse error. Response text:', text);
        throw new AIServiceError(
          'Failed to parse AI response as JSON',
          parseError
        );
      }
      
      // Validate the parsed response
      validateAnalysisResponse(parsed);
      
      return parsed;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AIServiceError) {
        throw error;
      }
      
      // Log the actual error from the AI service
      console.error('Gemini API call error:', error);
      
      throw new AIServiceError('Failed to analyze journal entries', error);
    }
  });
}

async function generateMonthlyInsights(entries: any[]) {
  // Validate entries
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new ValidationError('Entries must be a non-empty array');
  }

  if (isDemoMode) {
    throw new APIError(
      'AI service is not configured. Please add GEMINI_API_KEY to environment variables.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  return withRetry(async () => {
    try {
      const entrySummary = entries
        .map((e: any) => {
          if (!e.date || !e.dailySummary) {
            throw new ValidationError('Invalid entry format in monthly data');
          }
          return `${e.date}: ${e.dailySummary.overallMood} (${e.dailySummary.avgScore})`;
        })
        .join(', ');
      
      const prompt = `Analyze these ${entries.length} days of journal entries and generate comprehensive monthly insights. Return ONLY valid JSON with NO markdown:

{
  "patterns": "recurring habits and behaviors (max 200 chars)",
  "trends": "emotional patterns identified over the month (max 200 chars)",
  "triggers": "situations or events that affect mood (max 200 chars)",
  "recommendations": "long-term wellness strategies (max 200 chars)",
  "highlights": "positive achievements and good moments (max 200 chars)",
  "growth": "areas for improvement with gentle suggestions (max 200 chars)"
}

Entries summary: ${entrySummary}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (!response || !response.text) {
        throw new AIServiceError('Empty response from AI service');
      }

      const text = response.text.trim();
      const jsonText = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      let parsed: any;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        throw new AIServiceError(
          'Failed to parse monthly insights as JSON',
          parseError
        );
      }
      
      // Validate required fields
      const requiredFields = ['patterns', 'trends', 'triggers', 'recommendations', 'highlights', 'growth'];
      for (const field of requiredFields) {
        if (!parsed[field] || typeof parsed[field] !== 'string') {
          throw new ValidationError(`Missing or invalid field: ${field}`);
        }
      }
      
      return parsed;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError('Failed to generate monthly insights', error);
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    let body: any;
    
    try {
      body = await request.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body');
    }

    const { type, morning, afternoon, evening, entries } = body;

    if (!type || typeof type !== 'string') {
      throw new ValidationError('Request type is required');
    }

    if (type === 'daily') {
      const analysis = await analyzeWithGemini(morning, afternoon, evening);
      return NextResponse.json(analysis);
      
    } else if (type === 'monthly') {
      const insights = await generateMonthlyInsights(entries);
      return NextResponse.json({ insights });
      
    } else {
      throw new ValidationError(`Invalid request type: ${type}. Must be 'daily' or 'monthly'`);
    }

  } catch (error) {
    // Log error details for debugging
    console.error('API Error Details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      originalError: error instanceof AIServiceError && error.originalError 
        ? {
            name: error.originalError instanceof Error ? error.originalError.name : 'Unknown',
            message: error.originalError instanceof Error ? error.originalError.message : String(error.originalError)
          }
        : undefined,
      timestamp: new Date().toISOString()
    });

    // Handle known error types
    if (error instanceof APIError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          statusCode: error.statusCode
        },
        { status: error.statusCode }
      );
    }

    // Handle unexpected errors
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      },
      { status: 500 }
    );
  }
}

// Log initialization status
console.log('Gemini API Status:', isDemoMode 
  ? '❌ Not configured (GEMINI_API_KEY missing)' 
  : '✅ Configured and ready'
);