# MathMinds - AI-Powered Math Tutoring App

MathMinds is an AI-powered math tutoring application for children built with Next.js 15, TypeScript, and Google Genkit AI integration.

🌐 **Live Demo**: https://mathminds-app.netlify.app

## Prerequisites

- Node.js 18+ 
- npm (yarn is not configured for this project)
- Google Gemini API key

## Quick Start

### 1. Install Dependencies

```bash
# Windows PowerShell / Command Prompt
cd "C:\Users\wilbe\Desktop\Trae AI WAOK-Schedule\mathminds-app"
npm install

# Linux/Mac/WSL (Note: May have permission issues, use Windows instead)
cd /mnt/c/Users/wilbe/Desktop/Trae\ AI\ WAOK-Schedule/mathminds-app
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Start Development Server

```bash
# Windows PowerShell / Command Prompt (RECOMMENDED)
npm run dev

# The app will be available at:
# - Local: http://localhost:9002
# - Network: http://[your-ip]:9002
```

## Available Scripts

- `npm run dev` - Start Next.js development server on port 9002 with Turbopack
- `npm run genkit:dev` - Start Genkit AI development server
- `npm run genkit:watch` - Start Genkit with file watching
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript type checking

## Common Issues

### "next is not recognized" Error
If you get this error, make sure dependencies are installed:
```bash
npm install
```

### Permission Errors in WSL
WSL has known permission issues with this project. **Use Windows PowerShell or Command Prompt instead**:
1. Open PowerShell as Administrator
2. Navigate to project directory
3. Run `npm install` and `npm run dev`

### API Key Error
If you see "FAILED_PRECONDITION: Please pass in the API key":
1. Create `.env.local` file in the project root
2. Add: `GEMINI_API_KEY=your_actual_api_key_here`
3. Restart the development server

### TypeScript Installation Issues
If Next.js prompts to install TypeScript:
1. Let it auto-install, or
2. Manually install: `npm install --save-dev typescript @types/react @types/node`

## Project Structure

- `/src/app` - Next.js App Router pages and server actions
- `/src/components` - React components
- `/src/ai` - Genkit AI flows and configuration
- `/src/hooks` - Custom React hooks
- `/docs` - Project documentation
- `/netlify/functions` - Netlify serverless functions

## Deployment

This app is deployed on Netlify. For deployment instructions, see:
- [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) - Complete deployment guide
- [CLAUDE.md](./CLAUDE.md) - AI assistant instructions including deployment info
