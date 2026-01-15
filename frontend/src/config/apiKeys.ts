// API Key Configuration with Fallback Support
// This file manages multiple API keys for different services with automatic fallback

export interface APIKeyConfig {
    key: string;
    provider: 'openrouter' | 'groq' | 'gemini';
    name: string;
}

// Multiple API keys with fallback support
// Keys are loaded from environment variables for security
export const API_KEYS: APIKeyConfig[] = [
    // OpenRouter API Keys
    {
        key: process.env.REACT_APP_OPENROUTER_KEY_1 || '',
        provider: 'openrouter',
        name: 'OpenRouter Primary'
    },
    {
        key: process.env.REACT_APP_OPENROUTER_KEY_2 || '',
        provider: 'openrouter',
        name: 'OpenRouter Secondary'
    },
    // Groq API Keys
    {
        key: process.env.REACT_APP_GROQ_KEY_1 || '',
        provider: 'groq',
        name: 'Groq Primary'
    },
    {
        key: process.env.REACT_APP_GROQ_KEY_2 || '',
        provider: 'groq',
        name: 'Groq Secondary'
    },
    // Gemini API Key (existing)
    {
        key: process.env.REACT_APP_GEMINI_KEY || '',
        provider: 'gemini',
        name: 'Gemini Primary'
    }
];

// Track which API key is currently active
let currentKeyIndex = 0;
const failedKeys = new Set<number>();

/**
 * Get the current active API key
 */
export const getCurrentAPIKey = (): APIKeyConfig => {
    return API_KEYS[currentKeyIndex];
};

/**
 * Get all API keys for a specific provider
 */
export const getKeysByProvider = (provider: 'openrouter' | 'groq' | 'gemini'): APIKeyConfig[] => {
    return API_KEYS.filter(config => config.provider === provider);
};

/**
 * Mark current key as failed and switch to next available key
 * Returns true if a fallback key is available, false if all keys have been tried
 */
export const switchToNextKey = (): boolean => {
    failedKeys.add(currentKeyIndex);

    // Find next available key that hasn't failed
    for (let i = 0; i < API_KEYS.length; i++) {
        const nextIndex = (currentKeyIndex + i + 1) % API_KEYS.length;
        if (!failedKeys.has(nextIndex)) {
            currentKeyIndex = nextIndex;
            console.log(`Switched to fallback API key: ${API_KEYS[currentKeyIndex].name}`);
            return true;
        }
    }

    // All keys have failed
    console.error('All API keys have failed');
    return false;
};

/**
 * Reset failed keys tracking (useful for periodic retry)
 */
export const resetFailedKeys = (): void => {
    failedKeys.clear();
    currentKeyIndex = 0;
    console.log('API key failure tracking has been reset');
};

/**
 * Execute a function with automatic API key fallback
 * Will retry with different API keys if the function fails
 */
export async function withAPIKeyFallback<T>(
    fn: (apiKey: string) => Promise<T>,
    maxRetries: number = API_KEYS.length
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const currentKey = getCurrentAPIKey();

        try {
            console.log(`Attempting API call with: ${currentKey.name}`);
            const result = await fn(currentKey.key);

            // Success - reset failed keys for future calls
            if (attempt > 0) {
                console.log(`Successfully recovered using fallback key: ${currentKey.name}`);
            }

            return result;
        } catch (error) {
            lastError = error as Error;
            console.error(`API call failed with ${currentKey.name}:`, error);

            // Try to switch to next key
            const hasMoreKeys = switchToNextKey();
            if (!hasMoreKeys) {
                console.error('No more API keys available to try');
                break;
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // All attempts failed
    throw new Error(`All API keys failed. Last error: ${lastError?.message || 'Unknown error'}`);
}
