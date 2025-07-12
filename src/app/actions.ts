'use server';

import { generatePersonalizedExercises } from '@/ai/flows/generate-personalized-exercises';
import { solveMathProblemVisually } from '@/ai/flows/solve-math-problems-visually';
import { z } from 'zod';

const generateExercisesSchema = z.object({
  level: z.string(),
  topic: z.string(),
});

export async function generateExercisesAction(formData: FormData) {
  const rawData = {
    level: formData.get('level'),
    topic: formData.get('topic'),
  };

  const validatedData = generateExercisesSchema.safeParse(rawData);

  if (!validatedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await generatePersonalizedExercises(validatedData.data);
    return { data: result.exercises };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate exercises. Please try again.' };
  }
}

const solveVisuallySchema = z.object({
  photoDataUri: z.string(),
});

export async function solveVisuallyAction(photoDataUri: string) {
  const validatedData = solveVisuallySchema.safeParse({ photoDataUri });

  if (!validatedData.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await solveMathProblemVisually(validatedData.data);
    return { data: result.solution };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to solve the problem. Please try again.' };
  }
}
