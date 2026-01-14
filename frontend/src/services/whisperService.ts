// Whisper Transcription Service
// Connects to local backend for Whisper AI transcription with retry logic

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
const TRANSCRIPTION_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second

export interface WhisperTranscriptionResult {
    text: string;
    language: string;
    processingTime: number;
    success: boolean;
    error?: string;
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch with timeout support
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Transcription request timed out. Please try again with a shorter audio clip.');
        }
        throw error;
    }
};

/**
 * Transcribe audio using local Whisper AI via backend with retry logic
 * @param audioBlob - Audio blob to transcribe
 * @param language - Language hint (e.g., 'en-US', 'hi-IN')
 * @param retryCount - Current retry attempt (internal use)
 */
export async function transcribeWithWhisper(
    audioBlob: Blob,
    language: string = 'en-US',
    retryCount: number = 0
): Promise<WhisperTranscriptionResult> {
    const startTime = Date.now();

    try {
        // Validate audio blob
        if (!audioBlob || audioBlob.size === 0) {
            throw new Error('Invalid audio data. Please try recording again.');
        }

        // Check file size (max 25MB)
        const maxSize = 25 * 1024 * 1024;
        if (audioBlob.size > maxSize) {
            throw new Error('Audio file too large. Please record a shorter clip.');
        }

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.webm');

        // Convert language code for Whisper (e.g., 'hi-IN' -> 'hi')
        const whisperLang = language.split('-')[0];
        formData.append('language', whisperLang);

        console.log(`Transcribing audio (${(audioBlob.size / 1024).toFixed(1)}KB, attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

        const response = await fetchWithTimeout(
            `${BACKEND_URL}/api/transcribe`,
            {
                method: 'POST',
                body: formData
            },
            TRANSCRIPTION_TIMEOUT
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || `Server error: ${response.status}`;

            // Retry on 5xx errors or network issues
            if (response.status >= 500 && retryCount < MAX_RETRIES) {
                const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount); // Exponential backoff
                console.warn(`Server error, retrying in ${delay}ms...`);
                await sleep(delay);
                return transcribeWithWhisper(audioBlob, language, retryCount + 1);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        if (!data.text || data.text.trim() === '') {
            throw new Error('No speech detected in audio. Please try speaking more clearly.');
        }

        console.log(`Transcription successful in ${processingTime}ms: "${data.text.substring(0, 50)}..."`);

        return {
            text: data.text.trim(),
            language: data.language || whisperLang,
            processingTime,
            success: true
        };
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('Whisper transcription error:', error);

        // Retry on network errors
        if (error instanceof TypeError && error.message.includes('fetch') && retryCount < MAX_RETRIES) {
            const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
            console.warn(`Network error, retrying in ${delay}ms...`);
            await sleep(delay);
            return transcribeWithWhisper(audioBlob, language, retryCount + 1);
        }

        // Provide helpful error messages
        let errorMessage = 'Transcription failed';
        if (error instanceof Error) {
            if (error.message.includes('timed out')) {
                errorMessage = 'Request timed out. Try a shorter recording.';
            } else if (error.message.includes('fetch')) {
                errorMessage = 'Cannot connect to backend. Is the server running?';
            } else {
                errorMessage = error.message;
            }
        }

        return {
            text: '',
            language: language.split('-')[0],
            processingTime,
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Transcribe audio from base64 data
 * @param audioBase64 - Base64 encoded audio data
 * @param mimeType - MIME type of the audio
 * @param language - Language hint
 */
export async function transcribeBase64WithWhisper(
    audioBase64: string,
    mimeType: string = 'audio/webm',
    language: string = 'en-US'
): Promise<WhisperTranscriptionResult> {
    try {
        const whisperLang = language.split('-')[0];

        const response = await fetch(`${BACKEND_URL}/api/transcribe/base64`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio: audioBase64,
                mimeType,
                language: whisperLang
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Transcription failed: ${response.status}`);
        }

        const data = await response.json();

        return {
            text: data.text || '',
            language: data.language || whisperLang,
            processingTime: data.processingTime || 0,
            success: true
        };
    } catch (error) {
        console.error('Whisper transcription error:', error);
        return {
            text: '',
            language: language.split('-')[0],
            processingTime: 0,
            success: false,
            error: error instanceof Error ? error.message : 'Transcription failed'
        };
    }
}

/**
 * Check if local Whisper backend is available
 */
export async function isWhisperAvailable(): Promise<boolean> {
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

export default {
    transcribeWithWhisper,
    transcribeBase64WithWhisper,
    isWhisperAvailable,
    BACKEND_URL
};
