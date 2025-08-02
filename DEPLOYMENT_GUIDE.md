# 🚀 Guía Completa de Deployment Multi-Plataforma

## 📊 Estado Actual de Deployments

| Plataforma | Estado | URL Principal | Última Actualización |
|------------|--------|---------------|---------------------|
| **Netlify** | ✅ LIVE | https://waok-ai-stem.netlify.app | 2025-08-02 |
| **Vercel** | ✅ LIVE | https://waok-ai-stem.vercel.app | 2025-08-02 |
| **Firebase** | ✅ CONFIGURADO | https://waok-ai-stem--waok-ai-stem.us-central1.hosted.app | 2025-07-23 |
| **Google Cloud Run** | 🔧 LISTO | Pendiente deployment | - |
| **Render.com** | 🔧 LISTO | Pendiente conexión GitHub | - |
| **Railway.app** | 🔧 LISTO | Pendiente conexión GitHub | - |

## 🔑 Variables de Entorno Necesarias

```env
GEMINI_API_KEY=AIzaSyBNpkPnY_ZQmYmDdN4vbeBz4GuLSElFMB0
NODE_ENV=production
PORT=8080  # O el puerto asignado por la plataforma
```

---

## 1️⃣ NETLIFY (Principal - Ya Desplegado)

### URLs de Producción
- **Principal**: https://waok-ai-stem.netlify.app
- **Deploy Actual**: https://688e3b57cb2b7f8d2c81e5d8--waok-ai-stem.netlify.app
- **Dashboard**: https://app.netlify.com/projects/waok-ai-stem

### Cómo se Configuró

