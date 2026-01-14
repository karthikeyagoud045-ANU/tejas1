// Unified AI Service for Multiple Providers
// Supports: Gemini, OpenRouter, Groq

import { GoogleGenAI } from "@google/genai";
import { getCurrentAPIKey, switchToNextKey, APIKeyConfig } from '../config/apiKeys';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface StreamChunk {
    text: string;
}

/**
 * Unified AI Service that works with multiple providers
 */
export class UnifiedAIService {
    private currentProvider: APIKeyConfig;

    constructor() {
        this.currentProvider = getCurrentAPIKey();
    }

    /**
     * Send a chat message and get streaming response
     */
    async *sendMessageStream(messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
        const provider = this.currentProvider.provider;

        try {
            if (provider === 'gemini') {
                yield* this.sendGeminiStream(messages);
            } else if (provider === 'openrouter') {
                yield* this.sendOpenRouterStream(messages);
            } else if (provider === 'groq') {
                yield* this.sendGroqStream(messages);
            }
        } catch (error) {
            console.error(`Error with ${provider}:`, error);
            throw error;
        }
    }

    /**
     * Gemini API streaming
     */
    private async *sendGeminiStream(messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
        const ai = new GoogleGenAI({ apiKey: this.currentProvider.key });

        // Convert messages to Gemini format
        const lastMessage = messages[messages.length - 1];
        const systemInstruction = messages.find(m => m.role === 'system')?.content;

        const chat = ai.chats.create({
            model: 'gemini-2.0-flash-exp',
            config: systemInstruction ? { systemInstruction } : undefined
        });

        const result = await chat.sendMessageStream({ message: lastMessage.content });

        for await (const chunk of result) {
            if (chunk.text) {
                yield { text: chunk.text };
            }
        }
    }

    /**
     * OpenRouter API streaming
     */
    private async *sendOpenRouterStream(messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.currentProvider.key}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'HealthWise AI'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-exp:free', // Using free Gemini model via OpenRouter
                messages: messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
                    content: m.content
                })),
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            yield { text: content };
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }

    /**
     * Groq API streaming
     */
    private async *sendGroqStream(messages: ChatMessage[]): AsyncGenerator<StreamChunk> {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.currentProvider.key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile', // Groq's fast model
                messages: messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
                    content: m.content
                })),
                stream: true,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            yield { text: content };
                        }
                    } catch (e) {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }

    /**
     * Switch to next available provider
     */
    switchProvider(): boolean {
        const hasNext = switchToNextKey();
        if (hasNext) {
            this.currentProvider = getCurrentAPIKey();
            console.log(`Switched to provider: ${this.currentProvider.name}`);
        }
        return hasNext;
    }

    /**
     * Get current provider info
     */
    getCurrentProvider(): APIKeyConfig {
        return this.currentProvider;
    }
}

/**
 * Send message with automatic provider fallback
 */
export async function* sendMessageWithFallback(
    messages: ChatMessage[]
): AsyncGenerator<StreamChunk> {
    const service = new UnifiedAIService();
    let attempts = 0;
    const maxAttempts = 5; // Try all providers

    while (attempts < maxAttempts) {
        try {
            console.log(`Attempting with provider: ${service.getCurrentProvider().name}`);
            yield* service.sendMessageStream(messages);
            return; // Success
        } catch (error) {
            console.error(`Provider ${service.getCurrentProvider().name} failed:`, error);
            attempts++;

            if (!service.switchProvider()) {
                throw new Error('All API providers failed');
            }

            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    throw new Error('Maximum retry attempts reached');
}
