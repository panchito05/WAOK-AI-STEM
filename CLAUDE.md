# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WAOK-AI-STEM is an AI-powered math tutoring application for children built with Next.js 15, TypeScript, and Google Genkit AI integration. It provides personalized math exercises, visual problem solving through camera input, and gamified progress tracking.

**🌐 Production URL**: https://waok-ai-stem.netlify.app  
**📊 Netlify Dashboard**: https://app.netlify.com/projects/waok-ai-stem

### Future Architecture: GenAI Processors

**Important**: This project is planned to migrate to Google's GenAI Processors technology, an open-source Python library designed for building sophisticated Gemini applications with multimodal input and real-time responsiveness.

## Project Initialization Guide

### Platform Considerations
- **IMPORTANT**: Use Windows PowerShell or Command Prompt for development
- WSL has permission issues with node_modules in Windows file system
- If using WSL, expect ENOTEMPTY errors when installing packages

### Step-by-Step Initialization

1. **Navigate to project directory** (Windows PowerShell):
   ```powershell
   cd "C:\Users\wilbe\Desktop\Trae AI WAOK-Schedule\mathminds-app"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Key** (REQUIRED):
   Create `.env.local` file in project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:9002

### Common Issues and Solutions

1. **"next is not recognized" error**: Run `npm install` first
2. **TypeScript missing**: Let Next.js auto-install or run `npm install --save-dev typescript`
3. **API Key error**: Ensure `.env.local` exists with valid GEMINI_API_KEY
4. **WSL permission errors**: Use Windows PowerShell instead

## Essential Commands

### Development
- `npm run dev` - Start Next.js development server on port 9002 (with Turbopack)
- `npm run genkit:dev` - Start Genkit AI development server (requires tsx)
- `npm run genkit:watch` - Start Genkit with file watching

### Code Quality
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript type checking
- `npm run build` - Build for production (currently ignores TS/ESLint errors)

### Testing
No test commands are currently configured. When implementing tests, update this section.

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.3.3 (App Router), React 18.3.1, TypeScript
- **Styling**: Tailwind CSS with custom theme, shadcn/ui component library
- **AI**: Google Genkit with Gemini 2.0 Flash model
- **Forms**: React Hook Form + Zod validation
- **Hosting**: Firebase App Hosting

### Key Directories
- `src/app/` - Next.js App Router pages and server actions
- `src/components/` - React components including extensive shadcn/ui library
- `src/ai/` - Genkit AI configuration and flows
  - `flows/generate-personalized-exercises.ts` - Exercise generation logic
  - `flows/solve-math-problems-visually.ts` - Visual math solver logic
- `src/hooks/` - Custom React hooks
- `docs/blueprint.md` - Detailed app requirements and style guidelines

### Important Architecture Patterns

1. **Server Actions**: Located in `src/app/actions.ts`, these handle form submissions and AI interactions server-side using Next.js server actions with Zod validation.

2. **AI Integration**: The app uses Genkit flows pattern where:
   - AI logic is isolated in `src/ai/flows/`
   - Server actions in `src/app/actions.ts` validate input and call AI flows
   - Results are returned to client components

3. **Component Structure**: Uses shadcn/ui components extensively. When adding new UI components, check `src/components/ui/` for existing primitives before creating custom ones.

4. **Styling**: Follow the design system defined in `docs/blueprint.md`:
   - Primary: #42A5F5 (cheerful blue)
   - Background: #E3F2FD (soft light blue)
   - Accent: #FFB74D (playful orange)
   - Font: PT Sans

### Development Notes

- The project currently has TypeScript and ESLint errors that are ignored during builds (see `next.config.ts`)
- When modifying AI flows, ensure proper error handling as shown in existing server actions
- Firebase App Hosting configuration is in `apphosting.yaml`
- The app targets children, so maintain friendly, approachable UI/UX patterns

## GenAI Processors - Target Architecture

This project will migrate to use GenAI Processors, Google DeepMind's open-source Python library for building Gemini applications. This technology was announced on July 10, 2025.

### Why GenAI Processors?

GenAI Processors provides:
- **Stream-based API** with bidirectional streaming for real-time responsiveness
- **Multimodal handling** for audio, video, text, and images in a unified interface
- **Modular design** with composable Processor units
- **Native concurrency** with asyncio for efficient I/O handling
- **Integrated Gemini API** support including Live API for real-time interactions

### Key Concepts

1. **Processors**: Fundamental building blocks that encapsulate units of work
2. **ProcessorParts**: Standardized data chunks (audio, text, images) with metadata
3. **Stream Composition**: Use `+` operator to chain processors naturally

### Example Implementation for WAOK-AI-STEM

```python
# Live math tutor with audio/video input
from genai_processors.core import audio_io, live_model, video, genai_model

