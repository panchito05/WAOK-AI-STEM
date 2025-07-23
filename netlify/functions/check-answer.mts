import type { Context, Config } from "@netlify/functions";
import { z } from 'zod';

const checkAnswerSchema = z.object({
  problem: z.string(),
  correctAnswer: z.string(),
  userAnswer: z.string(),
  attemptNumber: z.number(),
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
    const validatedData = checkAnswerSchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: validatedData.error }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { problem, correctAnswer, userAnswer, attemptNumber } = validatedData.data;
    
    // Normalize answers for comparison
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    const normalizedUser = userAnswer.trim().toLowerCase();
    
    const isCorrect = normalizedCorrect === normalizedUser;
    
    if (isCorrect) {
      return new Response(JSON.stringify({
        data: {
          isCorrect: true,
          message: '¡Excelente! Tu respuesta es correcta. 🎉'
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Generate hint based on attempt number
      let message = '';
      
      if (attemptNumber === 1) {
        message = 'No es correcto. Revisa tu cálculo y vuelve a intentarlo.';
      } else if (attemptNumber === 2) {
        message = 'Todavía no es correcto. Asegúrate de seguir el orden de las operaciones.';
      } else {
        message = 'Sigue intentando. Recuerda verificar cada paso de tu solución.';
      }
      
      return new Response(JSON.stringify({
        data: {
          isCorrect: false,
          message
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return new Response(JSON.stringify({ error: 'Failed to check answer' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: "/api/check-answer"
};