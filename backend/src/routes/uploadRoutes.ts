// Upload Routes - File upload and OCR processing
// Handles PDF and image uploads for medical document analysis

import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import ocrService from '../services/ocrService.js';
import ollamaService, { getOllamaStatus } from '../services/ollamaService.js';
import fallbackService from '../services/fallbackService.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/tiff'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * POST /api/upload
 * Upload a file for OCR and analysis
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { analysisType = 'extract' } = req.body;

        console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);

        // Step 1: Extract text using OCR
        const ocrResult = await ocrService.processFileBuffer(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );

        console.log(`OCR complete: ${ocrResult.text.length} characters, confidence: ${ocrResult.confidence}`);

        if (!ocrResult.text || ocrResult.text.trim().length === 0) {
            return res.status(422).json({
                error: 'No text could be extracted from the file',
                details: 'The file may be empty, corrupted, or contain only images without text'
            });
        }

        // Step 2: Preprocess the text
        const processedText = ocrService.preprocessMedicalText(ocrResult.text);

        // Step 3: Analyze with AI
        let analysisResponse;

        try {
            const status = await getOllamaStatus();

            if (status.running && status.model) {
                analysisResponse = await ollamaService.analyzeMedicalDocument(
                    processedText,
                    analysisType as 'extract' | 'summarize' | 'interpret'
                );
            } else {
                throw new Error('Ollama not available');
            }
        } catch {
            // Fallback to cloud
            console.log('Using cloud fallback for analysis...');
            analysisResponse = await fallbackService.fallbackChat([
                {
                    role: 'system',
                    content: analysisType === 'extract'
                        ? 'Extract all medical data from this report as structured JSON.'
                        : analysisType === 'summarize'
                            ? 'Provide a clear summary of this medical report.'
                            : 'Explain the findings in this medical report in simple terms.'
                },
                { role: 'user', content: processedText }
            ]);
        }

        res.json({
            success: true,
            ocr: {
                text: processedText,
                confidence: ocrResult.confidence,
                pageCount: ocrResult.pageCount,
                processingTime: ocrResult.processingTime,
                fileType: ocrResult.fileType
            },
            analysis: {
                result: analysisResponse.message,
                model: analysisResponse.model,
                source: analysisResponse.source,
                processingTime: analysisResponse.processingTime
            },
            totalProcessingTime: ocrResult.processingTime + analysisResponse.processingTime
        });

    } catch (error) {
        console.error('Upload processing error:', error);

        if ((error as Error).message.includes('Unsupported file type')) {
            return res.status(400).json({ error: (error as Error).message });
        }

        res.status(500).json({
            error: 'File processing failed',
            details: (error as Error).message
        });
    }
});

/**
 * POST /api/upload/ocr-only
 * Extract text only, without AI analysis
 */
router.post('/upload/ocr-only', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const ocrResult = await ocrService.processFileBuffer(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );

        const processedText = ocrService.preprocessMedicalText(ocrResult.text);

        res.json({
            success: true,
            text: processedText,
            rawText: ocrResult.text,
            confidence: ocrResult.confidence,
            pageCount: ocrResult.pageCount,
            processingTime: ocrResult.processingTime,
            fileType: ocrResult.fileType
        });

    } catch (error) {
        console.error('OCR error:', error);
        res.status(500).json({
            error: 'OCR processing failed',
            details: (error as Error).message
        });
    }
});

export default router;
