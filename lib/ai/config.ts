import { google } from '@ai-sdk/google';

export type ThinkingLevel = 'minimal' | 'low' | 'medium' | 'high';

// Gemini 3 Flash model configuration
export const GEMINI_MODEL = 'gemini-3-flash-preview';

// Gemini 3 requires temperature of 1.0 for optimal performance
export const DEFAULT_TEMPERATURE = 1.0;

// Get Gemini model with optional thinking level configuration
export function getGeminiModel(thinkingLevel: ThinkingLevel = 'medium') {
  return google(GEMINI_MODEL);
}

// Provider options for different use cases
export function getProviderOptions(thinkingLevel: ThinkingLevel = 'medium') {
  return {
    google: {
      thinkingConfig: {
        thinkingLevel,
      },
    },
  };
}

// Predefined configurations for common scenarios
export const AI_PRESETS = {
  // Fast extraction - minimal thinking for quick context parsing
  extraction: {
    model: google(GEMINI_MODEL),
    temperature: DEFAULT_TEMPERATURE,
    providerOptions: getProviderOptions('minimal'),
  },
  // Standard chat - low thinking for responsive conversations
  chat: {
    model: google(GEMINI_MODEL),
    temperature: DEFAULT_TEMPERATURE,
    providerOptions: getProviderOptions('low'),
  },
  // Complex analysis - medium thinking for product comparisons
  analysis: {
    model: google(GEMINI_MODEL),
    temperature: DEFAULT_TEMPERATURE,
    providerOptions: getProviderOptions('medium'),
  },
} as const;
