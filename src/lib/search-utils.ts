// Utilidades para búsqueda inteligente con tolerancia a errores tipográficos

/**
 * Calcula la distancia de Levenshtein entre dos cadenas
 * Útil para detectar errores tipográficos menores
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  if (m === 0) return n;
  if (n === 0) return m;
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // eliminación
        dp[i][j - 1] + 1,     // inserción
        dp[i - 1][j - 1] + cost // sustitución
      );
    }
  }
  
  return dp[m][n];
}

/**
 * Determina si dos strings son similares considerando errores tipográficos
 * @param str1 Primera cadena
 * @param str2 Segunda cadena
 * @param maxDistance Distancia máxima permitida (default: 2)
 * @returns true si las cadenas son similares
 */
export function isFuzzyMatch(str1: string, str2: string, maxDistance: number = 2): boolean {
  // Normalizar las cadenas
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();
  
  // Si son exactamente iguales
  if (normalized1 === normalized2) return true;
  
  // Si la diferencia de longitud es muy grande, no son similares
  if (Math.abs(normalized1.length - normalized2.length) > maxDistance) return false;
  
  // Si una cadena contiene a la otra
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;
  
  // Calcular distancia de Levenshtein
  const distance = levenshteinDistance(normalized1, normalized2);
  return distance <= maxDistance;
}

/**
 * Busca coincidencias fuzzy en un texto
 * @param searchTerm Término de búsqueda
 * @param text Texto donde buscar
 * @param tolerance Tolerancia a errores (1-3)
 * @returns true si hay coincidencia fuzzy
 */
export function fuzzySearch(searchTerm: string, text: string, tolerance: number = 2): boolean {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  const normalizedText = text.toLowerCase().trim();
  
  // Búsqueda exacta
  if (normalizedText.includes(normalizedSearch)) return true;
  
  // Si el término de búsqueda es muy corto, no usar fuzzy
  if (normalizedSearch.length <= 3) return false;
  
  // Dividir el texto en palabras
  const words = normalizedText.split(/\s+/);
  
  // Buscar coincidencia fuzzy en cada palabra
  for (const word of words) {
    if (isFuzzyMatch(normalizedSearch, word, tolerance)) return true;
    
    // También verificar si el término de búsqueda es parte de una palabra más larga
    if (word.length > normalizedSearch.length) {
      // Sliding window para buscar subcadenas similares
      for (let i = 0; i <= word.length - normalizedSearch.length + tolerance; i++) {
        const substring = word.substring(i, i + normalizedSearch.length + tolerance);
        if (isFuzzyMatch(normalizedSearch, substring, tolerance)) return true;
      }
    }
  }
  
  return false;
}

/**
 * Términos de búsqueda especiales que mapean a características
 */
export const SPECIAL_SEARCH_TERMS: Record<string, (card: any) => boolean> = {
  // Español
  'facil': (card) => card.difficulty <= 3,
  'fácil': (card) => card.difficulty <= 3,
  'sencillo': (card) => card.difficulty <= 3,
  'basico': (card) => card.difficulty <= 3,
  'básico': (card) => card.difficulty <= 3,
  
  'medio': (card) => card.difficulty > 3 && card.difficulty <= 6,
  'intermedio': (card) => card.difficulty > 3 && card.difficulty <= 6,
  'moderado': (card) => card.difficulty > 3 && card.difficulty <= 6,
  
  'dificil': (card) => card.difficulty >= 7,
  'difícil': (card) => card.difficulty >= 7,
  'avanzado': (card) => card.difficulty >= 7,
  'complejo': (card) => card.difficulty >= 7,
  'experto': (card) => card.difficulty >= 9,
  
  // English
  'easy': (card) => card.difficulty <= 3,
  'simple': (card) => card.difficulty <= 3,
  'basic': (card) => card.difficulty <= 3,
  'beginner': (card) => card.difficulty <= 3,
  
  'medium': (card) => card.difficulty > 3 && card.difficulty <= 6,
  'intermediate': (card) => card.difficulty > 3 && card.difficulty <= 6,
  'moderate': (card) => card.difficulty > 3 && card.difficulty <= 6,
  
  'hard': (card) => card.difficulty >= 7,
  'difficult': (card) => card.difficulty >= 7,
  'advanced': (card) => card.difficulty >= 7,
  'complex': (card) => card.difficulty >= 7,
  'expert': (card) => card.difficulty >= 9,
  
  // Características especiales
  'favorito': (card) => card.isFavorite,
  'favoritos': (card) => card.isFavorite,
  'favorite': (card) => card.isFavorite,
  'favorites': (card) => card.isFavorite,
  'starred': (card) => card.isFavorite,
  
  'compensacion': (card) => card.autoCompensation,
  'compensación': (card) => card.autoCompensation,
  'auto': (card) => card.autoCompensation,
  'compensation': (card) => card.autoCompensation,
  
  'adaptativo': (card) => card.adaptiveDifficulty,
  'adaptativa': (card) => card.adaptiveDifficulty,
  'adaptive': (card) => card.adaptiveDifficulty,
  'dinámico': (card) => card.adaptiveDifficulty,
  'dinamico': (card) => card.adaptiveDifficulty,
  'dynamic': (card) => card.adaptiveDifficulty,
};

/**
 * Verifica si un término de búsqueda es especial
 */
export function isSpecialSearchTerm(term: string): boolean {
  return term.toLowerCase() in SPECIAL_SEARCH_TERMS;
}

/**
 * Aplica búsqueda de término especial
 */
export function applySpecialSearch(term: string, card: any): boolean {
  const normalizedTerm = term.toLowerCase();
  const searchFunction = SPECIAL_SEARCH_TERMS[normalizedTerm];
  return searchFunction ? searchFunction(card) : false;
}