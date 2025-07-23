'use server';

import { generatePersonalizedExercises } from '@/ai/flows/generate-personalized-exercises';
import { solveMathProblemVisually } from '@/ai/flows/solve-math-problems-visually';
import { z } from 'zod';
import { StructuredExample, calculateSolution } from '@/lib/storage';

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
    
    return { data: validExercises };
  } catch (error) {
    console.error('Error generating exercises:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      // Don't return mock data - fail properly
      return { error: 'API key is required for generating exercises' };
    }
    
    // For other errors, return detailed message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to generate exercises: ${errorMessage}` };
  }
}

// Mock exercise generator - returns empty array to force AI generation
function generateMockExercises(level: string, topic: string) {
  console.warn(`[generateMockExercises] Called for topic "${topic}" level "${level}" - returning empty array to force AI generation`);
  return [];
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
    console.error('Error solving visually:', error);
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      // Return mock solution for testing when API key is missing
      const mockSolution = generateMockVisualSolution();
      return { data: mockSolution };
    }
    
    // For other errors, return detailed message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to solve the problem: ${errorMessage}` };
  }
}

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

// Spell correction action with color and icon mapping
export async function correctSpellingAction(text: string) {
  try {
    // Import the topic mapping functions
    const { getNormalizedTopicName, findTopicConfig } = await import('@/lib/topic-mapping');
    
    // Get normalized/corrected topic name
    const correctedText = getNormalizedTopicName(text);
    
    // Get color and icon configuration
    const config = findTopicConfig(text);
    
    return { 
      data: {
        correctedText,
        color: config.color,
        icon: config.icon
      }
    };
  } catch (error) {
    console.error('Error correcting spelling:', error);
    return { error: 'Failed to correct spelling' };
  }
}

// Spell correction action using AI for intelligent understanding
export async function correctSpellingWithAIAction(text: string) {
  try {
    // First try AI correction for complex phrases
    const { correctMathTopic } = await import('@/ai/flows/correct-math-topic');
    const aiResult = await correctMathTopic({ text });
    
    // If AI has high confidence, use its correction
    if (aiResult.confidence > 0.7) {
      // Get color and icon configuration for the corrected topic
      const { findTopicConfig } = await import('@/lib/topic-mapping');
      const config = findTopicConfig(aiResult.correctedTopic);
      
      return {
        data: {
          correctedText: aiResult.correctedTopic,
          color: config.color,
          icon: config.icon,
          confidence: aiResult.confidence
        }
      };
    }
    
    // Fallback to static correction if AI confidence is low
    const { getNormalizedTopicName, findTopicConfig } = await import('@/lib/topic-mapping');
    const correctedText = getNormalizedTopicName(text);
    const config = findTopicConfig(correctedText);
    
    return {
      data: {
        correctedText,
        color: config.color,
        icon: config.icon,
        confidence: 0.5 // Medium confidence for static correction
      }
    };
  } catch (error) {
    console.error('Error in AI spelling correction:', error);
    
    // Ultimate fallback to static correction
    try {
      const { getNormalizedTopicName, findTopicConfig } = await import('@/lib/topic-mapping');
      const correctedText = getNormalizedTopicName(text);
      const config = findTopicConfig(correctedText);
      
      return {
        data: {
          correctedText,
          color: config.color,
          icon: config.icon,
          confidence: 0.3 // Low confidence for fallback
        }
      };
    } catch (fallbackError) {
      console.error('Fallback correction also failed:', fallbackError);
      return { error: 'Failed to correct spelling' };
    }
  }
}

