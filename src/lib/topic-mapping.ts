// Mapeo de temas matemáticos a colores e iconos
export interface TopicConfig {
  color: string;
  icon: string;
  alternativeNames?: string[];
}

export const topicMapping: Record<string, TopicConfig> = {
  // Suma / Addition
  'suma': {
    color: '#3B82F6', // Blue
    icon: 'Plus',
    alternativeNames: ['adición', 'sum', 'add']
  },
  'addition': {
    color: '#3B82F6', // Blue
    icon: 'Plus',
    alternativeNames: ['add', 'sum', 'plus']
  },
  
  // Resta / Subtraction
  'resta': {
    color: '#EF4444', // Red
    icon: 'Minus',
    alternativeNames: ['sustracción', 'subtract', 'sub']
  },
  'subtraction': {
    color: '#EF4444', // Red
    icon: 'Minus',
    alternativeNames: ['subtract', 'sub', 'minus']
  },
  
  // Multiplicación / Multiplication
  'multiplicación': {
    color: '#8B5CF6', // Purple
    icon: 'X',
    alternativeNames: ['multiplicacion', 'multiply', 'mult', 'producto']
  },
  'multiplication': {
    color: '#8B5CF6', // Purple
    icon: 'X',
    alternativeNames: ['multiply', 'mult', 'times', 'product']
  },
  
  // División / Division
  'división': {
    color: '#F97316', // Orange
    icon: 'Divide',
    alternativeNames: ['division', 'dividir', 'div']
  },
  'division': {
    color: '#F97316', // Orange
    icon: 'Divide',
    alternativeNames: ['divide', 'div', 'quotient']
  },
  
  // Fracciones / Fractions
  'fracciones': {
    color: '#06B6D4', // Cyan
    icon: 'PieChart',
    alternativeNames: ['fraccion', 'fractions', 'fracción']
  },
  'fractions': {
    color: '#06B6D4', // Cyan
    icon: 'PieChart',
    alternativeNames: ['fraction', 'frac', 'ratio']
  },
  
  // Porcentajes / Percentages
  'porcentajes': {
    color: '#10B981', // Green
    icon: 'Percent',
    alternativeNames: ['porcentaje', 'percentages', 'porciento']
  },
  'percentages': {
    color: '#10B981', // Green
    icon: 'Percent',
    alternativeNames: ['percentage', 'percent', 'pct']
  },
  
  // Álgebra / Algebra
  'álgebra': {
    color: '#6366F1', // Indigo
    icon: 'Calculator',
    alternativeNames: ['algebra', 'algebraico', 'ecuaciones']
  },
  'algebra': {
    color: '#6366F1', // Indigo
    icon: 'Calculator',
    alternativeNames: ['algebraic', 'equations', 'variables']
  },
  
  // Geometría / Geometry
  'geometría': {
    color: '#EC4899', // Pink
    icon: 'Shapes',
    alternativeNames: ['geometria', 'geometry', 'formas', 'figuras']
  },
  'geometry': {
    color: '#EC4899', // Pink
    icon: 'Shapes',
    alternativeNames: ['geometric', 'shapes', 'figures']
  },
  
  // Números / Numbers
  'números': {
    color: '#14B8A6', // Teal
    icon: 'Hash',
    alternativeNames: ['numeros', 'numbers', 'contar', 'counting']
  },
  'numbers': {
    color: '#14B8A6', // Teal
    icon: 'Hash',
    alternativeNames: ['number', 'counting', 'numerals']
  },
  
  // Medidas / Measurements
  'medidas': {
    color: '#F59E0B', // Amber
    icon: 'Ruler',
    alternativeNames: ['medida', 'measurements', 'medir', 'unidades']
  },
  'measurements': {
    color: '#F59E0B', // Amber
    icon: 'Ruler',
    alternativeNames: ['measurement', 'measure', 'units', 'metrics']
  },
  
  // Tiempo / Time
  'tiempo': {
    color: '#7C3AED', // Violet
    icon: 'Clock',
    alternativeNames: ['time', 'hora', 'reloj', 'calendar']
  },
  'time': {
    color: '#7C3AED', // Violet
    icon: 'Clock',
    alternativeNames: ['clock', 'hour', 'calendar', 'schedule']
  },
  
  // Dinero / Money
  'dinero': {
    color: '#059669', // Emerald
    icon: 'DollarSign',
    alternativeNames: ['money', 'moneda', 'currency', 'pesos']
  },
  'money': {
    color: '#059669', // Emerald
    icon: 'DollarSign',
    alternativeNames: ['currency', 'cash', 'dollars', 'coins']
  },
  
  // Patrones / Patterns
  'patrones': {
    color: '#DC2626', // Red-600
    icon: 'Grid',
    alternativeNames: ['patron', 'patterns', 'secuencias', 'series']
  },
  'patterns': {
    color: '#DC2626', // Red-600
    icon: 'Grid',
    alternativeNames: ['pattern', 'sequence', 'series']
  },
  
  // Estadística / Statistics
  'estadística': {
    color: '#0891B2', // Cyan-600
    icon: 'BarChart',
    alternativeNames: ['estadistica', 'statistics', 'datos', 'gráficas']
  },
  'statistics': {
    color: '#0891B2', // Cyan-600
    icon: 'BarChart',
    alternativeNames: ['stats', 'data', 'graphs', 'charts']
  },
  
  // Default
  'default': {
    color: '#6B7280', // Gray
    icon: 'Calculator',
    alternativeNames: []
  }
};

