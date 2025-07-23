import type { Context, Config } from "@netlify/functions";
import { solveMathProblemVisually } from '../../src/ai/flows/solve-math-problems-visually';
import { z } from 'zod';

const solveVisuallySchema = z.object({
  photoDataUri: z.string(),
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
    const validatedData = solveVisuallySchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: validatedData.error }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const result = await solveMathProblemVisually(validatedData.data);
    return new Response(JSON.stringify({ data: result.solution }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error solving visually:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      // Return mock solution for testing when API key is missing
      const mockSolution = generateMockVisualSolution();
      return new Response(JSON.stringify({ data: mockSolution }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // For other errors, return detailed message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: `Failed to solve the problem: ${errorMessage}` }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: "/api/solve-visually"
};

// Mock visual solution for testing without API key
function generateMockVisualSolution() {
  const mockProblems = [
    {
      problem: "25 + 17 = ?",
      solution: "42",
      steps: [
        "Primero sumamos las unidades: 5 + 7 = 12",
        "Llevamos 1 a las decenas",
        "Luego sumamos las decenas: 2 + 1 + 1 = 4",
        "Por lo tanto, 25 + 17 = 42"
      ]
    },
    {
      problem: "48 - 23 = ?",
      solution: "25",
      steps: [
        "Restamos las unidades: 8 - 3 = 5",
        "Restamos las decenas: 4 - 2 = 2",
        "Por lo tanto, 48 - 23 = 25"
      ]
    },
    {
      problem: "6 × 7 = ?",
      solution: "42",
      steps: [
        "Multiplicamos 6 por 7",
        "6 × 7 = 42",
        "Podemos verificar sumando 6 siete veces: 6 + 6 + 6 + 6 + 6 + 6 + 6 = 42"
      ]
    },
    {
      problem: "84 ÷ 4 = ?",
      solution: "21",
      steps: [
        "Dividimos 84 entre 4",
        "8 ÷ 4 = 2 (con 0 de resto)",
        "4 ÷ 4 = 1",
        "Por lo tanto, 84 ÷ 4 = 21"
      ]
    }
  ];
  
  // Select a random problem
  const selected = mockProblems[Math.floor(Math.random() * mockProblems.length)];
  
  return `
## Problema detectado: ${selected.problem}

### Solución: ${selected.solution}

### Pasos para resolver:
${selected.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

### Explicación:
Este es un ejemplo de solución generada para pruebas. Con una API key válida de Google Gemini, el sistema puede analizar imágenes reales y resolver problemas matemáticos específicos detectados en las fotos.
  `.trim();
}