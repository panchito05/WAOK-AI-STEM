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
  structuredExamples: z.array(z.object({
    problem: z.string(),
    solution: z.string(),
    explanation: z.string()
  })).optional().describe('Structured examples with complete problem, solution, and explanation.'),
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
  prompt: `<thinking>
  I need to generate 5 mathematical exercises. Let me carefully analyze what's required:
  - Level: {{{level}}}
  - Topic: {{{topic}}}
  {{#if structuredExamples}}
  - I have structured examples to follow. I must analyze the number range and operation type used in these examples.
  {{/if}}
  
  Let me identify the specific operation required:
  - If topic contains "suma", "adición", or "addition" → ONLY use addition (+)
  - If topic contains "resta", "substracción", or "subtraction" → ONLY use subtraction (-)
  - If topic contains "multiplicación", "producto", or "multiplication" → ONLY use multiplication (× or *)
  - If topic contains "división" or "division" → ONLY use division (÷ or /)
  </thinking>

  Generate exactly 5 mathematical exercises for the topic: {{{topic}}}

  **CRITICAL OPERATION RULE:**
  - Topic is "{{{topic}}}"
  - You MUST ONLY generate exercises that match this operation type
  - If the topic is "Resta" or contains "subtraction", ALL exercises MUST use subtraction (-)
  - If the topic is "Suma" or contains "addition", ALL exercises MUST use addition (+)
  - NEVER mix operations - ALL 5 exercises must use the SAME operation

  {{#if structuredExamples}}
  **MANDATORY: You MUST follow these examples EXACTLY:**
  {{#each structuredExamples}}
  Example {{@index}}:
  - Problem: {{{this.problem}}}
  - Solution: {{{this.solution}}}
  - Explanation: {{{this.explanation}}}
  {{/each}}
  
  **CRITICAL NUMBER RANGE RULE:**
  - Analyze the numbers in the examples above
  - If examples use 35, 45, 90, 105 → Use ONLY numbers in range 30-110
  - If examples use 1, 2, 3 → Use ONLY numbers in range 1-10
  - NEVER deviate from the number range shown in examples
  
  Generate exercises that:
  1. Use the EXACT same operation as shown in the topic and examples
  2. Use the EXACT same number range as the examples
  3. Follow the EXACT same problem format
  4. Have mathematically CORRECT solutions (NEVER use "Ver solución" or placeholders)
  5. Each solution MUST be a numeric value, properly calculated
  {{else if examples}}
  **MANDATORY: Follow these example patterns:**
  {{#each examples}}
  - {{{this}}}
  {{/each}}
  
  Analyze the operation type and number range, use ONLY the same operation and similar numbers.
  {{/if}}

  {{#unless examples}}
  For topic "{{{topic}}}" at {{{level}}} level:
  - Beginner: numbers 1-10
  - Intermediate: numbers 10-50  
  - Advanced: numbers 50-100+
  - ALL exercises MUST use the operation specified in the topic
  {{/unless}}
  
  Return JSON with problem, solution, and explanation for each exercise.`,
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
