// Configuration for AI services with Netlify Functions support

export const getGeminiApiKey = (): string => {
  // For Netlify Functions - environment variables are available in process.env
  if (process.env.GEMINI_API_KEY) {
    console.log('[AI Config] Using process.env for API key (Netlify Functions)');
    return process.env.GEMINI_API_KEY;
  }
  
  // For local development with .env.local
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.log('[AI Config] Using NEXT_PUBLIC env for API key');
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  
  console.error('[AI Config] No API key found in any environment');
  throw new Error('GEMINI_API_KEY not found in environment variables');
};

// Export for debugging
export const debugEnvironment = () => {
  console.log('[AI Config] Environment debug:', {
    hasProcessEnv: !!process.env.GEMINI_API_KEY,
    hasNextPublicEnv: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    apiKeyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
    timestamp: new Date().toISOString()
  });
};