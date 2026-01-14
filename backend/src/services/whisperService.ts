// Whisper AI Transcription Service
// Uses locally installed OpenAI Whisper for speech-to-text

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface WhisperResult {
    text: string;
    language: string;
    success: boolean;
    error?: string;
    processingTime: number;
}

// Language code mapping for Whisper
const LANGUAGE_MAP: Record<string, string> = {
    'en-US': 'en',
    'en': 'en',
    'hi-IN': 'hi',
    'hi': 'hi',
    'te-IN': 'te',
    'te': 'te',
    'es-ES': 'es',
    'es': 'es',
    'fr-FR': 'fr',
    'fr': 'fr',
    'de-DE': 'de',
    'de': 'de',
    'zh-CN': 'zh',
    'zh': 'zh',
    'ja-JP': 'ja',
    'ja': 'ja'
};

/**
 * Transcribe audio using local Whisper AI
 * @param audioPath - Path to the audio file
 * @param language - Optional language hint (e.g., 'en', 'hi')
 */
export async function transcribeAudio(
    audioPath: string,
    language?: string
): Promise<WhisperResult> {
    const startTime = Date.now();

    try {
        // Check if the audio file exists
        if (!fs.existsSync(audioPath)) {
            throw new Error(`Audio file not found: ${audioPath}`);
        }

        // Build Whisper command
        const whisperLang = language ? LANGUAGE_MAP[language] || language : undefined;
        const outputDir = os.tmpdir();

        // Use whisper CLI - outputs to text file
        let command = `whisper "${audioPath}" --model base --output_dir "${outputDir}" --output_format txt`;

        if (whisperLang) {
            command += ` --language ${whisperLang}`;
        }

        console.log(`Running Whisper: ${command}`);

        const { stdout, stderr } = await execAsync(command, {
            timeout: 120000 // 2 minute timeout
        });

        if (stderr && !stderr.includes('100%')) {
            console.warn('Whisper stderr:', stderr);
        }

        // Read the output text file
        const baseName = path.basename(audioPath, path.extname(audioPath));
        const outputPath = path.join(outputDir, `${baseName}.txt`);

        let transcribedText = '';
        if (fs.existsSync(outputPath)) {
            transcribedText = fs.readFileSync(outputPath, 'utf-8').trim();
            // Clean up the output file
            fs.unlinkSync(outputPath);
        } else {
            // Try to extract text from stdout as fallback
            const match = stdout.match(/\[\d+:\d+\.\d+ --> \d+:\d+\.\d+\]\s+(.+)/);
            if (match) {
                transcribedText = match[1].trim();
            }
        }

        const processingTime = Date.now() - startTime;

        // Detect language from Whisper output if not specified
        const detectedLang = whisperLang || 'en';

        return {
            text: transcribedText,
            language: detectedLang,
            success: true,
            processingTime
        };

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('Whisper transcription error:', error);

        return {
            text: '',
            language: language || 'unknown',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime
        };
    }
}

/**
 * Transcribe audio from buffer (converts to temp file first)
 * @param audioBuffer - Audio data buffer
 * @param mimeType - MIME type of the audio
 * @param language - Optional language hint
 */
export async function transcribeAudioBuffer(
    audioBuffer: Buffer,
    mimeType: string = 'audio/webm',
    language?: string
): Promise<WhisperResult> {
    // Determine file extension from MIME type
    const extensionMap: Record<string, string> = {
        'audio/webm': '.webm',
        'audio/wav': '.wav',
        'audio/mp3': '.mp3',
        'audio/mpeg': '.mp3',
        'audio/ogg': '.ogg',
        'audio/flac': '.flac',
        'audio/m4a': '.m4a'
    };

    const extension = extensionMap[mimeType] || '.webm';
    const tempPath = path.join(os.tmpdir(), `whisper_input_${Date.now()}${extension}`);

    try {
        // Write buffer to temp file
        fs.writeFileSync(tempPath, audioBuffer);

        // Transcribe
        const result = await transcribeAudio(tempPath, language);

        // Clean up temp file
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }

        return result;
    } catch (error) {
        // Clean up on error
        if (fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
        throw error;
    }
}

export default {
    transcribeAudio,
    transcribeAudioBuffer,
    LANGUAGE_MAP
};
