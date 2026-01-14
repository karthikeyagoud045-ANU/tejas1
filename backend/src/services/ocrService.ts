// OCR Service - PDF and Image Text Extraction
// Uses Tesseract.js for image OCR and pdf-parse for PDF text

import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export interface OCRResult {
    text: string;
    confidence: number;
    pageCount: number;
    processingTime: number;
    fileType: 'pdf' | 'image';
}

/**
 * Extract text from a PDF file
 */
export async function extractTextFromPDF(filePath: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        return {
            text: data.text.trim(),
            confidence: 1.0, // PDF text extraction is deterministic
            pageCount: data.numpages,
            processingTime: Date.now() - startTime,
            fileType: 'pdf'
        };
    } catch (error) {
        throw new Error(`PDF extraction failed: ${(error as Error).message}`);
    }
}

/**
 * Extract text from an image using Tesseract OCR
 */
export async function extractTextFromImage(filePath: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
        const result = await Tesseract.recognize(filePath, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    // Progress logging (optional)
                    console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        return {
            text: result.data.text.trim(),
            confidence: result.data.confidence / 100,
            pageCount: 1,
            processingTime: Date.now() - startTime,
            fileType: 'image'
        };
    } catch (error) {
        throw new Error(`Image OCR failed: ${(error as Error).message}`);
    }
}

/**
 * Process any supported file (PDF or image)
 */
export async function processFile(filePath: string): Promise<OCRResult> {
    const ext = path.extname(filePath).toLowerCase();

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
    const pdfExtensions = ['.pdf'];

    if (pdfExtensions.includes(ext)) {
        return extractTextFromPDF(filePath);
    } else if (imageExtensions.includes(ext)) {
        return extractTextFromImage(filePath);
    } else {
        throw new Error(`Unsupported file type: ${ext}`);
    }
}

/**
 * Process file from buffer (for multer uploads)
 */
export async function processFileBuffer(
    buffer: Buffer,
    mimeType: string,
    originalName: string
): Promise<OCRResult> {
    // Create temp file
    const tempDir = '/tmp/healthwise-ocr';
    await fs.mkdir(tempDir, { recursive: true });

    const tempPath = path.join(tempDir, `${Date.now()}-${originalName}`);
    await fs.writeFile(tempPath, buffer);

    try {
        const result = await processFile(tempPath);
        return result;
    } finally {
        // Cleanup temp file
        try {
            await fs.unlink(tempPath);
        } catch {
            // Ignore cleanup errors
        }
    }
}

/**
 * Preprocess text for better LLM analysis
 */
export function preprocessMedicalText(text: string): string {
    // Remove excessive whitespace
    let processed = text.replace(/\s+/g, ' ');

    // Normalize common OCR errors in medical text
    processed = processed
        .replace(/\bl\b/g, '1')  // Common OCR error: l -> 1
        .replace(/\bO\b/g, '0')  // Common OCR error: O -> 0
        .trim();

    return processed;
}

export default {
    extractTextFromPDF,
    extractTextFromImage,
    processFile,
    processFileBuffer,
    preprocessMedicalText
};
