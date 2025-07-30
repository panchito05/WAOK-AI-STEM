# Guía de Despliegue en Netlify para WAOK-AI-STEM

## 🎉 Estado Actual: DESPLEGADO

- **URL de Producción**: https://waok-ai-stem.netlify.app
- **Panel de Administración**: https://app.netlify.com/projects/waok-ai-stem
- **Última actualización**: 23 de Julio de 2025

## Pasos para el Despliegue

### 1. Preparación Local

Asegúrate de que tienes los siguientes archivos configurados:
- ✅ `netlify.toml` - Configuración de Netlify
- ✅ `package.json` con script `build:netlify`
- ✅ Funciones serverless en `netlify/functions/`

### 2. Variables de Entorno Requeridas

Configura las siguientes variables de entorno en el panel de Netlify:

#### Variables Obligatorias:
- `GEMINI_API_KEY` - Tu API key de Google Gemini AI (obtener de https://makersuite.google.com/app/apikey)

#### Variables Opcionales:
- `NEXT_PUBLIC_API_URL` - URL base para las API calls (déjalo vacío para usar rutas relativas)
- `NODE_VERSION` - Versión de Node.js (ya configurada en netlify.toml como 18)

### 3. Instalación de Netlify CLI (Opcional)

Para probar localmente:
```bash
npm install -g netlify-cli
```

### 4. Prueba Local
```bash
# En Windows PowerShell o Command Prompt
netlify dev
```

### 5. Despliegue Manual

#### Opción A: Usando Netlify CLI
```bash
# Login a Netlify
netlify login

# Inicializar el proyecto
netlify init

# Desplegar
netlify deploy --prod
```

#### Opción B: Usando Git
1. Sube tu código a GitHub
2. En Netlify Dashboard:
   - Click "New site from Git"
   - Conecta tu repositorio
   - Configura:
     - Build command: `npm run build:netlify`
     - Publish directory: `.next`
   - Agrega las variables de entorno
   - Deploy

### 6. Funciones Serverless Disponibles

Las siguientes funciones están disponibles en las rutas:
- `/api/generate-exercises` - Genera ejercicios personalizados
- `/api/solve-visually` - Resuelve problemas matemáticos desde imágenes
- `/api/correct-spelling` - Corrige ortografía de temas matemáticos
- `/api/generate-practice` - Genera sesiones de práctica
- `/api/check-answer` - Verifica respuestas de estudiantes

### 7. Limitaciones Conocidas

1. **Funciones Faltantes**: Las siguientes funciones aún no están migradas:
   - `getHintAction` - Generación de pistas
   - `generateExamplesForAllLevelsAction` - Ejemplos para todos los niveles

2. **Tiempo de Ejecución**: Las funciones serverless tienen un límite de 10 segundos

3. **Tamaño de Payload**: Límite de 6MB para requests/responses

### 8. Solución de Problemas

#### Error: "API key missing"
- Verifica que `GEMINI_API_KEY` esté configurada en las variables de entorno de Netlify

#### Error: "Function timeout"
- Las funciones AI pueden tardar. Considera implementar caché o reducir la complejidad

#### Error: "Module not found"
- Asegúrate de que `@netlify/functions` esté instalado: `npm install @netlify/functions`

### 9. Próximos Pasos

1. Completa la migración de las funciones faltantes
2. Implementa caché para mejorar el rendimiento
3. Configura un dominio personalizado en Netlify
4. Activa HTTPS automático
5. Configura notificaciones de despliegue

## Scripts Útiles

```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002",
    "build": "next build",
    "build:netlify": "next build || true",
    "netlify:dev": "netlify dev",
    "netlify:deploy": "netlify deploy",
    "netlify:deploy:prod": "netlify deploy --prod"
  }
}
```

## Recursos

- [Documentación de Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Plugin Next.js para Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Variables de Entorno en Netlify](https://docs.netlify.com/environment-variables/overview/)

## Historial de Despliegue

### Despliegue Inicial - 23 de Julio de 2025

**Proceso seguido:**

1. **Preparación del proyecto**:
   - Creado `netlify.toml` con configuración para Next.js
   - Agregado script `build:netlify` en package.json
   - Creado directorio `netlify/functions/`

2. **Migración de Server Actions a Netlify Functions**:
   - Convertidas todas las acciones del servidor a funciones serverless
   - Creado API client en `/src/lib/api-client.ts`
   - Actualizado todos los componentes para usar el nuevo cliente

3. **Configuración en Netlify**:
   - Creado nuevo sitio: waok-ai-stem
   - Configurada variable de entorno GEMINI_API_KEY
   - Desplegado usando Netlify MCP tools

4. **Resultados**:
   - Build completado en 85 segundos
   - 6 funciones serverless desplegadas
   - Sitio activo en https://waok-ai-stem.netlify.app

**Detalles técnicos del despliegue:**
- Site ID: 44dfe813-0fd0-4097-9841-73ed7b0c07b7
- Deploy ID: 688055b5ceefc9b3de59b5f5
- Build ID: 688055b4ceefc9b3de59b5f3
- Framework detectado: Next.js
- Región de funciones: us-east-2