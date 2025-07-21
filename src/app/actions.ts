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
      // Return mock data for testing when API key is missing
      const mockExercises = generateMockExercises(validatedData.data.level, validatedData.data.topic);
      return { data: mockExercises };
    }
    
    // For other errors, return detailed message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { error: `Failed to generate exercises: ${errorMessage}` };
  }
}

// Mock exercise generator for testing without API key
function generateMockExercises(level: string, topic: string) {
  const exercises = [];
  const count = 5;
  
  // Generate exercises based on topic
  switch (topic.toLowerCase()) {
    case 'addition':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        exercises.push({
          problem: `${a} + ${b} = ?`,
          solution: (a + b).toString(),
          explanation: `${a} + ${b}: ${a} + ${b} = ${a + b}`
        });
      }
      break;
      
    case 'subtraction':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 20) + 10 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 200) + 50 : 
                 Math.floor(Math.random() * 2000) + 500;
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) : 
                 level === 'intermediate' ? Math.floor(Math.random() * 100) : 
                 Math.floor(Math.random() * 1000);
        exercises.push({
          problem: `${a} - ${b} = ?`,
          solution: (a - b).toString(),
          explanation: `${a} - ${b}: ${a} - ${b} = ${a - b}`
        });
      }
      break;
      
    case 'multiplication':
      for (let i = 0; i < count; i++) {
        const a = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 100) + 1;
        const b = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 100) + 1;
        exercises.push({
          problem: `${a} × ${b} = ?`,
          solution: (a * b).toString(),
          explanation: `${a} × ${b}: ${a} × ${b} = ${a * b}`
        });
      }
      break;
      
    case 'division':
      for (let i = 0; i < count; i++) {
        const b = level === 'beginner' ? Math.floor(Math.random() * 9) + 1 : 
                 level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                 Math.floor(Math.random() * 50) + 1;
        const result = level === 'beginner' ? Math.floor(Math.random() * 10) + 1 : 
                      level === 'intermediate' ? Math.floor(Math.random() * 20) + 1 : 
                      Math.floor(Math.random() * 100) + 1;
        const a = b * result;
        exercises.push({
          problem: `${a} ÷ ${b} = ?`,
          solution: result.toString(),
          explanation: `${a} ÷ ${b}: ${a} ÷ ${b} = ${result}`
        });
      }
      break;
      
    default:
      // For any other topic, generate placeholder exercises
      for (let i = 0; i < count; i++) {
        exercises.push({
          problem: `Ejercicio ${i + 1} de ${topic}`,
          solution: "Ver con API key",
          explanation: `Para ejercicios de "${topic}", active la conexión con Gemini AI para obtener ejercicios específicos y personalizados.`
        });
      }
  }
  
  return exercises;
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

// Get example by difficulty action
export async function getExampleByDifficultyAction(topic: string, difficulty: number) {
  try {
    // Generate example based on topic and difficulty
    const examples: Record<string, Record<number, string>> = {
      'suma': {
        1: '2 + 3 = ?',
        2: '15 + 8 = ?',
        3: '27 + 19 = ?',
        4: '134 + 67 = ?',
        5: '358 + 246 = ?',
        6: '1,234 + 789 = ?',
        7: '3.5 + 2.7 = ?',
        8: '15.75 + 8.49 = ?',
        9: '1/2 + 1/4 = ?',
        10: '3/7 + 5/9 = ?',
      },
      'multiplicación': {
        1: '2 × 3 = ?',
        2: '5 × 4 = ?',
        3: '7 × 8 = ?',
        4: '12 × 9 = ?',
        5: '23 × 17 = ?',
        6: '134 × 25 = ?',
        7: '3.5 × 2 = ?',
        8: '12.5 × 4.8 = ?',
        9: '2/3 × 3/4 = ?',
        10: '(x + 3)(x - 2) = ?',
      },
      'default': {
        1: 'Ejercicio nivel 1',
        2: 'Ejercicio nivel 2',
        3: 'Ejercicio nivel 3',
        4: 'Ejercicio nivel 4',
        5: 'Ejercicio nivel 5',
        6: 'Ejercicio nivel 6',
        7: 'Ejercicio nivel 7',
        8: 'Ejercicio nivel 8',
        9: 'Ejercicio nivel 9',
        10: 'Ejercicio nivel 10',
      }
    };
    
    const topicLower = topic.toLowerCase();
    const topicExamples = examples[topicLower] || examples['default'];
    const example = topicExamples[difficulty] || topicExamples[5];
    
    return { data: example };
  } catch (error) {
    console.error('Error getting example:', error);
    return { error: 'Failed to get example' };
  }
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
  const { isValidExercise, diagnoseExercise, analyzeNumberRange, validateNumberRange } = await import('@/lib/math-validator');
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
    
    // If we couldn't regenerate, create a simple fallback exercise
    if (!regenerated) {
      console.error(`Failed to regenerate valid exercise after ${maxAttempts} attempts, using fallback`);
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      validExercises.splice(invalidIndex, 0, {
        id: `exercise-${invalidIndex + 1}`,
        problem: `${num1} + ${num2} = ?`,
        solution: (num1 + num2).toString(),
        explanation: `Para resolver ${num1} + ${num2}, sumamos: ${num1} + ${num2} = ${num1 + num2}`
      });
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
    
    // Fallback to mock data when API fails
    console.warn(`Using mock exercises for topic: ${card.topic}`);
    const mockExercises = generateMockPracticeSession(card);
    return { data: mockExercises };
  }
}

