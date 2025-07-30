# AI-PROBLEMS.md

## Problema: Pérdida de Ejemplos al Regenerar

### Descripción del Problema
Cuando un usuario tiene múltiples ejemplos en un nivel (por ejemplo, 5 ejemplos: 3 generados por IA y 2 agregados manualmente) y presiona el botón de regenerar, el sistema siempre genera solo 3 ejemplos nuevos en lugar de mantener la cantidad total de 5, perdiendo así los ejemplos extras que el usuario había agregado.

### Comportamiento Esperado
El sistema debería contar la cantidad total de ejemplos actuales antes de regenerar y usar ese número para generar la misma cantidad de ejemplos nuevos, manteniendo así la experiencia del usuario que esperaba trabajar con 5 ejemplos y no verse reducido a solo 3.

### Ejemplo del Caso de Uso
1. Usuario crea una tarjeta nueva → Sistema genera 3 ejemplos por defecto ✓
2. Usuario agrega manualmente 2 ejemplos más → Total: 5 ejemplos ✓
3. Usuario presiona "Regenerar ejemplos" → Sistema debería generar 5 nuevos ejemplos ✗
4. Resultado actual: Sistema genera solo 3 ejemplos, perdiendo la cantidad adicional

### Impacto en la Experiencia del Usuario
- Frustración al perder trabajo manual (ejemplos agregados)
- Necesidad de volver a agregar ejemplos después de cada regeneración
- Interrupción del flujo de trabajo educativo

### Solución Intentada
Se implementó un sistema de conteo de ejemplos actuales que pasa la cantidad como parámetro a través de toda la cadena de llamadas (Frontend → API → Backend), pero la solución no funcionó como se esperaba.

### Estado Actual
Pendiente de investigación adicional para identificar por qué la implementación no está funcionando correctamente.