// Generate examples for all levels (1-10) for a given topic
export async function generateExamplesForAllLevelsAction(topic: string, customInstructions?: string) {
  try {
    const allExamples: { [level: number]: StructuredExample[] } = {};
    
    // Map level ranges to difficulty strings
    const levelToDifficulty = (level: number): string => {
      if (level <= 3) return 'beginner';
      if (level <= 6) return 'intermediate';
      return 'advanced';
    };
    
    // Generate examples for each level
    for (let level = 1; level <= 10; level++) {
      console.log(`Generating examples for level ${level}...`);
      
      // Add delay to avoid rate limiting (if not first level)
      if (level > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
      
      try {
        // Generate 3 varied examples for this level
        const result = await generatePersonalizedExercises({
          level: levelToDifficulty(level),
          topic: topic,
          structuredExamples: getBaseExamplesForLevel(topic, level),
          customInstructions: customInstructions
          });
        
        if (result.exercises && result.exercises.length >= 3) {
          // Take first 3 exercises and ensure variety
          allExamples[level] = result.exercises.slice(0, 3).map((ex, index) => {
            // Add variety to exercise format based on index
            const variedProblem = varyProblemFormat(ex.problem, index, level);
            return {
              problem: variedProblem,
              solution: ex.solution,
              explanation: ex.explanation
            };
            });
        } else {
          // Log the issue but don't use incorrect fallback examples
          console.error(`[generateExamplesForAllLevels] Failed to generate valid exercises for level ${level}, topic "${topic}"`);
          allExamples[level] = [];
        }
      } catch (error: any) {
        console.error(`Error generating examples for level ${level}:`, error);
        
        // If quota exceeded, stop trying more levels
        if (error?.message?.includes('429') || error?.message?.includes('quota')) {
          console.warn('Quota exceeded, stopping generation for remaining levels');
          // Fill remaining levels with empty arrays
          for (let remainingLevel = level; remainingLevel <= 10; remainingLevel++) {
            allExamples[remainingLevel] = [];
          }
          break; // Exit the loop
        }
        
        // Don't use mock examples - better to have empty than wrong examples
        allExamples[level] = [];
      }
    }
    
    return { data: allExamples };
  } catch (error) {
    console.error('Error generating examples for all levels:', error);
    return { error: 'Failed to generate examples' };
  }
}

// Helper function to vary problem format
function varyProblemFormat(baseProblem: string, index: number, level: number): string {
  // Don't modify conversion exercises
  if (baseProblem.toLowerCase().includes(' a ') || 
      baseProblem.includes('→') ||
      baseProblem.match(/(?:decimal|fracción|porcentaje|razón)/i)) {
    return baseProblem;
  }
  
  // For lower levels, add variety in problem format (only for arithmetic operations)
  if (level <= 3 && index > 0) {
    // Extract numbers from the problem
    const numbers = baseProblem.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const [a, b] = numbers;
      if (index === 1 && baseProblem.includes('+')) {
        return `${a} + ? = ${parseInt(a) + parseInt(b)}`;
      } else if (index === 2 && baseProblem.includes('+')) {
        return `? + ${b} = ${parseInt(a) + parseInt(b)}`;
      }
    }
  }
  return baseProblem;
}

// Get base examples to guide AI generation - returns empty array to let AI generate everything
function getBaseExamplesForLevel(topic: string, level: number): StructuredExample[] {
  console.log(`[getBaseExamplesForLevel] Called for topic "${topic}" level ${level} - returning empty array to let AI generate`);
  return [];
}

// Removed - No hardcoded exercise generation allowed

// Removed - No hardcoded exercise generation allowed

// Removed - No hardcoded exercise generation allowed

// Removed - No hardcoded exercise generation allowed

// Removed - No hardcoded exercise generation allowed

// Get mock examples for fallback - returns empty array to force AI generation
function getMockExamplesForLevel(topic: string, level: number): StructuredExample[] {
  console.warn(`[getMockExamplesForLevel] Called for topic "${topic}" level ${level} - returning empty array to force AI generation`);
  return [];
}

