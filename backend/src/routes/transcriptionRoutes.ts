// Transcription Routes - API endpoints for Whisper transcription
// Handles audio file uploads and returns transcribed text

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';
import whisperService from '../services/whisperService.js';

const router = Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname) || '.webm'}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB max
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = [
            'audio/webm',
            'audio/wav',
            'audio/mp3',
            'audio/mpeg',
            'audio/ogg',
            'audio/flac',
            'audio/m4a',
            'audio/x-m4a',
            'video/webm' // Some browsers send webm as video
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Unsupported audio format: ${file.mimetype}`));
        }
    }
});

/**
 * POST /api/transcribe
 * Transcribe audio file using local Whisper AI
 */
router.post('/transcribe', upload.single('audio'), async (req: Request, res: Response) => {
    const uploadedFile = req.file;

    try {
        if (!uploadedFile) {
            return res.status(400).json({
                error: 'No audio file provided',
                success: false
            });
        }

        const language = req.body.language || undefined;

        console.log(`Transcribing audio: ${uploadedFile.filename}, language hint: ${language || 'auto'}`);

        // Transcribe using local Whisper
        const result = await whisperService.transcribeAudio(uploadedFile.path, language);

        // Clean up the uploaded file
        if (fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }

        if (result.success) {
            res.json({
                text: result.text,
                language: result.language,
                processingTime: result.processingTime,
                success: true
            });
        } else {
            res.status(500).json({
                error: result.error || 'Transcription failed',
                success: false,
                processingTime: result.processingTime
            });
        }

    } catch (error) {
        console.error('Transcription route error:', error);

        // Clean up on error
        if (uploadedFile && fs.existsSync(uploadedFile.path)) {
            fs.unlinkSync(uploadedFile.path);
        }

        // Handle multer errors specifically
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    error: 'Audio file too large. Maximum size is 25MB.',
                    success: false
                });
            }
        }

        res.status(500).json({
            error: error instanceof Error ? error.message : 'Transcription failed',
            success: false
        });
    }
});

/**
 * POST /api/transcribe/base64
 * Transcribe audio from base64 encoded data
 */
router.post('/transcribe/base64', async (req: Request, res: Response) => {
    try {
        const { audio, mimeType = 'audio/webm', language } = req.body;

        if (!audio) {
            return res.status(400).json({
                error: 'No audio data provided',
                success: false
            });
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audio, 'base64');

        console.log(`Transcribing base64 audio, size: ${audioBuffer.length} bytes, language hint: ${language || 'auto'}`);

        // Transcribe using Whisper
        const result = await whisperService.transcribeAudioBuffer(audioBuffer, mimeType, language);

        if (result.success) {
            res.json({
                text: result.text,
                language: result.language,
                processingTime: result.processingTime,
                success: true
            });
        } else {
            res.status(500).json({
                error: result.error || 'Transcription failed',
                success: false,
                processingTime: result.processingTime
            });
        }

    } catch (error) {
        console.error('Base64 transcription error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Transcription failed',
            success: false
        });
    }
});

export default router;
