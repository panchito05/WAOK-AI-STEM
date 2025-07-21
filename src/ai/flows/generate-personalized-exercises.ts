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

  IMPORTANT: 
  - Interpret the topic freely and generate appropriate mathematical exercises
  - Adapt the format to the mathematical concept requested
  - For basic operations (suma, resta, etc.): show as "25 + 17 = ?"
  - For mathematical concepts: create exercises that demonstrate the concept
  - For properties: show examples and verification exercises
  - NO word problems or story problems
  
  Adapt difficulty to level:
  - Beginner: Simple numbers, basic concepts
  - Intermediate: Moderate complexity
  - Advanced: Complex problems, larger numbers

  Examples of how to interpret topics:
  - "propiedades conmutativas" → "3 + 5 = ? y 5 + 3 = ?" or "Verifica: 7 × 4 = 4 × 7"
  - "números primos" → "¿Es 17 primo?" or "Encuentra el siguiente primo después de 23"
  - "fracciones" → "1/2 + 1/4 = ?" or "Simplifica: 6/8 = ?"
  
  Return JSON with problem, solution, and brief explanation for each exercise.`,
});

const generatePersonalizedExercisesFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedExercisesFlow',
    inputSchema: GeneratePersonalizedExercisesInputSchema,
    outputSchema: GeneratePersonalizedExercisesOutputSchema,
  },
  async input => {
    const {output} = await generatePersonalizedExercisesPrompt(input);
    return output!;
  }
);
