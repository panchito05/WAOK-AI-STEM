# Solución: Problema de Cambio Automático de Ejercicios

## Problema Identificado
El primer ejercicio de una tarjeta cambiaba automáticamente después de mostrarse. Por ejemplo:
- Se mostraba: "1/3 + 6/3 = ?"
- Cambiaba a: "7/15 + 9/25 = ?"

## Causa Raíz
React Strict Mode (habilitado por defecto en Next.js 15 en desarrollo) causa que los componentes se monten DOS VECES para detectar efectos secundarios. Esto provocaba:

1. **Primer montaje**: Obtiene y consume ejercicio "1/3 + 6/3 = ?"
2. **Desmontaje**: (Strict Mode)
3. **Segundo montaje**: Obtiene ejercicio "7/15 + 9/25 = ?" (el primero ya fue consumido)

## Solución Implementada

### 1. Operación Atómica en PracticeScreen
Cambiamos de un patrón no idempotente:
```typescript
// ANTES (problemático)
const cachedExercises = exerciseCache.getWithoutConsuming(...);
setExercises(cachedExercises);
exerciseCache.consumeFromPool(...);
```

A un patrón idempotente:
```typescript
// DESPUÉS (correcto)
let exercises = exerciseCache.consumeFromPool(...);
if (exercises.length >= card.exerciseCount) {
  setExercises(exercises);
} else {
  // Devolver al pool si no son suficientes
  exerciseCache.addToPool(card.id, exercises);
  // Generar nuevos
}
```

### 2. Logs de Diagnóstico
Se agregaron logs en puntos clave:
- `[PracticeScreen] Loading exercises for card:` - Cuando se cargan ejercicios
- `[PracticeScreen] Current exercise changed:` - Cuando cambia el ejercicio actual
- `[DrawingCanvas] Operation text changed:` - Cuando cambia el texto en el canvas

## Verificación
Para verificar que el problema está resuelto:

1. Abrir la consola del navegador (F12)
2. Crear o seleccionar una tarjeta
3. Observar que el primer ejercicio NO cambia después de mostrarse
4. Los logs mostrarán si hay múltiples cambios no esperados

## Notas Importantes
- En desarrollo, es normal ver logs duplicados debido a React Strict Mode
- Lo importante es que el ejercicio visible NO cambie
- Esta solución es compatible con React Strict Mode y producción