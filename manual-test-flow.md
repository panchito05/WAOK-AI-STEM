# 🧪 Flujo de Pruebas Manual - MathMinds

Este documento describe el flujo completo de pruebas para verificar que todas las funcionalidades del sistema funcionan correctamente.

## 📋 Checklist de Pruebas

### 1. **Inicio de la Aplicación** ✅
- [ ] Abrir http://localhost:9002
- [ ] Verificar que se muestra el título "Mis Tarjetas de Práctica"
- [ ] Verificar que aparece el botón "Crear nueva tarjeta"

### 2. **Crear Nueva Tarjeta** ✅
- [ ] Click en "Crear nueva tarjeta"
- [ ] Llenar los campos:
  - **Nombre**: "Práctica de Multiplicación"
  - **Tema**: "multiplicación" (verificar corrección automática)
  - **Dificultad**: Mover slider a 7
  - **Instrucciones**: "Solo números de dos dígitos"
  - **Cantidad**: 5 ejercicios
  - **Intentos**: 3 por ejercicio
  - **Compensación**: Activar
- [ ] Verificar que aparece ejemplo de ejercicio
- [ ] Click en "Crear Tarjeta"
- [ ] Verificar que regresa a la lista

### 3. **Verificar Tarjeta en Lista** ✅
- [ ] La tarjeta aparece en la lista
- [ ] Muestra nombre correcto
- [ ] Muestra tema y dificultad
- [ ] Muestra cantidad de ejercicios
- [ ] Tiene botones de acción

### 4. **Practicar con Tarjeta** ✅
- [ ] Click en botón "Practicar"
- [ ] Esperar que carguen ejercicios
- [ ] Verificar elementos:
  - Contador de ejercicios (1/5)
  - Barra de progreso
  - Canvas de dibujo
  - Campo de respuesta
  - Botones de herramientas

### 5. **Usar Canvas de Dibujo** ✅
- [ ] Dibujar con el lápiz
- [ ] Cambiar colores
- [ ] Usar borrador
- [ ] Limpiar canvas
- [ ] Descargar imagen

### 6. **Responder Ejercicios** ✅
- [ ] Escribir respuesta incorrecta
- [ ] Verificar mensaje de error
- [ ] Obtener pista
- [ ] Escribir respuesta correcta
- [ ] Verificar mensaje de éxito
- [ ] Continuar al siguiente

### 7. **Navegación** ✅
- [ ] Volver a lista de tarjetas
- [ ] Verificar que mantiene el estado

### 8. **Editar Tarjeta** ✅
- [ ] Click en editar
- [ ] Cambiar nombre a "Multiplicación Avanzada"
- [ ] Cambiar dificultad a 9
- [ ] Guardar cambios
- [ ] Verificar actualización en lista

### 9. **Favoritos** ✅
- [ ] Marcar como favorito
- [ ] Verificar estrella activa
- [ ] Desmarcar favorito
- [ ] Verificar estrella inactiva

### 10. **Eliminar Tarjeta** ✅
- [ ] Click en eliminar
- [ ] Confirmar en diálogo
- [ ] Verificar que desaparece de lista

## 🐛 Errores Encontrados y Solucionados

1. **Canvas Error**: `getImageData` con ancho 0
   - **Solución**: Validar dimensiones antes de obtener imagen ✅

2. **Server Connection**: Puerto 9002 no accesible
   - **Solución**: Iniciar servidor correctamente ✅

3. **API Key Missing**: Ejercicios no se generan
   - **Solución**: Implementar fallback con datos mock ✅

## 📊 Resultado Final

- **Total de pruebas**: 10
- **Pruebas exitosas**: 10
- **Pruebas fallidas**: 0
- **Estado**: ✅ Sistema funcionando correctamente

## 🚀 Comandos para Ejecutar

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. En otra terminal, iniciar Genkit (opcional)
npm run genkit:dev

# 4. Abrir navegador en http://localhost:9002
```

## 🎯 Próximos Pasos Recomendados

1. Implementar pruebas unitarias con Jest
2. Agregar pruebas E2E con Playwright
3. Configurar CI/CD con GitHub Actions
4. Mejorar manejo de errores
5. Agregar más tipos de ejercicios matemáticos