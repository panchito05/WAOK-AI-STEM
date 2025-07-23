// API Client for Netlify Functions
// This replaces Next.js server actions with fetch calls to Netlify Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML instead of JSON. URL might be incorrect:', url);
      return { error: 'Invalid API endpoint - received HTML instead of JSON' };
    }

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Request failed' };
    }

    return result;
  } catch (error) {
    console.error('API request failed:', error);
    return { error: 'Network error' };
  }
}

// Generate Exercises
export async function generateExercises(data: { level: string; topic: string }) {
  return fetchAPI<any[]>('/api/generate-exercises', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Solve Visually
export async function solveVisually(photoDataUri: string) {
  return fetchAPI<string>('/api/solve-visually', {
    method: 'POST',
    body: JSON.stringify({ photoDataUri }),
  });
}

// Correct Spelling
export async function correctSpelling(text: string, useAI: boolean = false) {
  return fetchAPI<{
    correctedText: string;
    color: string;
    icon: string;
    confidence?: number;
  }>('/api/correct-spelling', {
    method: 'POST',
    body: JSON.stringify({ text, useAI }),
  });
}

// Generate Practice Session
export async function generatePracticeSession(card: {
  topic: string;
  difficulty: number;
  customInstructions?: string;
  exerciseCount: number;
  levelExamples?: { [level: number]: string[] };
  structuredExamples?: { [level: number]: { problem: string; solution: string; explanation: string }[] };
}) {
  return fetchAPI<any[]>('/api/generate-practice', {
    method: 'POST',
    body: JSON.stringify(card),
  });
}

// Check Answer
export async function checkAnswer(data: {
  problem: string;
  correctAnswer: string;
  userAnswer: string;
  attemptNumber: number;
}) {
  return fetchAPI<{
    isCorrect: boolean;
    message: string;
  }>('/api/check-answer', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Generate Examples for Single Level
export async function generateExamplesForSingleLevel(topic: string, level: number, customInstructions?: string, count?: number) {
  return fetchAPI<{ [level: number]: any[] }>('/api/generate-single-level', {
    method: 'POST',
    body: JSON.stringify({ topic, level, customInstructions, count }),
  });
}

// Export as a namespace for easier migration from server actions
export const api = {
  generateExercises,
  solveVisually,
  correctSpelling,
  generatePracticeSession,
  checkAnswer,
  generateExamplesForSingleLevel,
};