// Mock practice session generator
function generateMockPracticeSession(card: {
  topic: string;
  difficulty: number;
  customInstructions: string;
  exerciseCount: number;
}) {
  const exercises = [];
  
  for (let i = 0; i < card.exerciseCount; i++) {
    const baseNum = card.difficulty * 10;
    
    // Generate different types of problems based on topic keywords
    const topicLower = card.topic.toLowerCase();
    let problem, solution, explanation;
    
    if (topicLower.includes('suma') || topicLower.includes('adición') || topicLower.includes('addition')) {
      const a = Math.floor(Math.random() * baseNum) + 1;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} + ${b} = ?`;
      solution = (a + b).toString();
      explanation = `Para resolver ${a} + ${b}, sumamos los números: ${a} + ${b} = ${solution}`;
    } else if (topicLower.includes('resta') || topicLower.includes('substracción') || topicLower.includes('subtraction')) {
      const a = Math.floor(Math.random() * baseNum * 2) + baseNum;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} - ${b} = ?`;
      solution = (a - b).toString();
      explanation = `Para resolver ${a} - ${b}, restamos: ${a} - ${b} = ${solution}`;
    } else if (topicLower.includes('multiplicación') || topicLower.includes('producto') || topicLower.includes('multiplication')) {
      const a = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const b = Math.floor(Math.random() * (baseNum / 2)) + 1;
      problem = `${a} × ${b} = ?`;
      solution = (a * b).toString();
      explanation = `Para resolver ${a} × ${b}, multiplicamos: ${a} × ${b} = ${solution}`;
    } else if (topicLower.includes('división') || topicLower.includes('division')) {
      const b = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const result = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const a = b * result;
      problem = `${a} ÷ ${b} = ?`;
      solution = result.toString();
      explanation = `Para resolver ${a} ÷ ${b}, dividimos: ${a} ÷ ${b} = ${solution}`;
    } else if (topicLower.includes('fraccion') || topicLower.includes('fracción')) {
      const nums = [1, 2, 3, 4, 5, 6, 8];
      const a = nums[Math.floor(Math.random() * nums.length)];
      const b = nums[Math.floor(Math.random() * nums.length)];
      const c = nums[Math.floor(Math.random() * nums.length)];
      const d = nums[Math.floor(Math.random() * nums.length)];
      problem = `${a}/${b} + ${c}/${d} = ?`;
      solution = `${(a*d + c*b)}/${b*d}`;
      explanation = `Para sumar fracciones: ${a}/${b} + ${c}/${d} = ${(a*d + c*b)}/${b*d}`;
    } else {
      // Generic math problem for any other topic
      const a = Math.floor(Math.random() * baseNum) + 1;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `Ejercicio ${i + 1} de ${card.topic}: ${a} y ${b}`;
      solution = `Solución para ${card.topic}`;
      explanation = `Este es un ejercicio de práctica para ${card.topic}. Con API activa, obtendrás ejercicios específicos.`;
    }
    
    exercises.push({
      id: `exercise-${i + 1}`,
      problem,
      solution,
      explanation
    });
  }
  
  return exercises;
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
    
    // Fallback to mock
    const mockExercise = generateMockPracticeSession({
      ...card,
      exerciseCount: 1
    })[0];
    
    return { data: mockExercise };
  }
}
