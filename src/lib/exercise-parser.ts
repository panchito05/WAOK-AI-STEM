/**
 * Parse exercise problem text to separate instructions from mathematical operations
 */

export interface ParsedExercise {
  instruction: string | null;
  operation: string | null;
}

/**
 * Parses an exercise problem string to separate instructions from the mathematical operation
 * 
 * @param problem - The full problem text
 * @returns Object with instruction and operation separated
 * 
 * Examples:
 * - "25 + 17 = ?" → { instruction: null, operation: "25 + 17 = ?" }
 * - "Verifica: 7 × 4 = 4 × 7" → { instruction: "Verifica", operation: "7 × 4 = 4 × 7" }
 * - "¿Es 17 primo?" → { instruction: "¿Es 17 primo?", operation: null }
 */
export function parseExerciseProblem(problem: string): ParsedExercise {
  if (!problem) {
    return { instruction: null, operation: null };
  }

  const trimmedProblem = problem.trim();

  // Pattern 1: Instruction followed by colon
  if (trimmedProblem.includes(':')) {
    const colonIndex = trimmedProblem.indexOf(':');
    const beforeColon = trimmedProblem.substring(0, colonIndex).trim();
    const afterColon = trimmedProblem.substring(colonIndex + 1).trim();
    
    // Check if what's before the colon looks like an instruction
    const instructionKeywords = ['Verifica', 'Simplifica', 'Resuelve', 'Calcula', 'Encuentra', 'Determina', 'Comprueba'];
    const hasInstructionKeyword = instructionKeywords.some(keyword => 
      beforeColon.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasInstructionKeyword || beforeColon.length < 20) {
      return { 
        instruction: beforeColon, 
        operation: afterColon 
      };
    }
  }

  // Pattern 2: Complete question (starts with ¿)
  if (trimmedProblem.startsWith('¿') && trimmedProblem.endsWith('?')) {
    // Check if it's a simple operation question like "¿Cuánto es 5 + 3?"
    const operationMatch = trimmedProblem.match(/¿[^0-9]*(\d+\s*[+\-×÷]\s*\d+\s*=\s*\??).*\?/);
    if (operationMatch) {
      return {
        instruction: trimmedProblem.replace(operationMatch[1], '').replace(/\s+/g, ' ').trim(),
        operation: operationMatch[1]
      };
    }
    // Otherwise, the whole question is the instruction
    return { 
      instruction: trimmedProblem, 
      operation: null 
    };
  }

  // Pattern 3: Direct operation (contains = ?)
  if (trimmedProblem.includes('= ?') || trimmedProblem.match(/=\s*\?/)) {
    // Check if there's text before the operation
    const operationMatch = trimmedProblem.match(/(\d+\s*[+\-×÷]\s*\d+\s*=\s*\??)/);
    if (operationMatch && trimmedProblem.indexOf(operationMatch[0]) > 0) {
      const beforeOperation = trimmedProblem.substring(0, trimmedProblem.indexOf(operationMatch[0])).trim();
      if (beforeOperation.length > 0 && beforeOperation.length < 30) {
        return {
          instruction: beforeOperation,
          operation: operationMatch[0]
        };
      }
    }
    // It's just a direct operation
    return { 
      instruction: null, 
      operation: trimmedProblem 
    };
  }

  // Pattern 4: Keywords at the beginning
  const actionKeywords = ['Encuentra', 'Calcula', 'Resuelve', 'Determina', 'Halla', 'Comprueba'];
  for (const keyword of actionKeywords) {
    if (trimmedProblem.toLowerCase().startsWith(keyword.toLowerCase())) {
      // Find where the mathematical content starts
      const mathContentMatch = trimmedProblem.match(/\d+\s*[+\-×÷=]/);
      if (mathContentMatch) {
        const mathStartIndex = trimmedProblem.indexOf(mathContentMatch[0]);
        return {
          instruction: trimmedProblem.substring(0, mathStartIndex).trim(),
          operation: trimmedProblem.substring(mathStartIndex).trim()
        };
      }
    }
  }

  // Pattern 5: Check for comparison exercises (e.g., "3 + 5 = ? y 5 + 3 = ?")
  if (trimmedProblem.includes(' y ') && trimmedProblem.includes('= ?')) {
    return {
      instruction: 'Resuelve ambas operaciones',
      operation: trimmedProblem
    };
  }

  // Default: assume everything is the operation
  return { 
    instruction: null, 
    operation: trimmedProblem 
  };
}

/**
 * Detects the type of mathematical operation in a problem string
 * 
 * @param problem - The problem text to analyze
 * @returns The operation type or null if not detected
 * 
 * Examples:
 * - "25 + 17 = ?" → "suma"
 * - "45 - 23 = ?" → "resta"
 * - "7 × 4 = ?" → "multiplicación"
 * - "36 ÷ 6 = ?" → "división"
 */
export function detectOperationType(problem: string): 'suma' | 'resta' | 'multiplicación' | 'división' | null {
  if (!problem) return null;

  const normalizedProblem = problem.toLowerCase();

  // Check for addition
  if (normalizedProblem.includes('+')) {
    return 'suma';
  }

  // Check for subtraction
  if (normalizedProblem.includes('-')) {
    // Make sure it's not a negative number
    const minusIndex = normalizedProblem.indexOf('-');
    if (minusIndex > 0 && /\d/.test(normalizedProblem[minusIndex - 1])) {
      return 'resta';
    }
  }

  // Check for multiplication (various symbols)
  if (normalizedProblem.includes('×') || 
      normalizedProblem.includes('x') || 
      normalizedProblem.includes('*')) {
    // Make sure 'x' is used as multiplication, not as variable
    if (normalizedProblem.includes('x')) {
      const xIndex = normalizedProblem.indexOf('x');
      const hasNumberBefore = xIndex > 0 && /\d/.test(normalizedProblem[xIndex - 1]);
      const hasNumberAfter = xIndex < normalizedProblem.length - 1 && /\d/.test(normalizedProblem[xIndex + 1]);
      if (hasNumberBefore || hasNumberAfter) {
        return 'multiplicación';
      }
    } else {
      return 'multiplicación';
    }
  }

  // Check for division (various symbols)
  if (normalizedProblem.includes('÷') || 
      normalizedProblem.includes('/') ||
      normalizedProblem.includes(':')) {
    return 'división';
  }

  // Check by topic keywords in the problem text
  const topicKeywords = {
    suma: ['suma', 'sumar', 'agregar', 'añadir', 'total', 'juntos', 'más'],
    resta: ['resta', 'restar', 'quitar', 'diferencia', 'menos', 'quedan'],
    multiplicación: ['multiplica', 'multiplicar', 'veces', 'producto', 'por'],
    división: ['divide', 'dividir', 'repartir', 'entre', 'cociente', 'mitad', 'tercio', 'cuarto']
  };

  for (const [operation, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => normalizedProblem.includes(keyword))) {
      return operation as 'suma' | 'resta' | 'multiplicación' | 'división';
    }
  }

  return null;
}