// Generate examples for a single level
export async function generateExamplesForSingleLevelAction(topic: string, level: number, customInstructions?: string) {
  try {
    console.log(`Generating examples for level ${level} and topic "${topic}"...`);
    if (customInstructions) {
      console.log(`With custom instructions: ${customInstructions}`);
    }
    
    // Map level to difficulty string
    const levelToDifficulty = (level: number): string => {
      if (level <= 3) return 'beginner';
      if (level <= 6) return 'intermediate';
      return 'advanced';
    };
    
    // Generate 3 varied examples for this specific level
    const result = await generatePersonalizedExercises({
      level: levelToDifficulty(level),
      topic: topic,
      structuredExamples: getBaseExamplesForLevel(topic, level),
      customInstructions: customInstructions
    });
    
    let examples: StructuredExample[] = [];
    
    if (result.exercises && result.exercises.length >= 3) {
      // Take first 3 exercises and ensure variety
      examples = result.exercises.slice(0, 3).map((ex, index) => {
        // Add variety to exercise format based on index
        const variedProblem = varyProblemFormat(ex.problem, index, level);
        return {
          problem: variedProblem,
          solution: ex.solution,
          explanation: ex.explanation
        };
      });
    } else {
      // Return error instead of incorrect examples
      console.error(`[generateExamplesForSingleLevel] Failed to generate valid exercises for level ${level}, topic "${topic}"`);
      return { error: 'No se pudieron generar ejemplos válidos. Por favor, intenta de nuevo.' };
    }
    
    return { data: { [level]: examples } };
  } catch (error) {
    console.error(`Error generating examples for level ${level}:`, error);
    // Return error instead of incorrect examples
    return { error: `Error al generar ejemplos: ${error instanceof Error ? error.message : 'Error desconocido'}` };
  }
}

// Get example by difficulty action - returns error to force AI generation
export async function getExampleByDifficultyAction(topic: string, difficulty: number) {
  console.warn(`[getExampleByDifficultyAction] Called for topic "${topic}" difficulty ${difficulty} - no hardcoded examples allowed`);
  return { error: 'No hardcoded examples - use AI generation instead' };
}

// Validate and fix exercises with invalid format or math
async function validateAndFixExercises(
  exercises: any[],
  card: {
    topic: string;
    difficulty: number;
    customInstructions: string;
    levelExamples?: { [level: number]: string[] };
    structuredExamples?: { [level: number]: { problem: string; solution: string; explanation: string }[] };
  }
): Promise<any[]> {
  const { isValidExercise, diagnoseExercise, analyzeNumberRange, validateNumberRange, validateOperationType } = await import('@/lib/math-validator');
  const validExercises: any[] = [];
  const invalidIndices: number[] = [];
  
  // Analyze expected number range from examples
  let expectedRange: { min: number; max: number } | null = null;
  if (card.structuredExamples && card.structuredExamples[card.difficulty] && card.structuredExamples[card.difficulty].length > 0) {
    const exampleProblems = card.structuredExamples[card.difficulty].map(e => e.problem);
    expectedRange = analyzeNumberRange(exampleProblems);
    console.log(`Expected number range from examples: ${expectedRange.min}-${expectedRange.max}`);
  } else if (card.levelExamples && card.levelExamples[card.difficulty] && card.levelExamples[card.difficulty].length > 0) {
    expectedRange = analyzeNumberRange(card.levelExamples[card.difficulty]);
    console.log(`Expected number range from examples: ${expectedRange.min}-${expectedRange.max}`);
  }
  
  // First pass: identify valid and invalid exercises
  exercises.forEach((exercise, index) => {
    const validation = isValidExercise(exercise);
    let isValid = validation.valid;
    
    // Check if operation type matches the topic
    const operationValidation = validateOperationType(exercise.problem, card.topic);
    if (!operationValidation.valid) {
      isValid = false;
      console.warn(`Exercise at index ${index} has wrong operation type:`, {
        problem: exercise.problem,
        topic: card.topic,
        expected: operationValidation.expectedOperation,
        actual: operationValidation.actualOperation,
        error: operationValidation.error
        });
    }
    
    // Also check number range if we have examples
    if (isValid && expectedRange) {
      const rangeValidation = validateNumberRange(exercise, expectedRange);
      if (!rangeValidation.valid) {
        isValid = false;
        console.warn(`Exercise at index ${index} violates number range:`, {
          problem: exercise.problem,
          expectedRange,
          actualRange: rangeValidation.actualRange,
          error: rangeValidation.error
          });
      }
    }
    
    if (isValid) {
      validExercises.push(exercise);
    } else {
      invalidIndices.push(index);
      const diagnosis = diagnoseExercise(exercise);
      console.warn(`Invalid exercise detected at index ${index}:`, {
        problem: exercise.problem,
        solution: exercise.solution,
        errors: diagnosis.errors,
        suggestions: diagnosis.suggestions
        });
    }
  });
  
  // If all exercises are valid, return them
  if (invalidIndices.length === 0) {
    return exercises;
  }
  
  // Regenerate invalid exercises (max 3 attempts per exercise)
  const maxAttempts = 3;
  for (const invalidIndex of invalidIndices) {
    let regenerated = false;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Regenerating exercise at index ${invalidIndex}, attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Generate a single replacement exercise
        const structuredExamples = card.structuredExamples?.[card.difficulty] || [];
        const levelExamples = card.levelExamples?.[card.difficulty] || [];
        
        const replacement = await generatePersonalizedExercises({
          level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
          topic: card.topic,
          examples: structuredExamples.length > 0 ? undefined : levelExamples,
          structuredExamples: structuredExamples.length > 0 ? structuredExamples : undefined
          });
        
        if (replacement.exercises && replacement.exercises.length > 0) {
          const newExercise = replacement.exercises[0];
          const validation = isValidExercise(newExercise);
          
          if (validation.valid) {
            validExercises.splice(invalidIndex, 0, {
              id: `exercise-${invalidIndex + 1}`,
              problem: newExercise.problem,
              solution: newExercise.solution,
              explanation: newExercise.explanation
              });
            regenerated = true;
            console.log(`Successfully regenerated exercise at index ${invalidIndex}`);
            break;
          } else {
            console.warn(`Regenerated exercise still invalid, attempt ${attempt}/${maxAttempts}`);
          }
        }
      } catch (error) {
        console.error(`Error regenerating exercise at index ${invalidIndex}:`, error);
      }
    }
    
    // If we couldn't regenerate, don't add a fallback - let AI handle all generation
    if (!regenerated) {
      console.error(`Failed to regenerate valid exercise after ${maxAttempts} attempts - skipping this exercise`);
      // Don't add any hardcoded exercise - this violates the user's requirement
    }
  }
  
  return validExercises;
}

