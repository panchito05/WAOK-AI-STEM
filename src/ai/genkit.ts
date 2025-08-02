import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {getGeminiApiKey, debugEnvironment} from './config';

// Debug environment on initialization
debugEnvironment();

let apiKey: string | undefined;
try {
  apiKey = getGeminiApiKey();
  console.log('[Genkit] Successfully loaded API key');
} catch (error) {
  console.error('[Genkit] Failed to load API key:', error);
  // Don't throw here, let it fail when actually trying to use the API
}

export const ai = genkit({
  plugins: [googleAI({
    apiKey: apiKey
  })],
  model: 'googleai/gemini-2.5-pro',
});