// Función para encontrar la configuración de un tema
export function findTopicConfig(topic: string): TopicConfig {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Buscar coincidencia exacta
  if (topicMapping[normalizedTopic]) {
    return topicMapping[normalizedTopic];
  }
  
  // Buscar en nombres alternativos
  for (const [key, config] of Object.entries(topicMapping)) {
    if (config.alternativeNames?.includes(normalizedTopic)) {
      return config;
    }
    
    // Buscar coincidencia parcial en el key
    if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
      return config;
    }
    
    // Buscar coincidencia parcial en nombres alternativos
    if (config.alternativeNames?.some(alt => 
      normalizedTopic.includes(alt) || alt.includes(normalizedTopic)
    )) {
      return config;
    }
  }
  
  // Si no se encuentra, devolver configuración por defecto
  return topicMapping.default;
}

// Función para obtener el nombre normalizado del tema
export function getNormalizedTopicName(topic: string): string {
  const normalizedTopic = topic.toLowerCase().trim();
  
  // Mapeo de correcciones comunes
  const corrections: Record<string, string> = {
    // Español
    'summa': 'Suma',
    'suma': 'Suma',
    'adicion': 'Suma',
    'adición': 'Suma',
    'recta': 'Resta',
    'resta': 'Resta',
    'sustraccion': 'Resta',
    'sustracción': 'Resta',
    'multiplicasion': 'Multiplicación',
    'multiplicacion': 'Multiplicación',
    'multiplicación': 'Multiplicación',
    'divicion': 'División',
    'division': 'División',
    'división': 'División',
    'fraccion': 'Fracciones',
    'fracciones': 'Fracciones',
    'porcentaje': 'Porcentajes',
    'porcentajes': 'Porcentajes',
    'porciento': 'Porcentajes',
    'algebra': 'Álgebra',
    'álgebra': 'Álgebra',
    'geometria': 'Geometría',
    'geometría': 'Geometría',
    'numero': 'Números',
    'numeros': 'Números',
    'números': 'Números',
    'medida': 'Medidas',
    'medidas': 'Medidas',
    'tiempo': 'Tiempo',
    'hora': 'Tiempo',
    'reloj': 'Tiempo',
    'dinero': 'Dinero',
    'moneda': 'Dinero',
    'patron': 'Patrones',
    'patrones': 'Patrones',
    'secuencia': 'Patrones',
    'secuencias': 'Patrones',
    'estadistica': 'Estadística',
    'estadística': 'Estadística',
    'datos': 'Estadística',
    
    // English
    'adddition': 'Addition',
    'addition': 'Addition',
    'add': 'Addition',
    'sum': 'Addition',
    'substraction': 'Subtraction',
    'subtraction': 'Subtraction',
    'subtract': 'Subtraction',
    'sub': 'Subtraction',
    'minus': 'Subtraction',
    'multiplikation': 'Multiplication',
    'multiplication': 'Multiplication',
    'multiply': 'Multiplication',
    'mult': 'Multiplication',
    'times': 'Multiplication',
    'product': 'Multiplication',
    'divison': 'Division',
    'divide': 'Division',
    'div': 'Division',
    'fraction': 'Fractions',
    'fractions': 'Fractions',
    'frac': 'Fractions',
    'percentage': 'Percentages',
    'percentages': 'Percentages',
    'percent': 'Percentages',
    'pct': 'Percentages',
    'algebraic': 'Algebra',
    'equation': 'Algebra',
    'equations': 'Algebra',
    'geometry': 'Geometry',
    'geometric': 'Geometry',
    'shape': 'Geometry',
    'shapes': 'Geometry',
    'number': 'Numbers',
    'numbers': 'Numbers',
    'counting': 'Numbers',
    'count': 'Numbers',
    'measurement': 'Measurements',
    'measurements': 'Measurements',
    'measure': 'Measurements',
    'unit': 'Measurements',
    'units': 'Measurements',
    'time': 'Time',
    'clock': 'Time',
    'hour': 'Time',
    'calendar': 'Time',
    'money': 'Money',
    'currency': 'Money',
    'dollar': 'Money',
    'dollars': 'Money',
    'coin': 'Money',
    'coins': 'Money',
    'pattern': 'Patterns',
    'patterns': 'Patterns',
    'sequence': 'Patterns',
    'series': 'Patterns',
    'statistic': 'Statistics',
    'statistics': 'Statistics',
    'stats': 'Statistics',
    'data': 'Statistics',
    'graph': 'Statistics',
    'graphs': 'Statistics',
    'chart': 'Statistics',
    'charts': 'Statistics'
  };
  
  // Buscar corrección exacta
  if (corrections[normalizedTopic]) {
    return corrections[normalizedTopic];
  }
  
  // Buscar corrección parcial (para errores tipográficos)
  for (const [key, value] of Object.entries(corrections)) {
    // Distancia de Levenshtein simplificada (coincidencia aproximada)
    if (isCloseMatch(normalizedTopic, key)) {
      return value;
    }
  }
  
  // Si no se encuentra corrección, capitalizar la primera letra
  return topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase();
}

// Función auxiliar para determinar si dos strings son similares
function isCloseMatch(str1: string, str2: string): boolean {
  // Si la diferencia de longitud es mayor a 2, no son similares
  if (Math.abs(str1.length - str2.length) > 2) return false;
  
  // Contar caracteres diferentes
  let differences = 0;
  const maxLen = Math.max(str1.length, str2.length);
  
  for (let i = 0; i < maxLen; i++) {
    if (str1[i] !== str2[i]) {
      differences++;
    }
  }
  
  // Si hay 2 o menos diferencias, consideramos que es una coincidencia
  return differences <= 2;
}