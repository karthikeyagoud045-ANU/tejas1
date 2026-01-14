// Fallback Service - Cloud API Fallback when Ollama fails
// Supports Gemini and OpenRouter as fallback providers

import { ChatMessage, ChatResponse } from './ollamaService.js';

// API Keys (should be in environment variables in production)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDic1ZCl-4F0fYr17LZQblGdqZWMalnncs';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';

export type FallbackProvider = 'gemini' | 'openrouter';

interface FallbackConfig {
    enabled: boolean;
    providers: FallbackProvider[];
    timeout: number;
}

const defaultConfig: FallbackConfig = {
    enabled: true,
    providers: ['gemini', 'openrouter'],
    timeout: 30000
};

/**
 * Call Gemini API as fallback
 */
async function callGemini(messages: ChatMessage[]): Promise<ChatResponse> {
    const startTime = Date.now();

    // Convert messages to Gemini format
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

    // Add system instruction if present
    const systemMessage = messages.find(m => m.role === 'system');

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.7
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
        message: text,
        model: 'gemini-2.0-flash-exp',
        source: 'cloud',
        processingTime: Date.now() - startTime
    };
}

/**
 * Call OpenRouter API as fallback
 */
async function callOpenRouter(messages: ChatMessage[]): Promise<ChatResponse> {
    const startTime = Date.now();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://healthwise.ai',
            'X-Title': 'HealthWise AI'
        },
        body: JSON.stringify({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            max_tokens: 2048
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenRouter API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    return {
        message: text,
        model: 'openrouter/gemini-2.0-flash',
        source: 'cloud',
        processingTime: Date.now() - startTime
    };
}

/**
 * Try fallback providers in order
 */
export async function fallbackChat(
    messages: ChatMessage[],
    config: Partial<FallbackConfig> = {}
): Promise<ChatResponse> {
    const { enabled, providers, timeout } = { ...defaultConfig, ...config };

    if (!enabled) {
        throw new Error('Fallback is disabled');
    }

    const errors: string[] = [];

    for (const provider of providers) {
        try {
            console.log(`Trying fallback provider: ${provider}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            let result: ChatResponse;

            if (provider === 'gemini') {
                result = await callGemini(messages);
            } else if (provider === 'openrouter') {
                result = await callOpenRouter(messages);
            } else {
                continue;
            }

            clearTimeout(timeoutId);
            console.log(`Fallback successful with: ${provider}`);
            return result;

        } catch (error) {
            const errorMsg = (error as Error).message;
            errors.push(`${provider}: ${errorMsg}`);
            console.error(`Fallback failed for ${provider}:`, errorMsg);
        }
    }

    throw new Error(`All fallback providers failed: ${errors.join('; ')}`);
}

/**
 * Check if fallback is available
 */
export function isFallbackAvailable(): boolean {
    return !!(GEMINI_API_KEY || OPENROUTER_API_KEY);
}

export default {
    fallbackChat,
    isFallbackAvailable
};
