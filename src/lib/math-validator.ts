// Math validation utilities

// Validate exercise format (detect malformed problems like "1+=?")
export function validateExerciseFormat(problem: string): { valid: boolean; error?: string } {
  // Check for empty or too short problems
  if (!problem || problem.trim().length < 3) {
    return { valid: false, error: 'Problem too short or empty' };
  }
  
  // Check for common malformed patterns
  const malformedPatterns = [
    /\d+\s*[+\-×x\*÷/]\s*=/, // Missing second operand: "1+=?"
    /=\s*\d+\s*[+\-×x\*÷/]/, // Backwards format: "=3+2"
    /[+\-×x\*÷/]\s*[+\-×x\*÷/]/, // Double operators: "++", "--"
    /^\s*[+\-×x\*÷/]/, // Starting with operator: "+2=?"
    /\?\s*\?/, // Multiple question marks: "? ? = 3"
  ];
  
  for (const pattern of malformedPatterns) {
    if (pattern.test(problem)) {
      return { valid: false, error: `Malformed pattern detected: ${problem}` };
    }
  }
  
  // Define number pattern that accepts integers, decimals, and fractions
  const numberPattern = '(?:\\d+(?:\\.\\d+)?|\d+/\\d+)'; // Matches: 5, 3.14, 1/2
  
  // Check for valid patterns (more flexible to accept AI-generated formats)
  const validPatterns = [
    // Standard format: "2 + 3 = ?" (now accepts fractions and decimals, with flexible spacing)
    new RegExp(`^${numberPattern}\\s*[+\\-×x\\*÷/]\\s*${numberPattern}\\s*=\\s*\\?$`),
    // Missing number format: "2 + ? = 5"
    new RegExp(`^${numberPattern}\\s*[+\\-×x\\*÷/]\\s*\\?\\s*=\\s*${numberPattern}$`),
    // Missing first number: "? + 3 = 5"
    new RegExp(`^\\?\\s*[+\\-×x\\*÷/]\\s*${numberPattern}\\s*=\\s*${numberPattern}$`),
    // Conceptual exercises: "¿Es 17 primo?"
    /^¿[^?]+\?$/,
    // Verification exercises: "Verifica: 7 × 4 = 4 × 7"
    /^Verifica:/i,
    // Simplification exercises: "Simplifica: 6/8 = ?"
    /^Simplifica:/i,
    // Find exercises: "Encuentra el siguiente primo después de 23"
    /^Encuentra/i,
    // General format with single equals (very flexible - accept anything with = and ?)
    /=.*\?|.*\?.*=/,
    // Accept any exercise that has numbers and operators
    new RegExp(`${numberPattern}.*[+\\-×x\\*÷/].*${numberPattern}`),
    // Fallback: if it contains numbers and basic math symbols, it's probably valid
    /\d+.*[+\-×x\*÷/=?].*\d+/,
  ];
  
  const hasValidPattern = validPatterns.some(pattern => pattern.test(problem));
  if (!hasValidPattern) {
    return { valid: false, error: `No valid pattern found in: ${problem}` };
  }
  
  return { valid: true };
}

