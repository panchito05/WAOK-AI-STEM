// Función para migrar tarjetas existentes y corregir soluciones "Ver solución"

import type { PracticeCard, StructuredExample } from './storage';
import { findTopicConfig } from './topic-mapping';

// Función para calcular la solución de un problema matemático simple
function calculateSolution(problem: string): string {
  try {
    // Intentar extraer números y operación de problemas simples
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
        let result: number;
        
        if (problem.includes('+')) {
          result = num1 + num2;
        } else if (problem.includes('-')) {
          result = num1 - num2;
        } else if (problem.match(/[×x\*]/)) {
          result = num1 * num2;
        } else if (problem.match(/[÷/]/)) {
          result = num1 / num2;
        } else {
          return '';
        }
        
        // Retornar como entero si no tiene decimales
        return result % 1 === 0 ? result.toString() : result.toFixed(2);
      }
    }
  } catch (error) {
    console.error('Error calculating solution:', error);
  }
  
  return '';
}

// Función para migrar ejemplos estructurados con "Ver solución"
export function migrateStructuredExamples(examples: StructuredExample[]): StructuredExample[] {
  return examples.map(example => {
    // Si la solución es "Ver solución" o similar, calcularla
    const invalidSolutions = ['ver solución', 'ver solucion', 'calcular', '?', ''];
    if (invalidSolutions.includes(example.solution.toLowerCase().trim())) {
      const calculatedSolution = calculateSolution(example.problem);
      
      if (calculatedSolution) {
        // Actualizar también la explicación
        const operation = example.problem.includes('+') ? 'sumamos' : 
                         example.problem.includes('-') ? 'restamos' : 
                         example.problem.match(/[×x\*]/) ? 'multiplicamos' : 
                         example.problem.match(/[÷/]/) ? 'dividimos' : 'calculamos';
        
        return {
          problem: example.problem,
          solution: calculatedSolution,
          explanation: `Para resolver ${example.problem}, ${operation}: ${example.problem.replace('= ?', `= ${calculatedSolution}`)}`
        };
      }
    }
    
    return example;
  });
}

// Función para migrar una tarjeta completa
export function migratePracticeCard(card: PracticeCard): PracticeCard {
  let needsUpdate = false;
  const updatedCard = { ...card };
  
  // Migrar color e icono si no existen
  if (!card.color || !card.icon) {
    const topicConfig = findTopicConfig(card.topic);
    if (!card.color && topicConfig.color) {
      updatedCard.color = topicConfig.color;
      needsUpdate = true;
    }
    if (!card.icon && topicConfig.icon) {
      updatedCard.icon = topicConfig.icon;
      needsUpdate = true;
    }
  }
  
  // Migrar ejemplos estructurados si existen
  if (card.structuredExamples) {
    const migratedExamples: { [level: number]: StructuredExample[] } = {};
    
    for (const [level, examples] of Object.entries(card.structuredExamples)) {
      const migratedLevelExamples = migrateStructuredExamples(examples);
      
      // Verificar si hubo cambios
      const hasChanges = migratedLevelExamples.some((migrated, index) => 
        migrated.solution !== examples[index].solution
      );
      
      if (hasChanges) {
        needsUpdate = true;
        console.log(`Migrated ${level} examples for card "${card.name}"`);
      }
      
      migratedExamples[Number(level)] = migratedLevelExamples;
    }
    
    if (needsUpdate) {
      updatedCard.structuredExamples = migratedExamples;
      updatedCard.updatedAt = new Date().toISOString();
    }
  }
  
  return updatedCard;
}

// Función para migrar todas las tarjetas
export function migrateAllCards(cards: PracticeCard[]): PracticeCard[] {
  console.log('Starting card migration...');
  let migratedCount = 0;
  
  const migratedCards = cards.map(card => {
    const migratedCard = migratePracticeCard(card);
    if (migratedCard.updatedAt !== card.updatedAt) {
      migratedCount++;
    }
    return migratedCard;
  });
  
  console.log(`Migration complete. Updated ${migratedCount} cards.`);
  return migratedCards;
}