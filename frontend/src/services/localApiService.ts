// Local Backend API Service
// Connects frontend to local Express backend with Ollama

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export interface LocalChatResponse {
    reply: string;
    model: string;
    source: 'local' | 'cloud';
    processingTime: number;
    usedFallback: boolean;
}

export interface ServiceStatus {
    ollama: {
        running: boolean;
        model: string | null;
        availableModels: string[];
    };
    fallback: {
        available: boolean;
        providers: string[];
    };
    ready: boolean;
}

/**
 * Check if the local backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get service status (Ollama + fallback availability)
 */
export async function getServiceStatus(): Promise<ServiceStatus | null> {
    try {
        const response = await fetch(`${BACKEND_URL}/api/status`);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * Send a chat message to the local backend
 * @param message - The message to send
 * @param sessionId - Session identifier for conversation history
 * @param useCloud - Whether to force cloud API usage
 * @param language - Language code for response (e.g., 'hi-IN' for Hindi mode)
 */
export async function sendMessage(
    message: string,
    sessionId: string = 'default',
    useCloud: boolean = false,
    language: string = 'en-US'
): Promise<LocalChatResponse> {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message,
            sessionId,
            useCloud,
            language
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Chat request failed');
    }

    return await response.json();
}

/**
 * Upload and analyze a file
 */
export async function uploadAndAnalyze(
    file: File,
    analysisType: 'extract' | 'summarize' | 'interpret' = 'extract'
): Promise<{
    success: boolean;
    ocr: {
        text: string;
        confidence: number;
        pageCount: number;
        processingTime: number;
        fileType: string;
    };
    analysis: {
        result: string;
        model: string;
        source: string;
        processingTime: number;
    };
    totalProcessingTime: number;
}> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('analysisType', analysisType);

    const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
    }

    return await response.json();
}

/**
 * Analyze text with AI
 */
export async function analyzeText(
    text: string,
    analysisType: 'extract' | 'summarize' | 'interpret' = 'extract'
): Promise<{
    analysis: string;
    model: string;
    source: string;
    processingTime: number;
}> {
    const response = await fetch(`${BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            text,
            analysisType
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
    }

    return await response.json();
}

/**
 * Clear chat history
 */
export async function clearHistory(sessionId: string = 'default'): Promise<void> {
    await fetch(`${BACKEND_URL}/api/chat/history`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionId })
    });
}

export default {
    checkBackendHealth,
    getServiceStatus,
    sendMessage,
    uploadAndAnalyze,
    analyzeText,
    clearHistory,
    BACKEND_URL
};
