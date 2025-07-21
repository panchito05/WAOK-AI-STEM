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

// Spell correction action
export async function correctSpellingAction(text: string) {
  try {
    const prompt = `Corrige la ortografía del siguiente tema matemático. Solo devuelve el texto corregido sin explicaciones adicionales. Si el texto está bien escrito, devuélvelo tal cual.
    
    Texto: "${text}"
    
    Respuesta:`;
    
    // For now, return a simple correction for common mistakes
    // In production, this would call Gemini AI
    const corrections: Record<string, string> = {
      'multiplicasion': 'multiplicación',
      'divicion': 'división',
      'fracciónes': 'fracciones',
      'algebra': 'álgebra',
      'ecuasiones': 'ecuaciones',
      'aritmetica': 'aritmética',
      'geometria': 'geometría',
      'numeros primos': 'números primos',
      'raiz cuadrada': 'raíz cuadrada',
    };
    
    const lower = text.toLowerCase();
    const corrected = corrections[lower] || text;
    
    return { data: corrected };
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

// Generate practice session action
export async function generatePracticeSessionAction(card: {
  topic: string;
  difficulty: number;
  customInstructions: string;
  exerciseCount: number;
}) {
  try {
    const prompt = `Generate ${card.exerciseCount} mathematical exercises for:

    Topic: ${card.topic}
    Difficulty: ${card.difficulty}/10
    ${card.customInstructions ? `Special instructions: ${card.customInstructions}` : ''}

    Return a JSON array of exercises with id, problem, solution, and explanation fields.
    Make sure exercises are appropriate for the difficulty level.`;

    // Use the existing generatePersonalizedExercises function
    const result = await generatePersonalizedExercises({
      level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
      topic: card.topic
    });

    // Transform to expected format
    const exercises = result.exercises.map((ex: any, index: number) => ({
      id: `exercise-${index + 1}`,
      problem: ex.problem,
      solution: ex.solution,
      explanation: ex.explanation
    }));

    // Generate more if needed
    while (exercises.length < card.exerciseCount) {
      const additionalResult = await generatePersonalizedExercises({
        level: card.difficulty <= 3 ? 'beginner' : card.difficulty <= 6 ? 'intermediate' : 'advanced',
        topic: card.topic
      });
      
      additionalResult.exercises.forEach((ex: any, index: number) => {
        if (exercises.length < card.exerciseCount) {
          exercises.push({
            id: `exercise-${exercises.length + 1}`,
            problem: ex.problem,
            solution: ex.solution,
            explanation: ex.explanation
          });
        }
      });
    }

    return { data: exercises.slice(0, card.exerciseCount) };
  } catch (error) {
    console.error('Error generating practice session:', error);
    
    // Fallback to mock data when API fails
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
    
    if (topicLower.includes('suma') || topicLower.includes('adición')) {
      const a = Math.floor(Math.random() * baseNum) + 1;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} + ${b} = ?`;
      solution = (a + b).toString();
      explanation = `Para resolver ${a} + ${b}, sumamos los números: ${a} + ${b} = ${solution}`;
    } else if (topicLower.includes('resta') || topicLower.includes('substracción')) {
      const a = Math.floor(Math.random() * baseNum * 2) + baseNum;
      const b = Math.floor(Math.random() * baseNum) + 1;
      problem = `${a} - ${b} = ?`;
      solution = (a - b).toString();
      explanation = `Para resolver ${a} - ${b}, restamos: ${a} - ${b} = ${solution}`;
    } else if (topicLower.includes('multiplicación') || topicLower.includes('producto')) {
      const a = Math.floor(Math.random() * (baseNum / 2)) + 1;
      const b = Math.floor(Math.random() * (baseNum / 2)) + 1;
      problem = `${a} × ${b} = ?`;
      solution = (a * b).toString();
      explanation = `Para resolver ${a} × ${b}, multiplicamos: ${a} × ${b} = ${solution}`;
    } else if (topicLower.includes('división')) {
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
