# Cómo configurar tu propia API Key de Gemini

## El problema
La aplicación usa una API key gratuita con límite de 200 solicitudes diarias. Si ves el error "Se ha alcanzado el límite diario de solicitudes", necesitas configurar tu propia API key.

## Pasos para obtener una API Key gratuita

1. **Visita Google AI Studio**
   - Ve a: https://aistudio.google.com/

2. **Inicia sesión con tu cuenta de Google**

3. **Obtén tu API Key**
   - Haz clic en "Get API key" en el menú lateral
   - Crea un nuevo proyecto o selecciona uno existente
   - Copia la API key generada

## Configuración en desarrollo local

1. **Crea el archivo `.env.local`** en la raíz del proyecto
2. **Añade tu API key**:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   ```
3. **Reinicia el servidor de desarrollo**

## Configuración en Netlify (producción)

1. **Ve al panel de Netlify**
   - https://app.netlify.com/sites/mathminds-app/settings/env

2. **Añade la variable de entorno**
   - Variable name: `GEMINI_API_KEY`
   - Value: tu API key
   - Haz clic en "Save"

3. **Redespliega el sitio**
   - El sitio se redespliegará automáticamente con la nueva configuración

## Límites del plan gratuito personal
- 1,500 solicitudes por día (vs 200 compartidas)
- Suficiente para uso personal intensivo

## ¿Necesitas más?
Para uso comercial o mayor volumen, considera el plan de pago de Google AI:
https://ai.google.dev/pricing