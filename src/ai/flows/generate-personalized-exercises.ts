'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized math exercises for students.
 *
 * The flow takes the student's level and topic as input and returns a set of math exercises tailored to their needs.
 *
 * @interface GeneratePersonalizedExercisesInput - The input type for the generatePersonalizedExercises function.
 * @interface GeneratePersonalizedExercisesOutput - The output type for the generatePersonalizedExercises function.
 * @function generatePersonalizedExercises - A function that generates personalized math exercises for a student.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedExercisesInputSchema = z.object({
  level: z.string().describe('The student\'s level (e.g., beginner, intermediate, advanced).'),
  topic: z.string().describe('The math topic for which to generate exercises (e.g., addition, subtraction, algebra).'),
  examples: z.array(z.string()).optional().describe('Example exercises to follow for format and style.'),
});
export type GeneratePersonalizedExercisesInput = z.infer<
  typeof GeneratePersonalizedExercisesInputSchema
>;

const GeneratePersonalizedExercisesOutputSchema = z.object({
  exercises: z
    .array(z.object({
      problem: z.string().describe('The math problem to solve'),
      solution: z.string().describe('The solution to the problem'),
      explanation: z.string().describe('Step-by-step explanation of how to solve it')
    }))
    .describe('A list of math exercises tailored to the student\'s level and topic.'),
});
export type GeneratePersonalizedExercisesOutput = z.infer<
  typeof GeneratePersonalizedExercisesOutputSchema
>;

export async function generatePersonalizedExercises(
  input: GeneratePersonalizedExercisesInput
): Promise<GeneratePersonalizedExercisesOutput> {
  return generatePersonalizedExercisesFlow(input);
}

const generatePersonalizedExercisesPrompt = ai.definePrompt({
  name: 'generatePersonalizedExercisesPrompt',
  input: {schema: GeneratePersonalizedExercisesInputSchema},
  output: {schema: GeneratePersonalizedExercisesOutputSchema},
  prompt: `Generate 5 mathematical exercises for:

  Level: {{{level}}}
  Topic: {{{topic}}}
  {{#if examples}}
  
  CRITICAL - YOU MUST FOLLOW THESE EXACT EXAMPLES:
  {{#each examples}}
  - {{{this}}}
  {{/each}}
  
  STRICT RULES FOR EXAMPLES:
  1. ANALYZE the number range in the examples (e.g., if examples use 1-3, you MUST use 1-3)
  2. COPY the exact format and structure
  3. If example shows "1 + 2 = ?", generate similar like "2 + 1 = ?", NOT "20 + 30 = ?"
  4. If example shows "1 + ? = 3", generate similar like "2 + ? = 3", keeping same range
  5. MAINTAIN the same difficulty - don't make it harder or easier
  6. ALL ANSWERS MUST BE MATHEMATICALLY CORRECT - verify your calculations!
  {{/if}}

  MATHEMATICAL ACCURACY: 
  - DOUBLE CHECK all calculations before providing the solution
  - Solutions MUST be mathematically correct (e.g., 4 + 1 = 5, not 7)
  - If unsure, recalculate before finalizing
  {{#if examples}}
  - Use ONLY numbers in the same range as the examples provided
  - If examples use single digits (1-9), use ONLY single digits
  - If examples use two digits (10-99), use ONLY two digits
  {{else}}
  - Adapt the format to the mathematical concept requested
  - For basic operations (suma, resta, etc.): show as "25 + 17 = ?"
  - For mathematical concepts: create exercises that demonstrate the concept
  - For properties: show examples and verification exercises
  {{/if}}
  - NO word problems or story problems
  
  {{#unless examples}}
  Adapt difficulty to level:
  - Beginner: Simple numbers (1-10), basic concepts
  - Intermediate: Moderate complexity (1-50)
  - Advanced: Complex problems, larger numbers (1-100+)

  Examples of how to interpret topics:
  - "propiedades conmutativas" → "3 + 5 = ? y 5 + 3 = ?" or "Verifica: 7 × 4 = 4 × 7"
  - "números primos" → "¿Es 17 primo?" or "Encuentra el siguiente primo después de 23"
  - "fracciones" → "1/2 + 1/4 = ?" or "Simplifica: 6/8 = ?"
  {{/unless}}
  
  Return JSON with problem, solution (VERIFIED TO BE CORRECT), and brief explanation.`,
});

const generatePersonalizedExercisesFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedExercisesFlow',
    inputSchema: GeneratePersonalizedExercisesInputSchema,
    outputSchema: GeneratePersonalizedExercisesOutputSchema,
  },
  async input => {
    try {
      const {output} = await generatePersonalizedExercisesPrompt(input);
      
      // Log the raw output for debugging
      console.log('[Genkit] Raw AI output:', JSON.stringify(output, null, 2));
      
      // Validate output structure
      if (!output || !output.exercises || !Array.isArray(output.exercises)) {
        console.error('[Genkit] Invalid output structure:', output);
        throw new Error('AI returned invalid structure');
      }
      
      // Validate each exercise
      const validExercises = output.exercises.filter(ex => 
        ex && ex.problem && ex.solution && ex.explanation
      );
      
      if (validExercises.length === 0) {
        console.error('[Genkit] No valid exercises in output:', output.exercises);
        throw new Error('No valid exercises generated');
      }
      
      return { exercises: validExercises };
    } catch (error) {
      console.error('[Genkit] Error in flow:', error);
      throw error;
    }
  }
);
