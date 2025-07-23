// Configuration for AI services with Netlify Functions support

export const getGeminiApiKey = (): string => {
  // For Netlify Functions context
  if (typeof Netlify !== 'undefined' && Netlify?.env?.get) {
    const netlifyKey = Netlify.env.get('GEMINI_API_KEY');
    if (netlifyKey) {
      console.log('[AI Config] Using Netlify.env for API key');
      return netlifyKey;
    }
  }
  
  // For Next.js server context
  if (process.env.GEMINI_API_KEY) {
    console.log('[AI Config] Using process.env for API key');
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
    hasNetlify: typeof Netlify !== 'undefined',
    hasNetlifyEnv: typeof Netlify !== 'undefined' && !!Netlify?.env,
    hasProcessEnv: !!process.env.GEMINI_API_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};