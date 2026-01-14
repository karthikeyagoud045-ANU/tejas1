// Ollama Service - Local LLM Integration
// Connects to Ollama running on localhost:11434

import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

// Default model to use
const DEFAULT_MODEL = 'gemma3:4b';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    message: string;
    model: string;
    source: 'local' | 'cloud';
    processingTime: number;
}

export interface OllamaStatus {
    running: boolean;
    model: string | null;
    models: string[];
}

/**
 * Check if Ollama is running and get available models
 */
export async function getOllamaStatus(): Promise<OllamaStatus> {
    try {
        const response = await ollama.list();
        const models = response.models.map(m => m.name);
        const hasDefaultModel = models.some(m => m.includes('gemma3'));

        return {
            running: true,
            model: hasDefaultModel ? DEFAULT_MODEL : models[0] || null,
            models
        };
    } catch (error) {
        return {
            running: false,
            model: null,
            models: []
        };
    }
}

/**
 * Send a chat message to the local Ollama model
 */
export async function chat(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
        const response = await ollama.chat({
            model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            }))
        });

        return {
            message: response.message.content,
            model,
            source: 'local',
            processingTime: Date.now() - startTime
        };
    } catch (error) {
        throw new Error(`Ollama chat failed: ${(error as Error).message}`);
    }
}

/**
 * Send a chat message with streaming response
 */
export async function* chatStream(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
): AsyncGenerator<string, void, unknown> {
    try {
        const response = await ollama.chat({
            model,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            stream: true
        });

        for await (const chunk of response) {
            yield chunk.message.content;
        }
    } catch (error) {
        throw new Error(`Ollama stream failed: ${(error as Error).message}`);
    }
}

/**
 * Analyze medical document text using structured prompts
 */
export async function analyzeMedicalDocument(
    documentText: string,
    analysisType: 'extract' | 'summarize' | 'interpret' = 'extract'
): Promise<ChatResponse> {
    const systemPrompts: Record<string, string> = {
        extract: `You are a medical data extraction assistant. Extract all lab test results, vital signs, and measurements from the provided medical report. Output as structured JSON with fields: test_name, value, unit, reference_range (if available), status (normal/abnormal if determinable). Only include values explicitly mentioned in the text.`,

        summarize: `You are a medical report summarizer. Provide a clear, concise summary of the key findings in the medical report. Focus on: main diagnoses, significant lab results, recommended actions, and any concerning findings. Use plain language suitable for a patient.`,

        interpret: `You are a medical information assistant. Help interpret the medical report findings. Explain what the tests measure, what the results mean, and provide general health context. Always recommend consulting with a healthcare provider for medical advice.`
    };

    const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompts[analysisType] },
        { role: 'user', content: `Please analyze this medical report:\n\n${documentText}` }
    ];

    return chat(messages);
}

/**
 * Health-focused chat with context
 * @param userMessage - The user's message
 * @param conversationHistory - Previous conversation messages
 * @param customSystemPrompt - Optional custom system prompt (for language enforcement)
 */
export async function healthChat(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    customSystemPrompt?: string
): Promise<ChatResponse> {
    const defaultSystemPrompt = `You are HealthWise AI, a helpful health and wellness assistant. You provide accurate, empathetic health information while always recommending users consult healthcare professionals for medical advice. You can help with:
- Understanding medical reports and lab results
- General health and wellness questions
- Exercise and nutrition guidance
- Medication reminders and information
- Mental health support and resources

Be warm, supportive, and informative. If asked about serious symptoms, always recommend seeking professional medical care.`;

    const systemMessage: ChatMessage = {
        role: 'system',
        content: customSystemPrompt || defaultSystemPrompt
    };

    const messages: ChatMessage[] = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', content: userMessage }
    ];

    return chat(messages);
}

export default {
    getOllamaStatus,
    chat,
    chatStream,
    analyzeMedicalDocument,
    healthChat
};
