import type { Context, Config } from "@netlify/functions";
import { generatePersonalizedExercises } from '../../src/ai/flows/generate-personalized-exercises';
import { z } from 'zod';

const generatePracticeSchema = z.object({
  topic: z.string(),
  difficulty: z.number(),
  customInstructions: z.string().optional(),
  exerciseCount: z.number(),
  levelExamples: z.record(z.array(z.string())).optional(),
  structuredExamples: z.record(z.array(z.object({
    problem: z.string(),
    solution: z.string(),
    explanation: z.string()
  }))).optional(),
});

export default async (req: Request, context: Context) => {
  // Log environment info for debugging
  console.log('[generate-practice] Function called at:', new Date().toISOString());
  console.log('[generate-practice] API Key present:', !!Netlify.env.get('GEMINI_API_KEY'));
  console.log('[generate-practice] Environment:', {
    hasNetlifyEnv: typeof Netlify !== 'undefined',
    hasProcessEnv: !!process.env.GEMINI_API_KEY
  });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  let card: any;
  try {
    card = await req.json();
    console.log('[generate-practice] Request data:', {
      topic: card.topic,
      difficulty: card.difficulty,
      exerciseCount: card.exerciseCount,
      hasCustomInstructions: !!card.customInstructions,
      customInstructions: card.customInstructions
    });
    const validatedData = generatePracticeSchema.safeParse(card);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: validatedData.error }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const validatedCard = validatedData.data;
    
    // Get examples for the current difficulty level
    const currentStructuredExamples = validatedCard.structuredExamples?.[validatedCard.difficulty] || [];
    const currentLevelExamples = validatedCard.levelExamples?.[validatedCard.difficulty] || [];
    
    // Generate exercises
    const result = await generatePersonalizedExercises({
      level: validatedCard.difficulty <= 3 ? 'beginner' : validatedCard.difficulty <= 6 ? 'intermediate' : 'advanced',
      topic: validatedCard.topic,
      examples: currentStructuredExamples.length > 0 ? undefined : currentLevelExamples,
      structuredExamples: currentStructuredExamples.length > 0 ? currentStructuredExamples : undefined,
      customInstructions: validatedCard.customInstructions
    });

    // Transform to expected format
    const exercises = result.exercises.map((ex: any, index: number) => ({
      id: `exercise-${index + 1}`,
      problem: ex.problem,
      solution: ex.solution,
      explanation: ex.explanation
    }));

    // Generate more if needed
    while (exercises.length < validatedCard.exerciseCount) {
      const additionalResult = await generatePersonalizedExercises({
        level: validatedCard.difficulty <= 3 ? 'beginner' : validatedCard.difficulty <= 6 ? 'intermediate' : 'advanced',
        topic: validatedCard.topic,
        examples: currentStructuredExamples.length > 0 ? undefined : currentLevelExamples,
        structuredExamples: currentStructuredExamples.length > 0 ? currentStructuredExamples : undefined,
        customInstructions: validatedCard.customInstructions
      });
      
      for (const ex of additionalResult.exercises) {
        if (exercises.length < validatedCard.exerciseCount) {
          exercises.push({
            id: `exercise-${exercises.length + 1}`,
            problem: ex.problem,
            solution: ex.solution,
            explanation: ex.explanation
          });
        }
      }
    }

    return new Response(JSON.stringify({ data: exercises.slice(0, validatedCard.exerciseCount) }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[generate-practice] Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      hasApiKey: !!Netlify.env.get('GEMINI_API_KEY'),
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString()
    });
    
    // Fallback to mock data
    console.log('[generate-practice] Using fallback mock data');
    const mockExercises = generateMockPracticeSession(card || {
      topic: 'unknown',
      difficulty: 1,
      exerciseCount: 5
    });
    
    return new Response(JSON.stringify({ data: mockExercises }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: "/api/generate-practice"
};

// Mock practice session generator
function generateMockPracticeSession(card: any) {
  const exercises = [];
  
  for (let i = 0; i < card.exerciseCount; i++) {
    const baseNum = card.difficulty * 10;
    
    // Generate different types of problems based on topic keywords
    const topicLower = card.topic.toLowerCase();
    let problem, solution, explanation;
    
    if (topicLower.includes('suma') || topicLower.includes('adición') || topicLower.includes('addition')) {
      const a = Math.floor(Math.random() * baseNum) + 1;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} + ${b} = ?`;
      solution = (a + b).toString();
      explanation = `Para resolver ${a} + ${b}, sumamos los números: ${a} + ${b} = ${solution}`;
    } else if (topicLower.includes('resta') || topicLower.includes('substracción') || topicLower.includes('subtraction')) {
      const a = Math.floor(Math.random() * baseNum * 2) + baseNum;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} - ${b} = ?`;
      solution = (a - b).toString();
      explanation = `Para resolver ${a} - ${b}, restamos: ${a} - ${b} = ${solution}`;
    } else if (topicLower.includes('multiplicación') || topicLower.includes('producto') || topicLower.includes('multiplication')) {
      const a = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const b = Math.floor(Math.random() * (baseNum / 2)) + 1;
      problem = `${a} × ${b} = ?`;
      solution = (a * b).toString();
      explanation = `Para resolver ${a} × ${b}, multiplicamos: ${a} × ${b} = ${solution}`;
    } else if (topicLower.includes('división') || topicLower.includes('division')) {
      const b = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const result = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const a = b * result;
      problem = `${a} ÷ ${b} = ?`;
      solution = result.toString();
      explanation = `Para resolver ${a} ÷ ${b}, dividimos: ${a} ÷ ${b} = ${solution}`;
    } else {
      // Generic math problem for any other topic
      const a = Math.floor(Math.random() * baseNum) + 1;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `Ejercicio ${i + 1} de ${card.topic}: ${a} y ${b}`;
      solution = `Solución para ${card.topic}`;
      explanation = `Este es un ejercicio de práctica para ${card.topic}. Con API activa, obtendrás ejercicios específicos.`;
    }
    
    exercises.push({
      id: `exercise-${i + 1}`,
      problem,
      solution,
      explanation
    });
  }
  
  return exercises;
}