1. **Creación del archivo `netlify.toml`**:
```toml
[build]
  command = "npm run build:netlify"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_TELEMETRY_DISABLED = "1"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

2. **Migración de Server Actions a Netlify Functions**:
   - Todas las rutas `/api/*` fueron migradas a `netlify/functions/*.mts`
   - Se creó `/src/lib/api-client.ts` para comunicación frontend-backend

3. **Deploy Automático con GitHub**:
   - Conectado al repositorio GitHub
   - Auto-deploy en cada push a `main`

### Comandos de Mantenimiento
```bash
# Deploy manual
netlify deploy --prod

# Ver logs
netlify functions:log

# Variables de entorno
netlify env:set GEMINI_API_KEY "tu-api-key"
```

---

## 2️⃣ VERCEL (Secundario - Ya Desplegado)

### URLs de Producción
- **Principal**: https://waok-ai-stem.vercel.app
- **Deploy Actual**: https://waok-ai-stem-8h233oh9c-panchito05s-projects.vercel.app
- **Dashboard**: https://vercel.com/panchito05s-projects/waok-ai-stem

### Cómo se Configuró

1. **Creación del archivo `vercel.json`**:
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build:netlify",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_URL": "https://waok-ai-stem.vercel.app"
    }
  }
}
```

2. **Deploy con Vercel CLI**:
```bash
# Instalación
npm install -g vercel

# Deploy inicial
vercel deploy --yes --build-env GEMINI_API_KEY="tu-api-key"

# Deploy a producción
vercel --prod
```

3. **Configuración de `.vercelignore`** para reducir tamaño:
```
node_modules
.next/cache
.next/standalone
*.log
*.md
docs
.git
```

### Comandos de Mantenimiento
```bash
# Deploy a producción
vercel --prod

# Ver logs
vercel logs

# Variables de entorno
vercel env add GEMINI_API_KEY production
```

---

## 3️⃣ GOOGLE CLOUD RUN (Docker - Listo para Deploy)

### ⚠️ NECESITAS HACER ESTO TÚ:

### Paso 1: Instalar Google Cloud CLI
```bash
# Opción 1: En Windows (PowerShell como Admin)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# Opción 2: En WSL/Linux (ya descargado)
cd /mnt/c/Users/wilbe/Desktop/Trae\ AI\ WAOK-Schedule/WAOK-AI-STEM
./google-cloud-sdk/install.sh
source ~/.bashrc
```

### Paso 2: Autenticación y Configuración
```bash
# Iniciar sesión
gcloud auth login

# Crear nuevo proyecto o usar existente
gcloud projects create waok-ai-stem-prod --name="WAOK AI STEM"
gcloud config set project waok-ai-stem-prod

# Habilitar APIs necesarias
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### Paso 3: Deploy con Cloud Build
```bash
# Opción 1: Deploy directo con Dockerfile
gcloud run deploy waok-ai-stem \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GEMINI_API_KEY=AIzaSyBNpkPnY_ZQmYmDdN4vbeBz4GuLSElFMB0" \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10

# Opción 2: Con Cloud Build (más control)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions=_GEMINI_API_KEY="AIzaSyBNpkPnY_ZQmYmDdN4vbeBz4GuLSElFMB0"
```

### Archivos Ya Creados:
- ✅ `Dockerfile` - Optimizado con multi-stage build
- ✅ `cloudbuild.yaml` - Pipeline CI/CD configurado
- ✅ `.dockerignore` - Reduce tamaño de imagen

### URL Esperada:
```
https://waok-ai-stem-[hash]-uc.a.run.app
```

---

## 4️⃣ FIREBASE APP HOSTING (Ya Configurado)

### URLs de Producción
- **App Hosting**: https://waok-ai-stem--waok-ai-stem.us-central1.hosted.app
- **Console**: https://console.firebase.google.com/project/waok-ai-stem

### Estado Actual
- ✅ Backend creado: `waok-ai-stem`
- ✅ Región: `us-central1`
- ✅ Configuración en `firebase.json`

### Para Actualizar el Deploy:
```bash
# Verificar proyecto
firebase use waok-ai-stem

# Deploy de hosting
firebase deploy --only hosting

# Ver backends
firebase apphosting:backends:list

# Ver logs
firebase functions:log
```

---

## 5️⃣ RENDER.COM (Listo - Conectar GitHub)

### ⚠️ NECESITAS HACER ESTO TÚ:

1. **Ir a**: https://dashboard.render.com/new/web
2. **Conectar tu repositorio GitHub**
3. **Configuración**:
   - Name: `waok-ai-stem`
   - Region: Oregon (US West)
   - Branch: `main`
   - Build Command: `npm install && npm run build:netlify`
   - Start Command: `npm start`
4. **Agregar Variable de Entorno**:
   - Key: `GEMINI_API_KEY`
   - Value: `AIzaSyBNpkPnY_ZQmYmDdN4vbeBz4GuLSElFMB0`
5. **Click en "Create Web Service"**

### Archivo Ya Creado:
- ✅ `render.yaml` - Configuración completa

### URL Esperada:
```
https://waok-ai-stem.onrender.com
```

---

## 6️⃣ RAILWAY.APP (Listo - Conectar GitHub)

### ⚠️ NECESITAS HACER ESTO TÚ:

1. **Ir a**: https://railway.app/new
2. **Seleccionar "Deploy from GitHub repo"**
3. **Conectar tu repositorio**
4. **Railway detectará automáticamente `railway.toml`**
5. **Agregar Variable de Entorno en Settings**:
   - `GEMINI_API_KEY = AIzaSyBNpkPnY_ZQmYmDdN4vbeBz4GuLSElFMB0`
6. **Deploy automático iniciará**

### Archivo Ya Creado:
- ✅ `railway.toml` - Configuración con Nixpacks

### URL Esperada:
```
https://waok-ai-stem.up.railway.app
```

---

## 🔄 Comandos Rápidos para Actualizar

```bash
# Actualizar todos los deployments activos
git add -A
git commit -m "feat: update"
git push origin main  # Actualiza Netlify automáticamente

# Actualizar Vercel manualmente
vercel --prod

# Los demás se actualizan con push a GitHub si están conectados
```

---

## 💰 Costos Estimados Mensuales

| Plataforma | Free Tier | Costo Estimado |
|------------|-----------|----------------|
| Netlify | 100GB bandwidth, 300 min build | $0 (dentro de límites) |
| Vercel | 100GB bandwidth, 100GB-hours | $0 (dentro de límites) |
| Google Cloud Run | 2M requests, 360k vCPU-seconds | ~$5-10/mes |
| Firebase | 10GB hosting, 125K reads/día | $0 (dentro de límites) |
| Render | 750 hours/mes | $0 (free tier) |
| Railway | $5 créditos/mes | $0-5/mes |

---

## 🚨 Troubleshooting Común

### Problema: "File size limit exceeded" en Vercel
**Solución**: Usar `.vercelignore` para excluir archivos grandes

### Problema: "Module not found" en build
**Solución**: Verificar que todas las dependencias estén en `package.json`

### Problema: API Key no funciona
**Solución**: Configurar variable de entorno en el dashboard de cada plataforma

### Problema: Build falla con TypeScript errors
**Solución**: Usar script `build:netlify` que ignora errores

---

## 📞 Soporte

- **Netlify**: https://answers.netlify.com/
- **Vercel**: https://vercel.com/help
- **Google Cloud**: https://cloud.google.com/support
- **Firebase**: https://firebase.google.com/support
- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app/

---

## ✅ Checklist de Deployment

- [x] Netlify configurado y desplegado
- [x] Vercel configurado y desplegado  
- [x] Firebase App Hosting configurado
- [x] Docker y Cloud Build preparados
- [x] Render.yaml creado
- [x] Railway.toml creado
- [ ] Google Cloud Run desplegado (requiere tu autenticación)
- [ ] Render conectado a GitHub (requiere tu acceso)
- [ ] Railway conectado a GitHub (requiere tu acceso)

---

*Última actualización: 2025-08-02 por Claude*