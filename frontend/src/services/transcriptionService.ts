// Audio Transcription Service using Groq Whisper API
// This service uses Groq's Whisper API for audio transcription

import { getKeysByProvider } from '../config/apiKeys';

export interface TranscriptionResult {
    text: string;
    success: boolean;
    error?: string;
}

/**
 * Transcribe audio using Groq Whisper API with automatic key fallback
 * @param audioBase64 - Base64 encoded audio data
 * @param mimeType - MIME type of the audio (e.g., 'audio/webm')
 * @param language - Language hint for transcription (e.g., 'en', 'hi')
 */
export const transcribeAudio = async (
    audioBase64: string,
    mimeType: string = 'audio/webm',
    language: string = 'en'
): Promise<TranscriptionResult> => {
    // Get all Groq keys for fallback (Groq Whisper for transcription)
    const groqKeys = getKeysByProvider('groq');

    if (groqKeys.length === 0) {
        return {
            text: '',
            success: false,
            error: 'No Groq API keys configured for transcription'
        };
    }

    let lastError: string = '';

    // Try each Groq key until one works
    for (const keyConfig of groqKeys) {
        try {
            console.log(`Attempting transcription with: ${keyConfig.name}`);

            // Convert base64 to blob for Whisper API
            const binaryString = atob(audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const audioBlob = new Blob([bytes], { type: mimeType });

            // Create form data for Whisper API
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3');
            formData.append('language', language === 'English' ? 'en' : language === 'Hindi' ? 'hi' : language);

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${keyConfig.key}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            const text = data.text;

            if (text) {
                console.log(`Successfully transcribed with: ${keyConfig.name}`);
                return {
                    text: text.trim(),
                    success: true
                };
            } else {
                throw new Error('No transcription text in response');
            }
        } catch (error) {
            lastError = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Transcription failed with ${keyConfig.name}:`, error);
            // Continue to next key
        }
    }

    // All keys failed
    return {
        text: '',
        success: false,
        error: `All transcription attempts failed. Last error: ${lastError}`
    };
};

/**
 * Direct transcription with a provided audio blob
 */
export const transcribeAudioBlob = async (
    audioBlob: Blob,
    language: string = 'en'
): Promise<TranscriptionResult> => {
    const groqKeys = getKeysByProvider('groq');

    if (groqKeys.length === 0) {
        return {
            text: '',
            success: false,
            error: 'No Groq API keys configured for transcription'
        };
    }

    let lastError: string = '';

    for (const keyConfig of groqKeys) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3');
            formData.append('language', language);

            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${keyConfig.key}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API error ${response.status}: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();

            if (data.text) {
                return {
                    text: data.text.trim(),
                    success: true
                };
            }

            throw new Error('No transcription text in response');
        } catch (error) {
            lastError = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Transcription failed with ${keyConfig.name}:`, error);
        }
    }

    return {
        text: '',
        success: false,
        error: `All transcription attempts failed. Last error: ${lastError}`
    };
};