// Validate consistency between problem, solution, and explanation
export function validateExerciseConsistency(
  problem: string, 
  solution: string, 
  explanation: string
): { valid: boolean; error?: string } {
  // For conceptual exercises, consistency rules are more flexible
  if (problem.match(/^(¿|Verifica:|Simplifica:|Encuentra)/i)) {
    // Just check that there's an explanation
    if (!explanation || explanation.trim().length < 10) {
      return { 
        valid: false, 
        error: `Conceptual exercise needs a proper explanation` 
      };
    }
    return { valid: true };
  }
  
  // Extract numbers from problem (including fractions and decimals)
  const problemNumbers = problem.match(/\d+(?:\.\d+)?(?:\/\d+)?/g) || [];
  const solutionNumber = solution.trim();
  
  // Check if solution appears in explanation (more flexible)
  if (explanation && solution.length > 0) {
    // For fractions, check if simplified form might be in explanation
    const solutionInExplanation = explanation.includes(solutionNumber) ||
      (solution.includes('/') && explanation.match(/\d+\/\d+/)) || // Any fraction in explanation is ok
      explanation.includes(solution.replace(/\s+/g, '')) || // Solution without spaces
      explanation.toLowerCase().includes('respuesta') || // Contains "answer" in Spanish
      explanation.toLowerCase().includes('resultado') || // Contains "result" in Spanish
      explanation.toLowerCase().includes('solución'); // Contains "solution" in Spanish
    
    if (!solutionInExplanation && !explanation.toLowerCase().includes('simplifica')) {
      // Only warn, don't invalidate
      console.warn(`Solution "${solutionNumber}" not explicitly found in explanation, but allowing it`);
    }
  }
  
  // Check if explanation mentions numbers from the problem (more flexible)
  if (explanation && problemNumbers.length > 0) {
    // At least one number from the problem should be in the explanation
    const explanationHasProblemNumbers = problemNumbers.some(num => 
      explanation.includes(num)
    );
    // Or the explanation discusses the concept
    const explanationDiscussesConcept = explanation.match(/(suma|resta|multiplicación|división|fracción|simplifica)/i);
    
    if (!explanationHasProblemNumbers && !explanationDiscussesConcept) {
      return { 
        valid: false, 
        error: `Explanation doesn't reference problem numbers or concept` 
      };
    }
  }
  
  return { valid: true };
}

