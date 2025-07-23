import type { Context, Config } from "@netlify/functions";
import { generatePersonalizedExercises } from '../../src/ai/flows/generate-personalized-exercises';
import { z } from 'zod';

const generateExercisesSchema = z.object({
  level: z.string(),
  topic: z.string(),
});

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const body = await req.json();
    const validatedData = generateExercisesSchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: validatedData.error }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await generatePersonalizedExercises(validatedData.data);
    
    // Ensure exercises have the expected format
    if (!result || !result.exercises || !Array.isArray(result.exercises)) {
      console.error('Invalid result format from AI:', result);
      throw new Error('AI returned invalid format');
    }
    
    // Validate each exercise has required fields
    const validExercises = result.exercises.filter(ex => 
      ex && 
      typeof ex.problem === 'string' && ex.problem.trim() &&
      typeof ex.solution === 'string' && ex.solution.trim() &&
      typeof ex.explanation === 'string' && ex.explanation.trim()
    );
    
    if (validExercises.length === 0) {
      console.error('No valid exercises in AI response:', result.exercises);
      throw new Error('AI returned no valid exercises');
    }
    
    return new Response(JSON.stringify({ data: validExercises }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating exercises:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      // Return mock data for testing when API key is missing
      const mockExercises = generateMockExercises(body.level, body.topic);
      return new Response(JSON.stringify({ data: mockExercises }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // For other errors, return detailed message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Failed to generate exercises: ${errorMessage}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: "/api/generate-exercises"
};

// Mock exercise generator for testing without API key
function generateMockExercises(level: string, topic: string) {
  const exercises = [];
  const count = 5;
  
  // Generate exercises based on topic
  switch (topic.toLowerCase()) {
    case 'addition':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        exercises.push({
          problem: `${a} + ${b} = ?`,
          solution: (a + b).toString(),
          explanation: `${a} + ${b}: ${a} + ${b} = ${a + b}`
        });
      }
      break;
      
    case 'subtraction':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 20) + 10 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 200) + 50 : 
                 Math.floor(Math.random() * 2000) + 500;
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        exercises.push({
          problem: `${a} - ${b} = ?`,
          solution: (a - b).toString(),
          explanation: `${a} - ${b}: ${a} - ${b} = ${a - b}`
        });
      }
      break;
      
    case 'multiplication':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 100) + 1;
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 100) + 1;
        exercises.push({
          problem: `${a} × ${b} = ?`,
          solution: (a * b).toString(),
          explanation: `${a} × ${b}: ${a} × ${b} = ${a * b}`
        });
      }
      break;
      
    case 'division':
      for (let i = 0; i < count; i++) {
        const b = level === 'beginner' ? Math.floor(Math.random() * 9) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 50) + 1;
        const result = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                      level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                      Math.floor(Math.random() * 100) + 1;
        const a = b * result;
        exercises.push({
          problem: `${a} ÷ ${b} = ?`,
          solution: result.toString(),
          explanation: `${a} ÷ ${b}: ${a} ÷ ${b} = ${result}`
        });
      }
      break;
      
    default:
      // For any other topic, generate placeholder exercises
      for (let i = 0; i < count; i++) {
        exercises.push({
          problem: `Ejercicio ${i + 1} de ${topic}`,
          solution: "Ver con API key",
          explanation: `Para ejercicios de "${topic}", active la conexión con Gemini AI para obtener ejercicios específicos y personalizados.`
        });
      }
  }
  
  return exercises;
}