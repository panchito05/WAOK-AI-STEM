'use server';

/**
 * @fileOverview This file defines a Genkit flow for intelligently correcting math topic names.
 * 
 * The flow understands the user's intention even with spelling errors or incomplete phrases,
 * returning the correct mathematical topic name in Spanish.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CorrectMathTopicInputSchema = z.object({
  text: z.string().describe('The user input text with potential spelling errors or incomplete phrases'),
});
export type CorrectMathTopicInput = z.infer<typeof CorrectMathTopicInputSchema>;

const CorrectMathTopicOutputSchema = z.object({
  correctedTopic: z.string().describe('The corrected mathematical topic name'),
  confidence: z.number().min(0).max(1).describe('Confidence score of the correction (0-1)'),
});
export type CorrectMathTopicOutput = z.infer<typeof CorrectMathTopicOutputSchema>;

export async function correctMathTopic(
  input: CorrectMathTopicInput
): Promise<CorrectMathTopicOutput> {
  return correctMathTopicFlow(input);
}

const correctMathTopicPrompt = ai.definePrompt({
  name: 'correctMathTopicPrompt',
  input: {schema: CorrectMathTopicInputSchema},
  output: {schema: CorrectMathTopicOutputSchema},
  prompt: `Eres un asistente educativo especializado en matemáticas para niños de primaria.
Tu tarea es entender la intención del usuario cuando escribe un tema matemático, incluso si tiene errores ortográficos o está incompleto.

Texto del usuario: "{{{text}}}"

**INSTRUCCIONES:**
1. Analiza el texto e identifica qué tema matemático intenta escribir el usuario
2. Considera el contexto de matemáticas de primaria (6-12 años)
3. Si el texto contiene múltiples palabras, entiende la frase completa
4. Devuelve el tema corregido en español, con la primera letra en mayúscula

**TEMAS MATEMÁTICOS VÁLIDOS:**
- Suma / Adición
- Resta / Sustracción  
- Multiplicación
- División
- Fracciones
- Decimales
- Porcentajes
- Álgebra básica
- Geometría
- Medidas
- Tiempo
- Dinero
- Patrones
- Estadística básica
- Números romanos
- Potencias
- Raíces cuadradas

**EJEMPLOS DE CORRECCIONES:**
- "suma de frasioness" → "Suma de fracciones"
- "multiplicasion de desimales" → "Multiplicación de decimales"
- "divicion con resto" → "División con resto"
- "resta de numeros negativos" → "Resta de números negativos"
- "geometria figuras" → "Geometría de figuras"

**IMPORTANTE:**
- Si detectas que el usuario quiere un tema compuesto (ej: "suma de fracciones"), mantén la frase completa
- No cambies el significado, solo corrige la ortografía y formato
- Si no puedes identificar un tema matemático claro, devuelve el texto original capitalizado

Devuelve un JSON con:
- correctedTopic: El tema corregido
- confidence: Qué tan seguro estás de la corrección (0.0 a 1.0)`,
});

const correctMathTopicFlow = ai.defineFlow(
  {
    name: 'correctMathTopicFlow',
    inputSchema: CorrectMathTopicInputSchema,
    outputSchema: CorrectMathTopicOutputSchema,
  },
  async input => {
    try {
      const result = await correctMathTopicPrompt(input);
      
      if (!result || !result.output) {
        throw new Error('No output from AI prompt');
      }
      
      // Log para debugging
      console.log('[Genkit] Math topic correction:', {
        input: input.text,
        output: result.output.correctedTopic,
        confidence: result.output.confidence
      });
      
      return result.output;
    } catch (error) {
      console.error('[Genkit] Error correcting math topic:', error);
      // Fallback: capitalizar el texto original
      return {
        correctedTopic: input.text.charAt(0).toUpperCase() + input.text.slice(1).toLowerCase(),
        confidence: 0
      };
    }
  }
);