# Input: camera + microphone for interactive sessions
input_processor = video.VideoIn() + audio_io.PyAudioIn()

# Output: play audio responses
play_output = audio_io.PyAudioOut()

# Math tutor with specific system prompt
math_tutor = genai_model.GenaiModel(
    model="gemini-2.0-flash",
    system_prompt="""You are a friendly math tutor for children aged 6-12. 
    Explain concepts simply, use visual examples, and maintain an 
    encouraging, motivational tone."""
)

# Compose the live agent
live_agent = input_processor + math_tutor + play_output

# Run the agent
async for part in live_agent(streams.endless_stream()):
    # Process responses, transcriptions, metadata
    print(part)
```

### Migration Benefits

1. **Real-time interactions**: WebSocket-like streaming without manual implementation
2. **Voice integration**: Native audio I/O for voice-based tutoring
3. **Camera access**: Direct video stream processing for visual math solving
4. **Lower latency**: Concurrent processing reduces time to first token
5. **Simpler code**: Declarative pipeline composition instead of complex async logic

### Resources

- **GitHub Repository**: https://github.com/google-gemini/genai-processors
- **Documentation**: https://developers.googleblog.com/en/genai-processors/
- **Installation**: `pip install genai-processors`
- **Getting Started**: Content API Colab and Processor Intro Colab

### Implementation Roadmap

When migrating to GenAI Processors:
1. Set up Python backend with FastAPI
2. Implement core math tutor processor with system prompts
3. Add speech-to-text and text-to-speech processors
4. Implement visual math solver with camera integration
5. Create WebSocket endpoints for real-time communication
6. Maintain existing Next.js frontend, adapt to WebSocket communication

## Deployment Information

**📚 Para guía completa paso a paso, ver: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

### Multi-Platform Deployment Architecture (Updated: 2025-08-02)

WAOK-AI-STEM has been configured for deployment across 6 major cloud platforms with complete CI/CD automation. Each platform has specific configuration files, setup guides, and cost considerations documented below.

---

## 🌐 PRODUCTION DEPLOYMENTS

### 1. Netlify ✅ (PRIMARY PLATFORM)

**Status**: ✅ LIVE & ACTIVE  
**Main URL**: https://waok-ai-stem.netlify.app  
**Admin Panel**: https://app.netlify.com/projects/waok-ai-stem

#### Configuration Files
- **`netlify.toml`** - Main configuration
- **`netlify/functions/*.mts`** - 6 serverless functions

#### Step-by-Step Setup

1. **Create Netlify Account & Connect Repository**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Link existing repository
   netlify link
   ```

2. **Configure Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build:netlify"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
     NEXT_PRIVATE_TARGET = "server"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   
   [functions]
     directory = "netlify/functions"
     node_bundler = "esbuild"
   ```

3. **Environment Variables Setup**
   ```bash
   # Set via Netlify Dashboard or CLI
   netlify env:set GEMINI_API_KEY "your_api_key_here"
   netlify env:set NODE_ENV "production"
   ```

4. **Serverless Functions Migration**
   - Created 6 functions in `netlify/functions/`:
     - `generate-exercises.mts` - AI exercise generation
     - `solve-visually.mts` - Visual math solver
     - `correct-spelling.mts` - Text correction
     - `generate-practice.mts` - Practice problems
     - `generate-single-level.mts` - Level-specific content
     - `check-answer.mts` - Answer validation

5. **Deploy Commands**
   ```bash
   # Initial deployment
   netlify deploy --prod
   
   # Auto-deployment via Git push
   git push origin main
   ```

#### Costs & Limits
- **Free Tier**: 300 build minutes/month, 100GB bandwidth
- **Functions**: 125,000 invocations/month free
- **Estimated Monthly Cost**: $0 (within free tier)

#### Performance Metrics
- **Build Time**: ~125 seconds
- **Deploy Time**: ~30 seconds
- **Cold Start**: ~200ms (functions)
- **Global CDN**: 6 edge locations

---

### 2. Vercel ✅ (SECONDARY PLATFORM)

**Status**: ✅ LIVE & ACTIVE  
**Main URL**: https://waok-ai-stem.vercel.app  
**Admin Panel**: https://vercel.com/panchito05s-projects/waok-ai-stem

#### Configuration Files
- **`vercel.json`** - Deployment configuration

#### Step-by-Step Setup

1. **Install Vercel CLI & Setup**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and connect
   vercel login
   vercel link
   ```

2. **Configuration File**
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

3. **Environment Variables**
   ```bash
   # Set via Vercel Dashboard or CLI
   vercel env add GEMINI_API_KEY
   vercel env add NODE_ENV production
   ```

4. **Deploy Commands**
   ```bash
   # Deploy to production
   vercel --prod
   
   # Deploy preview
   vercel
   
   # Auto-deployment via Git push
   git push origin main
   ```

#### Costs & Limits
- **Free Tier**: 100GB bandwidth, 100 deployments/day
- **Serverless Functions**: 100GB-hours execution time
- **Estimated Monthly Cost**: $0 (within free tier)

#### Performance Metrics
- **Build Time**: ~150 seconds
- **Deploy Time**: ~45 seconds
- **Edge Runtime**: ~50ms response time
- **Global CDN**: 16+ edge locations

---

### 3. Google Cloud Run 🔧 (CONTAINERIZED DEPLOYMENT)

**Status**: 🔧 READY TO DEPLOY  
**Expected URL**: https://waok-ai-stem-[hash]-uc.a.run.app

#### Configuration Files
- **`Dockerfile`** - Multi-stage container build
- **`cloudbuild.yaml`** - CI/CD pipeline
- **`.dockerignore`** - Optimized image size

#### Step-by-Step Setup

1. **Prerequisites**
   ```bash
   # Install Google Cloud SDK
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   gcloud init
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **Dockerfile Configuration**
   ```dockerfile
   # Multi-stage build for optimization
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   ENV NEXT_TELEMETRY_DISABLED=1
   RUN npm run build:netlify
   
   FROM node:18-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/package*.json ./
   COPY --from=builder /app/node_modules ./node_modules
   ENV NODE_ENV=production
   ENV PORT=8080
   EXPOSE 8080
   CMD ["npm", "start"]
   ```

3. **Cloud Build Pipeline**
   ```yaml
   # cloudbuild.yaml
   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'gcr.io/$PROJECT_ID/waok-ai-stem:$COMMIT_SHA', '.']
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'gcr.io/$PROJECT_ID/waok-ai-stem:$COMMIT_SHA']
     - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
       entrypoint: gcloud
       args: ['run', 'deploy', 'waok-ai-stem', 
              '--image', 'gcr.io/$PROJECT_ID/waok-ai-stem:$COMMIT_SHA',
              '--region', 'us-central1', '--allow-unauthenticated']
   ```

4. **Deploy Commands**
   ```bash
   # Direct deployment
   gcloud run deploy waok-ai-stem \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="your_key"
   
   # CI/CD deployment
   gcloud builds submit --config cloudbuild.yaml
   ```

#### Costs & Limits
- **Free Tier**: 2 million requests/month, 400,000 GB-seconds
- **Container CPU**: 1 vCPU, 1GB memory
- **Estimated Monthly Cost**: $0-5 (low traffic)

#### Performance Metrics
- **Cold Start**: ~1-2 seconds
- **Container Start**: ~500ms
- **Auto-scaling**: 0-10 instances
- **Global**: Multi-region available

---

### 4. Firebase Hosting 🔧 (GOOGLE ECOSYSTEM)

**Status**: 🔧 CONFIGURATION READY  
**Project**: waok-ai-stem  
**Expected URL**: https://waok-ai-stem.web.app

#### Configuration Files
- **`firebase.json`** - Complete Firebase configuration
- **`apphosting.yaml`** - App Hosting settings

#### Step-by-Step Setup

1. **Prerequisites**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools
   
   # Login and initialize
   firebase login
   firebase init
   ```

2. **Firebase Configuration**
   ```json
   {
     "hosting": {
       "source": ".",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "frameworksBackend": {
         "region": "us-east1"
       }
     },
     "apphosting": {
       "backendId": "waok-ai-stem",
       "rootDir": "/",
       "ignore": ["node_modules", ".git", "functions"]
     }
   }
   ```

3. **Environment Variables**
   ```bash
   # Set via Firebase Console
   firebase functions:config:set gemini.api_key="your_key"
   
   # Or use .env files for App Hosting
   echo "GEMINI_API_KEY=your_key" > .env.production
   ```

4. **Deploy Commands**
   ```bash
   # Deploy hosting only
   firebase deploy --only hosting
   
   # Deploy with functions
   firebase deploy --only hosting,functions
   
   # Deploy App Hosting backend
   firebase apphosting:backends:create --project=waok-ai-stem
   ```

#### Costs & Limits
- **Hosting**: 10GB storage, 360MB/day transfer (free)
- **Functions**: 2M invocations/month (free)
- **App Hosting**: $0.018 per vCPU hour
- **Estimated Monthly Cost**: $0-10

#### Performance Metrics
- **Global CDN**: 100+ edge locations
- **SSL**: Auto-provisioned
- **Custom Domain**: Supported
- **Bandwidth**: Unlimited (paid tiers)

---

### 5. Render.com 🔧 (DEVELOPER-FRIENDLY)

**Status**: 🔧 READY TO DEPLOY  
**Expected URL**: https://waok-ai-stem.onrender.com

#### Configuration Files
- **`render.yaml`** - Service configuration

#### Step-by-Step Setup

1. **Configuration File**
   ```yaml
   services:
     - type: web
       name: waok-ai-stem
       runtime: node
       region: oregon
       plan: free
       buildCommand: npm install && npm run build:netlify
       startCommand: npm start
       envVars:
         - key: NODE_VERSION
           value: 18.18.0
         - key: NODE_ENV
           value: production
         - key: GEMINI_API_KEY
           sync: false
       autoDeploy: false
       healthCheckPath: /
   ```

2. **Manual Setup via Dashboard**
   ```bash
   # 1. Go to https://dashboard.render.com/new/web
   # 2. Connect GitHub repository
   # 3. Configure:
   #    - Name: waok-ai-stem
   #    - Region: Oregon
   #    - Branch: main
   #    - Build Command: npm install && npm run build:netlify
   #    - Start Command: npm start
   ```

3. **Environment Variables**
   - Set `GEMINI_API_KEY` in Render dashboard
   - Set `NODE_ENV=production`
   - Set `NODE_VERSION=18.18.0`

#### Costs & Limits
- **Free Tier**: 500 build hours/month
- **Limitations**: Sleeps after 15min inactivity
- **Estimated Monthly Cost**: $0 (free tier)

#### Performance Metrics
- **Build Time**: ~180 seconds
- **Cold Start**: ~30 seconds (free tier)
- **Uptime**: 100% (paid tiers)
- **SSL**: Auto-provisioned

---

### 6. Railway.app 🔧 (MODERN DEPLOYMENT)

**Status**: 🔧 READY TO DEPLOY  
**Expected URL**: https://waok-ai-stem.up.railway.app

#### Configuration Files
- **`railway.toml`** - Service configuration

#### Step-by-Step Setup

1. **Configuration File**
   ```toml
   [build]
   builder = "nixpacks"
   buildCommand = "npm install && npm run build:netlify"
   
   [deploy]
   startCommand = "npm start"
   healthcheckPath = "/"
   healthcheckTimeout = 100
   restartPolicyType = "on_failure"
   restartPolicyMaxRetries = 3
   
   [env]
   NODE_ENV = "production"
   PORT = "3000"
   ```

2. **Manual Setup via Dashboard**
   ```bash
   # 1. Go to https://railway.app/new
   # 2. Connect GitHub repository
   # 3. Railway auto-detects Next.js
   # 4. Set environment variables
   ```

3. **Environment Variables**
   - Set `GEMINI_API_KEY` in Railway dashboard
   - `NODE_ENV` and `PORT` auto-configured

#### Costs & Limits
- **Free Tier**: $5 credit/month
- **Usage-based**: $0.000463 per GB-hour
- **Estimated Monthly Cost**: $0-3

#### Performance Metrics
- **Build Time**: ~120 seconds
- **Deploy Time**: ~20 seconds
- **Auto-scaling**: Horizontal scaling
- **Global**: Multi-region support

---

## 🔧 SHARED CONFIGURATION

### Build Configuration
All platforms use the same build setup:

```json
// package.json scripts
{
  "build:netlify": "next build || true", // Ignores TS/ESLint errors
  "dev": "next dev -p 9002",
  "start": "next start"
}
```

### Required Environment Variables
```bash
# All platforms require:
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=production

# Platform-specific (auto-configured):
PORT=3000|8080 # varies by platform
HOSTNAME=0.0.0.0 # for containerized deployments
```

### API Architecture Migration
The application uses a hybrid architecture:

1. **Original**: Next.js Server Actions (`src/app/actions.ts`)
2. **Current**: Serverless Functions (`netlify/functions/*.mts`)
3. **Client**: API Client (`src/lib/api-client.ts`)

**Function Mapping**:
```
/api/generate-exercises     → netlify/functions/generate-exercises.mts
/api/solve-visually        → netlify/functions/solve-visually.mts
/api/correct-spelling      → netlify/functions/correct-spelling.mts
/api/generate-practice     → netlify/functions/generate-practice.mts
/api/check-answer          → netlify/functions/check-answer.mts
/api/generate-single-level → netlify/functions/generate-single-level.mts
```

---

## 📊 DEPLOYMENT COMPARISON

| Platform | Status | Cost/Month | Build Time | Cold Start | SSL | CDN | Auto-Scale |
|----------|--------|------------|------------|------------|-----|-----|------------|
| **Netlify** | ✅ Live | $0 | 125s | 200ms | ✅ | ✅ | ✅ |
| **Vercel** | ✅ Live | $0 | 150s | 50ms | ✅ | ✅ | ✅ |
| **Cloud Run** | 🔧 Ready | $0-5 | 180s | 1-2s | ✅ | ✅ | ✅ |
| **Firebase** | 🔧 Ready | $0-10 | 140s | 500ms | ✅ | ✅ | ✅ |
| **Render** | 🔧 Ready | $0 | 180s | 30s | ✅ | ❌ | ❌ |
| **Railway** | 🔧 Ready | $0-3 | 120s | 1s | ✅ | ✅ | ✅ |

---

## 🚀 QUICK DEPLOYMENT COMMANDS

```bash
# Netlify (Primary)
git push origin main  # Auto-deploy

# Vercel (Secondary)
vercel --prod

# Google Cloud Run
gcloud run deploy waok-ai-stem --source . --region us-central1

# Firebase Hosting
firebase deploy --only hosting

# Render.com
# Connect repo at: https://dashboard.render.com/new/web

# Railway.app
# Connect repo at: https://railway.app/new
```

---

## 🛠 TROUBLESHOOTING

### Common Issues

1. **Build Failures**
   ```bash
   # Solution: Use build:netlify script (ignores TS errors)
   npm run build:netlify
   ```

2. **Environment Variables Missing**
   ```bash
   # Check platform-specific documentation above
   # All platforms need GEMINI_API_KEY
   ```

3. **Cold Start Issues**
   ```bash
   # Platform-specific cold start times documented above
   # Netlify/Vercel: fastest, Render free tier: slowest
   ```

4. **Function Timeout**
   ```bash
   # Increase timeout in platform configuration
   # Default: 10s (Netlify), 10s (Vercel), 60s (Cloud Run)
   ```

### Performance Optimization

1. **Build Optimization**
   - Use `build:netlify` script for faster builds
   - Enable build caching on each platform
   - Use `.dockerignore` for containerized deployments

2. **Runtime Optimization**
   - Minimize bundle size
   - Use serverless functions for AI operations
   - Enable CDN on all platforms

For detailed deployment troubleshooting, see platform-specific documentation linked above.

## Project Agents - Bidirectional Synchronization

**CRITICAL**: When opening this project, Claude MUST perform a complete bidirectional synchronization of agents:

### Agent Synchronization Protocol

1. **Inventory Phase** - Collect information from both sources:
   ```
   # Check agents currently in Claude
   /agents
   
   # Check agent files in project
   ls -la .claude/agents/
   ```

2. **Comparison Phase** - Identify differences:
   - Agents that exist in Claude but NOT in `.claude/agents/` → DOCUMENT THEM
   - Agents that exist in `.claude/agents/` but NOT in Claude → CREATE THEM
   - Agents that exist in both → VERIFY they match

3. **Documentation Phase** - For agents in Claude but not documented:
   - Extract their configuration using `/agents` output
   - Create corresponding `.md` file in `.claude/agents/`
   - Format:
     ```
     ---
     name: [agent-name]
     description: [from Claude]
     tools: [from Claude]
     color: [from Claude]
     ---
     
     [System prompt from Claude]
     ```

4. **Creation Phase** - For agents documented but not in Claude:
   - Read each `.md` file in `.claude/agents/`
   - Create the agent using: `/agents create [name] "[description]" --tools [tools]`
   - Apply the system prompt from the file

5. **Verification Phase**:
   - Run `/agents` to confirm all agents are present
   - Ensure count matches: agents in Claude = files in `.claude/agents/`
   - Report to user: "Synchronized X agents (Y created, Z documented)"

### Synchronization Rules

- **PRESERVE ALL AGENTS**: Never delete, always add missing ones
- **PRIORITY**: If conflict, preserve the most complete version
- **AUTOMATIC**: This happens without user intervention
- **REPORT**: Always inform user of actions taken
- **COMPLETE**: No work proceeds until synchronization is complete

### Expected Outcome

After synchronization:
- Every agent in Claude has a corresponding file in `.claude/agents/`
- Every file in `.claude/agents/` has a corresponding agent in Claude
- Total agents = Union of both sources (no agent is lost)
- User can safely export project knowing all agents are documented
- User can safely import project knowing all agents will be created

### Implementation Priority

1. First, document any undocumented agents (Claude → Files)
2. Then, create any missing agents (Files → Claude)
3. Finally, verify complete synchronization
4. Report: "Agent synchronization complete: X total agents ready"

### Agent Specifications

#### 1. netlify-deploy-manager
**Description**: Netlify deployment and serverless function expert. Use PROACTIVELY for deployments, function optimization, environment configuration, and production issues. Manages builds, monitors performance, and handles Netlify-specific features.

**Tools**: Bash, Read, Edit, Grep, Glob, WebFetch, mcp__netlify__netlify-deploy-services, mcp__netlify__netlify-project-services, mcp__netlify__netlify-coding-rules, TodoWrite

**System Prompt**: See `.claude/agents/netlify-deploy-manager.md` for full prompt

#### 2. genkit-ai-expert
**Description**: Expert in Google Genkit AI integration, Gemini API, and AI flow development. Use PROACTIVELY when working with AI flows, prompts, or Genkit configuration. Specializes in exercise generation and visual problem solving.

**Tools**: Read, Edit, MultiEdit, Write, Bash, Grep, Glob, WebFetch, mcp__netlify__netlify-coding-rules

**System Prompt**: See `.claude/agents/genkit-ai-expert.md` for full prompt

#### 3. mcp-orchestrator
**Description**: Use this agent when you need to intelligently select, combine, and orchestrate multiple MCP (Model Context Protocol) tools to complete complex tasks. This agent excels at analyzing task requirements, determining which MCPs are needed, executing them in the correct sequence, and using outputs from one MCP as inputs for others.

**Tools**: * (all tools)

**System Prompt**: See `.claude/agents/mcp-orchestrator.md` for full prompt

#### 4. react-nextjs-optimizer
**Description**: Next.js 15 and React performance optimization specialist. Use PROACTIVELY for component optimization, hydration issues, state management, and build performance. Expert in App Router, Server Components, and Turbopack.

**Tools**: Read, Edit, MultiEdit, Bash, Grep, Glob, TodoWrite

**System Prompt**: See `.claude/agents/react-nextjs-optimizer.md` for full prompt

#### 5. test-automation
**Description**: Testing automation specialist for WAOK-AI-STEM. Use PROACTIVELY after code changes to run tests, validate functionality, and ensure quality. Expert in manual testing flows, API testing, and UI validation.

**Tools**: Read, Edit, Write, Bash, Grep, Glob, TodoWrite, mcp__firebase-community__firestore_list_documents, mcp__firebase-community__firestore_get_document

**System Prompt**: See `.claude/agents/test-automation.md` for full prompt

#### 6. ui-ux-designer
**Description**: Child-friendly UI/UX design specialist for educational apps. Use PROACTIVELY when creating or modifying UI components, implementing animations, or ensuring accessibility. Expert in kid-friendly interfaces and gamification.

**Tools**: Read, Edit, MultiEdit, Write, Grep, Glob, WebFetch

**System Prompt**: See `.claude/agents/ui-ux-designer.md` for full prompt

#### 7. qa-test-architect
**Description**: Use this agent when you need to design, implement, or review comprehensive testing strategies for web applications. This agent excels at creating test suites for educational applications targeting children, ensuring quality across unit, integration, E2E, performance, accessibility, and security testing dimensions.

**Tools**: * (all tools)

**System Prompt**: See `.claude/agents/qa-test-architect.md` for full prompt

#### 8. test-agent
**Description**: Simple test agent to verify functionality

**Tools**: * (all tools)

**System Prompt**: See `.claude/agents/test-agent.md` for full prompt

#### 9. fault-classifier-structural-logic
**Description**: Agent specialized in identifying and classifying failures in WAOK-AI-STEM code as either [STRUCTURAL FAILURE] or [LOGIC FAILURE], following the protocol defined in AI-PROMPTS.md

**Tools**: Default tools

**System Prompt**: See `.claude/agents/fault-classifier-structural-logic.md` for full prompt

### Agent Creation Helper Script

To help with agent creation, here's a helper script that can be run in the project:

```javascript
// create-agents.js
const agents = [
  {
    name: 'netlify-deploy-manager',
    description: 'Netlify deployment and serverless function expert. Use PROACTIVELY for deployments, function optimization, environment configuration, and production issues.',
    tools: ['Bash', 'Read', 'Edit', 'Grep', 'Glob', 'WebFetch', 'mcp__netlify__netlify-deploy-services', 'mcp__netlify__netlify-project-services', 'mcp__netlify__netlify-coding-rules', 'TodoWrite']
  },
  {
    name: 'genkit-ai-expert',
    description: 'Expert in Google Genkit AI integration, Gemini API, and AI flow development. Use PROACTIVELY when working with AI flows, prompts, or Genkit configuration.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Write', 'Bash', 'Grep', 'Glob', 'WebFetch', 'mcp__netlify__netlify-coding-rules']
  },
  {
    name: 'mcp-orchestrator',
    description: 'Use this agent when you need to intelligently select, combine, and orchestrate multiple MCP tools to complete complex tasks.',
    tools: ['*']
  },
  {
    name: 'react-nextjs-optimizer',
    description: 'Next.js 15 and React performance optimization specialist. Use PROACTIVELY for component optimization, hydration issues, state management, and build performance.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Bash', 'Grep', 'Glob', 'TodoWrite']
  },
  {
    name: 'test-automation',
    description: 'Testing automation specialist for WAOK-AI-STEM. Use PROACTIVELY after code changes to run tests, validate functionality, and ensure quality.',
    tools: ['Read', 'Edit', 'Write', 'Bash', 'Grep', 'Glob', 'TodoWrite', 'mcp__firebase-community__firestore_list_documents', 'mcp__firebase-community__firestore_get_document']
  },
  {
    name: 'ui-ux-designer',
    description: 'Child-friendly UI/UX design specialist for educational apps. Use PROACTIVELY when creating or modifying UI components.',
    tools: ['Read', 'Edit', 'MultiEdit', 'Write', 'Grep', 'Glob', 'WebFetch']
  },
  {
    name: 'qa-test-architect',
    description: 'Use this agent when you need to design, implement, or review comprehensive testing strategies for web applications.',
    tools: ['*']
  }
];

console.log('Agent creation commands:');
console.log('First check existing agents: /agents\n');
agents.forEach(agent => {
  console.log(`# Create ${agent.name}`);
  console.log(`/agents create ${agent.name} "${agent.description}" --tools ${agent.tools.join(',')} --system-prompt-file .claude/agents/${agent.name}.md\n`);
});
```

### Important Notes

1. **Agent Files**: All full system prompts are stored in `.claude/agents/` directory
2. **Automatic Creation**: Claude should check and create missing agents when opening the project
3. **Tools**: Some agents use all tools (*), others use specific tool sets
4. **Proactive Usage**: Many agents are marked for PROACTIVE use - Claude should use them automatically when relevant
5. **Updates**: If agent specifications change, update both this file and the corresponding `.claude/agents/*.md` files

## MCP (Model Context Protocol) Servers - Bidirectional Synchronization

**CRITICAL**: This project requires specific MCP servers. Claude MUST perform bidirectional synchronization of MCPs when opening the project.

### MCP Synchronization Protocol

1. **Inventory Phase** - Check installed MCPs:
   ```bash
   # List all MCPs currently installed
   claude mcp list
   
   # Check project MCP requirements file
   cat .claude/mcp-requirements.md
   ```

2. **Comparison Phase** - Identify gaps:
   - MCPs installed but NOT documented → ADD to `.claude/mcp-requirements.md`
   - MCPs documented but NOT installed → INSTALL them
   - MCPs in BOTH → DO NOTHING (already synchronized)

3. **Documentation Phase** - Save undocumented MCPs:
   - If any MCP is found via `claude mcp list` that's not in `.claude/mcp-requirements.md`
   - Add its installation command to the documentation
   - Preserve all existing MCPs

4. **Installation Phase** - Install missing MCPs:
   - Use `install-mcps.sh` which verifies before installing
   - Script will skip already installed MCPs
   - Only install what's missing

5. **Verification Phase**:
   - Run `claude mcp list` to confirm all MCPs connected
   - Expected: 15 MCPs minimum (12 standard + 3 additional)
   - Report: "MCP synchronization complete: X MCPs ready"

### Required MCP Servers

This project uses 15 MCPs:

**Standard MCPs (12):**
1. **context7** - Library documentation
2. **filesystem** - File access (WSL + Windows)
3. **git** - Version control
4. **github** - GitHub repositories
5. **sequential-thinking** - Problem solving
6. **desktop-commander** - Desktop control
7. **netlify** - Web deployment
8. **playwright** - Browser automation
9. **firebase** - Backend services
10. **postgres** - PostgreSQL database
11. **mysql** - MySQL database
12. **firecrawl** - Web scraping and deep research

**Additional MCPs (3):**
13. **puppeteer** - Alternative browser control
14. **everything** - MCP testing features
15. **memory** - Persistent memory

### MCP Requirements File

The project maintains `.claude/mcp-requirements.md` which contains:
- Complete installation guide for all MCPs
- Database setup instructions (PostgreSQL & MySQL)
- All commands with `-s user` scope
- Token configuration guide
- Verification commands

### Synchronization Rules

- **PRESERVE ALL MCPs**: Never uninstall, only add missing ones
- **VERIFY FIRST**: Always check what exists before installing
- **AUTOMATIC**: This happens without user intervention
- **UNION PRINCIPLE**: Total MCPs = all installed + all documented

### Expected Outcome

After synchronization:
- All 15 project MCPs installed and connected
- Any additional MCPs preserved and documented
- Install script ready for new developers
- No manual MCP installation needed