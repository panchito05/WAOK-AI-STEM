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

### Current Deployment Platform: Netlify

The application is currently deployed on Netlify with the following configuration:

#### Production URLs
- **Main URL**: https://waok-ai-stem.netlify.app
- **Deploy URL**: https://688055b5ceefc9b3de59b5f5--waok-ai-stem.netlify.app
- **Admin Panel**: https://app.netlify.com/projects/waok-ai-stem

#### Deployment Details
- **Site ID**: 44dfe813-0fd0-4097-9841-73ed7b0c07b7
- **Team**: panchito05
- **Framework**: Next.js with @netlify/plugin-nextjs
- **Functions Region**: us-east-2
- **Build Command**: `npm run build:netlify`
- **Publish Directory**: `.next`

#### Environment Variables
- `GEMINI_API_KEY`: Configured in Netlify dashboard (required)
- `NODE_VERSION`: 18 (set in netlify.toml)

### Deployment Architecture

1. **Serverless Functions**: All server actions have been migrated to Netlify Functions
   - `/api/generate-exercises` → `netlify/functions/generate-exercises.mts`
   - `/api/solve-visually` → `netlify/functions/solve-visually.mts`
   - `/api/correct-spelling` → `netlify/functions/correct-spelling.mts`
   - `/api/generate-practice` → `netlify/functions/generate-practice.mts`
   - `/api/check-answer` → `netlify/functions/check-answer.mts`

2. **API Client**: Components use `/src/lib/api-client.ts` to communicate with functions

3. **Build Configuration**: Uses `build:netlify` script to ignore TypeScript/ESLint errors

### Deployment Steps Summary

1. Created `netlify.toml` configuration file
2. Added `build:netlify` script to package.json
3. Migrated all server actions to Netlify Functions
4. Created API client for frontend communication
5. Updated all components to use API client instead of server actions
6. Deployed using Netlify MCP tools

For detailed deployment instructions, see [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)