// Generate practice session action
export async function generatePracticeSessionAction(card: {
  topic: string;
  difficulty: number;
  customInstructions: string;
  exerciseCount: number;
  levelExamples?: { [level: number]: string[] };
  structuredExamples?: { [level: number]: { problem: string; solution: string; explanation: string }[] };
}) {
  try {
    // Get examples for the current difficulty level (prefer structured over legacy)
    const currentStructuredExamples = card.structuredExamples && card.structuredExamples[card.difficulty] ? card.structuredExamples[card.difficulty] : [];
    const currentLevelExamples = card.levelExamples && card.levelExamples[card.difficulty] ? card.levelExamples[card.difficulty] : [];
    
    // If we have examples, add clear instructions about number range
    let enhancedInstructions = card.customInstructions || '';
    if (currentStructuredExamples.length > 0 || currentLevelExamples.length > 0) {
      const { analyzeNumberRange } = await import('@/lib/math-validator');
      const examplesForRange = currentStructuredExamples.length > 0 
        ? currentStructuredExamples.map(e => e.problem)
        : currentLevelExamples;
      const range = analyzeNumberRange(examplesForRange);
      enhancedInstructions += `\nIMPORTANT: Use ONLY numbers between ${range.min} and ${range.max} as shown in the examples.`;
    }

    // Use the existing generatePersonalizedExercises function
    const result = await generatePersonalizedExercises({
      level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
      topic: card.topic,
      examples: currentStructuredExamples.length > 0 ? undefined : currentLevelExamples,
      structuredExamples: currentStructuredExamples.length > 0 ? currentStructuredExamples : undefined
      });

    // Transform to expected format and validate
    const { validateMathAnswer } = await import('@/lib/math-validator');
    console.log(`[Actions] Generated ${result.exercises.length} exercises from AI:`, JSON.stringify(result.exercises, null, 2));
    
    const exercises = result.exercises.map((ex: any, index: number) => {
      // Validate math correctness for basic operations
      const isValid = validateMathAnswer(ex.problem, ex.solution);
      if (!isValid) {
        console.warn(`Invalid math detected: ${ex.problem} = ${ex.solution}`);
      }
      
      return {
        id: `exercise-${index + 1}`,
        problem: ex.problem,
        solution: ex.solution,
        explanation: ex.explanation
      };
      });

    // Generate more if needed
    while (exercises.length < card.exerciseCount) {
      const additionalResult = await generatePersonalizedExercises({
        level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
        topic: card.topic,
        examples: currentStructuredExamples.length > 0 ? undefined : currentLevelExamples,
        structuredExamples: currentStructuredExamples.length > 0 ? currentStructuredExamples : undefined
        });
      
      for (const ex of additionalResult.exercises) {
        if (exercises.length < card.exerciseCount) {
          exercises.push({
            id: `exercise-${exercises.length + 1}`,
            problem: ex.problem,
            solution: ex.solution,
            explanation: ex.explanation
            });
        }
      }
    }

    // Validate and fix all exercises before returning
    console.log(`Validating ${exercises.length} exercises...`);
    const validatedExercises = await validateAndFixExercises(exercises, card);
    console.log(`Validation complete. Returning ${validatedExercises.length} valid exercises.`);

    return { data: validatedExercises.slice(0, card.exerciseCount) };
  } catch (error) {
    console.error('Error generating practice session:', error);
    console.error('Full error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      topic: card.topic,
      difficulty: card.difficulty
      });
    
    // No fallback to mock data - return error instead
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to generate exercises: ${errorMessage}` };
  }
}

// Mock practice session generator - returns empty array to force AI generation
function generateMockPracticeSession(card: {
  topic: string;
  difficulty: number;
  customInstructions: string;
  exerciseCount: number;
}) {
  console.warn(`[generateMockPracticeSession] Called for topic "${card.topic}" - returning empty array to force AI generation`);
  return [];
}

// Check answer action
export async function checkAnswerAction(
  problem: string,
  correctAnswer: string,
  userAnswer: string,
  attemptNumber: number
) {
  try {
    // Normalize answers for comparison
    const normalizedCorrect = correctAnswer.trim().toLowerCase();
    const normalizedUser = userAnswer.trim().toLowerCase();
    
    const isCorrect = normalizedCorrect === normalizedUser;
    
    if (isCorrect) {
      return {
        data: {
          isCorrect: true,
          message: '¡Excelente! Tu respuesta es correcta. 🎉'
        }
      };
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
      
      return {
        data: {
          isCorrect: false,
          message
        }
      };
    }
  } catch (error) {
    console.error('Error checking answer:', error);
    return { error: 'Failed to check answer' };
  }
}

// Get hint action
export async function getHintAction(
  problem: string,
  correctAnswer: string,
  userAnswer: string
) {
  try {
    // For now, return generic hints
    // In production, this would analyze the specific error
    const hints = [
      'Revisa si estás siguiendo el orden correcto de las operaciones.',
      'Verifica que no hayas cometido errores de cálculo en los pasos intermedios.',
      'Asegúrate de haber interpretado correctamente el problema.',
      'Intenta resolver el problema paso a paso en el lienzo.',
    ];
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    
    return { data: randomHint };
  } catch (error) {
    console.error('Error getting hint:', error);
    return { error: 'Failed to get hint' };
  }
}

// Generate single exercise action (for background generation)
export async function generateSingleExerciseAction(card: {
  topic: string;
  difficulty: number;
  customInstructions: string;
}) {
  try {
    // Generate just one exercise
    const result = await generatePersonalizedExercises({
      level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
      topic: card.topic
      });

    if (result.exercises.length > 0) {
      const exercise = result.exercises[0];
      return {
        data: {
          id: `exercise-${Date.now()}`,
          problem: exercise.problem,
          solution: exercise.solution,
          explanation: exercise.explanation
        }
      };
    }

    return { error: 'No exercise generated' };
  } catch (error) {
    console.error('Error generating single exercise:', error);
    
    // No fallback to mock - return error instead
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to generate exercise: ${errorMessage}` };
  }
}
