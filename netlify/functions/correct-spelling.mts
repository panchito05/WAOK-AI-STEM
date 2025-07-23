import type { Context, Config } from "@netlify/functions";
import { z } from 'zod';

const correctSpellingSchema = z.object({
  text: z.string(),
  useAI: z.boolean().optional().default(false),
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
    const validatedData = correctSpellingSchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: validatedData.error }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const { text, useAI } = validatedData.data;

    try {
      if (useAI) {
        // AI-based correction
        const { correctMathTopic } = await import('../../src/ai/flows/correct-math-topic');
        const aiResult = await correctMathTopic({ text });
        
        // If AI has high confidence, use its correction
        if (aiResult.confidence > 0.7) {
          const { findTopicConfig } = await import('../../src/lib/topic-mapping');
          const config = findTopicConfig(aiResult.correctedTopic);
          
          return new Response(JSON.stringify({
            data: {
              correctedText: aiResult.correctedTopic,
              color: config.color,
              icon: config.icon,
              confidence: aiResult.confidence
            }
          }), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          });
        }
      }

      // Static correction (fallback or when not using AI)
      const { getNormalizedTopicName, findTopicConfig } = await import('../../src/lib/topic-mapping');
      const correctedText = getNormalizedTopicName(text);
      const config = findTopicConfig(correctedText);
      
      return new Response(JSON.stringify({
        data: {
          correctedText,
          color: config.color,
          icon: config.icon,
          confidence: useAI ? 0.5 : 1.0 // Medium confidence for AI fallback, high for static
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error in correction process:', error);
      
      // Ultimate fallback
      const { getNormalizedTopicName, findTopicConfig } = await import('../../src/lib/topic-mapping');
      const correctedText = getNormalizedTopicName(text);
      const config = findTopicConfig(correctedText);
      
      return new Response(JSON.stringify({
        data: {
          correctedText,
          color: config.color,
          icon: config.icon,
          confidence: 0.3 // Low confidence for fallback
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Error correcting spelling:', error);
    return new Response(JSON.stringify({ error: 'Failed to correct spelling' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const config: Config = {
  path: "/api/correct-spelling"
};