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
  customInstructions: z.string().optional().describe('Custom instructions for exercise generation format and style.'),
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
  console.log('[generatePersonalizedExercises] Called with:', {
    level: input.level,
    topic: input.topic,
    hasExamples: !!input.examples,
    hasStructuredExamples: !!input.structuredExamples,
    hasCustomInstructions: !!input.customInstructions,
    customInstructions: input.customInstructions,
    timestamp: new Date().toISOString()
  });
  
  // Log topic analysis
  const topicLower = input.topic.toLowerCase();
  const isConversionTopic = topicLower.includes('conversión') || topicLower.includes('fracción') || 
                           topicLower.includes('porcentaje') || topicLower.includes('decimal');
  console.log(`[generatePersonalizedExercises] Topic analysis: "${input.topic}" - Is conversion topic: ${isConversionTopic}`);
  
  try {
    const result = await generatePersonalizedExercisesFlow(input);
    console.log('[generatePersonalizedExercises] Success, generated exercises:', result.exercises.length);
    return result;
  } catch (error) {
    console.error('[generatePersonalizedExercises] Error in flow:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error?.constructor?.name,
      hasApiKey: !!process.env.GEMINI_API_KEY || (typeof Netlify !== 'undefined' && !!Netlify?.env?.get('GEMINI_API_KEY'))
    });
    throw error;
  }
}

const generatePersonalizedExercisesPrompt = ai.definePrompt({
  name: 'generatePersonalizedExercisesPrompt',
  input: {schema: GeneratePersonalizedExercisesInputSchema},
  output: {schema: GeneratePersonalizedExercisesOutputSchema},
  prompt: `Generate exactly 5 mathematical exercises.

  Topic: {{{topic}}}
  Level: {{{level}}}
  
  Requirements:
  - Create 5 exercises that are appropriate for the given topic and difficulty level
  - Each exercise must have a clear problem, solution, and step-by-step explanation
  - All exercises must be related to the specified topic
  - Solutions must be mathematically correct and complete

  {{#if customInstructions}}
  **CUSTOM INSTRUCTIONS FROM USER:**
  {{{customInstructions}}}
  
  You MUST follow these custom instructions for formatting and presenting the exercises.
  {{/if}}

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
  Difficulty guidelines:
  - Beginner: Use simple numbers and basic concepts
  - Intermediate: Use moderate complexity
  - Advanced: Use complex numbers and advanced concepts
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
    const maxRetries = 1; // Reduced to avoid quota exhaustion
    let attempts = 0;
    
    while (attempts < maxRetries) {
      attempts++;
      console.log(`[Genkit] Attempt ${attempts}/${maxRetries} for topic "${input.topic}"`);
      
      try {
        const {output} = await generatePersonalizedExercisesPrompt(input);
        
        // Log the raw output for debugging
        console.log('[Genkit] Raw AI output:', JSON.stringify(output, null, 2));
        
        // Validate output structure
        if (!output || !output.exercises || !Array.isArray(output.exercises)) {
          console.error('[Genkit] Invalid output structure:', output);
          if (attempts < maxRetries) continue;
          throw new Error('AI returned invalid structure');
        }
      
      // Validate each exercise with enhanced placeholder detection
      const isValidExercise = (ex: any): boolean => {
        // Basic structure validation
        if (!ex || !ex.problem || !ex.solution || !ex.explanation) {
          return false;
        }
        
        // Detect common placeholder patterns
        const placeholderPatterns = [
          /Ejercicio \d+/i,
          /Respuesta \d+/i,
          /Nivel \d+ - Ejercicio/i,
          /Ejemplo \d+/i,
          /Solución \d+/i,
          /problema \d+$/i,
          /^Ejercicio$/i,
          /^Respuesta$/i
        ];
        
        // Check if any field contains placeholder patterns
        const hasPlaceholder = placeholderPatterns.some(pattern => 
          pattern.test(ex.problem) || 
          pattern.test(ex.solution) || 
          pattern.test(ex.explanation)
        );
        
        // Ensure solution is a valid answer (not a placeholder)
        const hasValidSolution = ex.solution && 
          ex.solution.length > 0 && 
          !ex.solution.toLowerCase().includes('respuesta') &&
          !ex.solution.toLowerCase().includes('solución') &&
          !ex.solution.toLowerCase().includes('ver solución');
        
        return !hasPlaceholder && hasValidSolution;
      };
      
      const validExercises = output.exercises.filter(isValidExercise);
      
      if (validExercises.length === 0) {
        console.error('[Genkit] No valid exercises in output:', output.exercises);
        if (attempts < maxRetries) continue;
        throw new Error('No valid exercises generated');
      }
      
      // Validate that exercises match the topic
      const { validateOperationType } = await import('@/lib/math-validator');
      console.log(`[Genkit] Validating ${validExercises.length} exercises against topic "${input.topic}"`);
      
      const topicValidExercises = validExercises.filter(ex => {
        const validation = validateOperationType(ex.problem, input.topic);
        if (!validation.valid && attempts < maxRetries) {
          console.log(`[Genkit] ❌ Exercise mismatch: "${ex.problem}" - Expected: ${validation.expectedOperation}, Got: ${validation.actualOperation}`);
          return false;
        }
        if (validation.valid) {
          console.log(`[Genkit] ✅ Valid exercise: "${ex.problem}"`);
        }
        return validation.valid;
      });
      
      // Need at least 3 valid exercises that match the topic
      if (topicValidExercises.length >= 3) {
        console.log(`[Genkit] Successfully generated ${topicValidExercises.length} valid exercises for topic "${input.topic}" in ${attempts} attempt(s)`);
        return { exercises: topicValidExercises };
      }
      
      console.log(`[Genkit] Only ${topicValidExercises.length} exercises match topic, need at least 3. Retrying...`);
      if (attempts < maxRetries) continue;
    } catch (error) {
      console.error('[Genkit] Error in attempt', attempts, ':', error);
      if (attempts >= maxRetries) {
        throw new Error(`Failed to generate valid exercises after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    }
    
    // If we get here, all retries failed
    throw new Error(`Failed to generate valid exercises for topic "${input.topic}" after ${maxRetries} attempts`);
  }
);