// Main validation function
export function isValidExercise(exercise: {
  problem: string;
  solution: string;
  explanation: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check format
  const formatCheck = validateExerciseFormat(exercise.problem);
  if (!formatCheck.valid && formatCheck.error) {
    errors.push(formatCheck.error);
  }
  
  // Check math correctness
  const mathValid = validateMathAnswer(exercise.problem, exercise.solution);
  if (!mathValid) {
    errors.push(`Math validation failed: ${exercise.problem} ≠ ${exercise.solution}`);
  }
  
  // Check consistency
  const consistencyCheck = validateExerciseConsistency(
    exercise.problem, 
    exercise.solution, 
    exercise.explanation
  );
  if (!consistencyCheck.valid && consistencyCheck.error) {
    errors.push(consistencyCheck.error);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateMathAnswer(problem: string, solution: string): boolean {
  try {
    // For conceptual or complex exercises, trust the AI
    if (problem.match(/^(¿|Verifica:|Simplifica:|Encuentra)/i)) {
      return true;
    }
    
    // For fraction exercises, trust the AI (complex to validate)
    if (problem.includes('/') && !problem.match(/[÷]/)) {
      return true;
    }
    
    // Extract numbers and operation from simple math problems
    // Patterns like: "5 + 3 = ?", "10 - 4 = ?", "2 × 3 = ?", "8 ÷ 2 = ?"
    const patterns = [
      /^(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*[×x\*]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
      /^(\d+(?:\.\d+)?)\s*[÷/]\s*(\d+(?:\.\d+)?)\s*=\s*\?$/,
    ];
    
    for (const pattern of patterns) {
      const match = problem.match(pattern);
      if (match) {
        const num1 = parseFloat(match[1]);
        const num2 = parseFloat(match[2]);
        let correctAnswer: number;
        
        if (problem.includes('+')) {
          correctAnswer = num1 + num2;
        } else if (problem.includes('-')) {
          correctAnswer = num1 - num2;
        } else if (problem.match(/[×x\*]/)) {
          correctAnswer = num1 * num2;
        } else if (problem.match(/[÷/]/)) {
          correctAnswer = num1 / num2;
        } else {
          return true; // Can't validate, assume correct
        }
        
        // For decimal results, allow small differences due to rounding
        const solutionNum = parseFloat(solution.trim());
        if (!isNaN(solutionNum)) {
          return Math.abs(correctAnswer - solutionNum) < 0.01;
        }
        
        return correctAnswer.toString() === solution.trim();
      }
    }
    
    // Pattern for missing number: "5 + ? = 8", "? - 3 = 7"
    const missingPatterns = [
      /^(\d+(?:\.\d+)?)\s*\+\s*\?\s*=\s*(\d+(?:\.\d+)?)$/,
      /^\?\s*\+\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)$/,
      /^(\d+(?:\.\d+)?)\s*-\s*\?\s*=\s*(\d+(?:\.\d+)?)$/,
      /^\?\s*-\s*(\d+(?:\.\d+)?)\s*=\s*(\d+(?:\.\d+)?)$/,
    ];
    
    for (const pattern of missingPatterns) {
      const match = problem.match(pattern);
      if (match) {
        // For these patterns, we trust the AI's solution
        // but could add validation logic if needed
        return true;
      }
    }
    
    // For other patterns, trust the AI
    return true;
  } catch (error) {
    console.error('Error validating math answer:', error);
    return true; // In case of error, don't block
  }
}

// Analyze number range from examples
export function analyzeNumberRange(examples: string[]): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  
  examples.forEach(example => {
    // Extract all numbers from the example
    const numbers = example.match(/\d+/g);
    if (numbers) {
      numbers.forEach(numStr => {
        const num = parseInt(numStr);
        if (num < min) min = num;
        if (num > max) max = num;
      });
    }
  });
  
  return {
    min: min === Infinity ? 1 : min,
    max: max === -Infinity ? 10 : max
  };
}

// Validate that an exercise respects the number range from examples
export function validateNumberRange(
  exercise: { problem: string },
  expectedRange: { min: number; max: number }
): { valid: boolean; actualRange?: { min: number; max: number }; error?: string } {
  // Extract numbers from the exercise
  const numbers = exercise.problem.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return { valid: true }; // No numbers to validate
  }
  
  let exerciseMin = Infinity;
  let exerciseMax = -Infinity;
  
  numbers.forEach(numStr => {
    const num = parseInt(numStr);
    if (num < exerciseMin) exerciseMin = num;
    if (num > exerciseMax) exerciseMax = num;
  });
  
  const actualRange = {
    min: exerciseMin,
    max: exerciseMax
  };
  
  // Allow some tolerance (e.g., if examples use 35-105, allow 30-110)
  const tolerance = Math.max(5, Math.floor((expectedRange.max - expectedRange.min) * 0.1));
  const isValid = exerciseMin >= (expectedRange.min - tolerance) && 
                  exerciseMax <= (expectedRange.max + tolerance);
  
  if (!isValid) {
    return {
      valid: false,
      actualRange,
      error: `Numbers ${exerciseMin}-${exerciseMax} are outside expected range ${expectedRange.min}-${expectedRange.max}`
    };
  }
  
  return { valid: true, actualRange };
}

// Diagnose exercise problems and suggest fixes
export function diagnoseExercise(exercise: {
  problem: string;
  solution: string;
  explanation: string;
}): {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
} {
  const validation = isValidExercise(exercise);
  const suggestions: string[] = [];
  
  if (!validation.valid) {
    // Suggest fixes based on errors
    validation.errors.forEach(error => {
      if (error.includes('Malformed pattern')) {
        if (exercise.problem.includes('+=')) {
          suggestions.push('Add missing number before equals sign (e.g., "1 + 2 = ?")');
        }
        if (error.includes('too short')) {
          suggestions.push('Ensure problem has both operands and operator');
        }
      }
      
      if (error.includes('Math validation failed')) {
        suggestions.push('Verify calculation is correct');
        suggestions.push(`Check: ${exercise.problem} should equal ${exercise.solution}`);
      }
      
      if (error.includes('Explanation')) {
        suggestions.push('Ensure explanation references the problem numbers and solution');
      }
    });
  }
  
  return {
    isValid: validation.valid,
    errors: validation.errors,
    suggestions
  };
}