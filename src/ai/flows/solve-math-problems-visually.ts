// src/ai/flows/solve-math-problems-visually.ts
'use server';

/**
 * @fileOverview An AI agent to solve math problems visually using a device's camera.
 *
 * - solveMathProblemVisually - A function that handles solving math problems from an image.
 * - SolveMathProblemVisuallyInput - The input type for the solveMathProblemVisually function.
 * - SolveMathProblemVisuallyOutput - The return type for the solveMathProblemVisually function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveMathProblemVisuallyInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a math problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SolveMathProblemVisuallyInput = z.infer<typeof SolveMathProblemVisuallyInputSchema>;

const SolveMathProblemVisuallyOutputSchema = z.object({
  solution: z.string().describe('The solution to the math problem.'),
});
export type SolveMathProblemVisuallyOutput = z.infer<typeof SolveMathProblemVisuallyOutputSchema>;

export async function solveMathProblemVisually(
  input: SolveMathProblemVisuallyInput
): Promise<SolveMathProblemVisuallyOutput> {
  return solveMathProblemVisuallyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveMathProblemVisuallyPrompt',
  input: {schema: SolveMathProblemVisuallyInputSchema},
  output: {schema: SolveMathProblemVisuallyOutputSchema},
  prompt: `You are an expert math solver. You will receive an image of a math problem.  You will solve the math problem and provide the solution. 

Solve the following math problem:

{{media url=photoDataUri}}`,
});

const solveMathProblemVisuallyFlow = ai.defineFlow(
  {
    name: 'solveMathProblemVisuallyFlow',
    inputSchema: SolveMathProblemVisuallyInputSchema,
    outputSchema: SolveMathProblemVisuallyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
