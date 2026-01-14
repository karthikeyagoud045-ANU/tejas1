// Chat Routes - API endpoints for AI chat functionality
// Handles local Ollama chat with cloud fallback

import { Router, Request, Response } from 'express';
import ollamaService, { ChatMessage, getOllamaStatus } from '../services/ollamaService.js';
import fallbackService from '../services/fallbackService.js';

const router = Router();

// Store conversation history per session (in-memory for now)
const conversationHistory = new Map<string, ChatMessage[]>();

/**
 * POST /api/chat
 * Send a message to the AI and get a response
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, sessionId = 'default', useCloud = false, language = 'en-US' } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation history
        let history = conversationHistory.get(sessionId) || [];

        // Add user message to history
        const userMessage: ChatMessage = { role: 'user', content: message };
        history.push(userMessage);

        let response;
        let usedFallback = false;

        // Language-specific system prompts for strict enforcement
        const languageSystemPrompts: Record<string, string> = {
            'hi-IN': `आप HealthWise AI हैं, एक सहायक स्वास्थ्य सहायक। 

महत्वपूर्ण नियम:
1. आपको केवल और केवल हिंदी में जवाब देना है।
2. कोई भी अंग्रेजी शब्द, वाक्य या मिश्रित भाषा का उपयोग न करें।
3. यदि उपयोगकर्ता अंग्रेजी या अन्य भाषा में बोले, तो भी आप केवल हिंदी में जवाब दें।
4. चिकित्सा शब्दावली को भी हिंदी में समझाएं।
5. संक्षिप्त और स्पष्ट उत्तर दें।
6. गंभीर लक्षणों के लिए डॉक्टर से मिलने की सलाह दें।

याद रखें: आप एक AI हैं, डॉक्टर नहीं। हमेशा हिंदी में जवाब दें।`,

            'te-IN': `మీరు HealthWise AI, ఒక ఆరోగ్య సహాయకుడు.

ముఖ్యమైన నియమాలు:
1. మీరు కేవలం తెలుగులో మాత్రమే సమాధానం ఇవ్వాలి.
2. ఆంగ్లం లేదా ఇతర భాషలు కలపకూడదు.
3. వినియోగదారు ఏ భాషలో మాట్లాడినా, మీరు తెలుగులోనే సమాధానం ఇవ్వండి.
4. సంక్షిప్తంగా మరియు స్పష్టంగా సమాధానం ఇవ్వండి.

గుర్తుంచుకోండి: మీరు AI, వైద్యుడు కాదు.`,

            'en-US': `You are HealthWise AI, a helpful health and wellness assistant.

Important rules:
1. Provide accurate, empathetic health information.
2. Give brief, concise, and direct answers.
3. Use short bullet points if necessary.
4. Always clarify you are an AI, not a doctor.
5. For severe symptoms, advise seeing a doctor immediately.
6. Respond in English only.`,

            'es-ES': `Eres HealthWise AI, un asistente de salud útil.

Reglas importantes:
1. Debes responder únicamente en español.
2. No mezcles inglés u otros idiomas.
3. Proporciona respuestas breves y claras.
4. Recuerda: eres una IA, no un médico.`,

            'fr-FR': `Vous êtes HealthWise AI, un assistant santé utile.

Règles importantes:
1. Vous devez répondre uniquement en français.
2. Ne mélangez pas l'anglais ou d'autres langues.
3. Fournissez des réponses brèves et claires.
4. Rappelez-vous: vous êtes une IA, pas un médecin.`,

            'de-DE': `Sie sind HealthWise AI, ein hilfreicher Gesundheitsassistent.

Wichtige Regeln:
1. Sie müssen ausschließlich auf Deutsch antworten.
2. Mischen Sie kein Englisch oder andere Sprachen.
3. Geben Sie kurze und klare Antworten.
4. Denken Sie daran: Sie sind eine KI, kein Arzt.`,

            'zh-CN': `你是HealthWise AI，一个健康助手。

重要规则：
1. 你必须只用中文回答。
2. 不要混用英语或其他语言。
3. 提供简短清晰的回答。
4. 记住：你是AI，不是医生。`,

            'ja-JP': `あなたはHealthWise AIです。健康アシスタントです。

重要なルール：
1. 日本語のみで回答してください。
2. 英語や他の言語を混ぜないでください。
3. 簡潔で明確な回答を提供してください。
4. 覚えておいてください：あなたはAIであり、医師ではありません。`
        };

        // Get the appropriate system prompt based on language
        const systemPrompt = languageSystemPrompts[language] || languageSystemPrompts['en-US'];

        // Try local Ollama first (unless explicitly requesting cloud)
        if (!useCloud) {
            try {
                const status = await getOllamaStatus();

                if (status.running && status.model) {
                    console.log(`Using local Ollama model: ${status.model}, language: ${language}`);
                    response = await ollamaService.healthChat(message, history.slice(0, -1), systemPrompt);
                } else {
                    throw new Error('Ollama not available');
                }
            } catch (ollamaError) {
                console.log('Ollama failed, trying fallback...', (ollamaError as Error).message);
                usedFallback = true;
            }
        }

        // Use fallback if Ollama failed or cloud was requested
        if (!response) {
            try {
                response = await fallbackService.fallbackChat([
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    ...history
                ]);
                usedFallback = true;
            } catch (fallbackError) {
                console.error('All providers failed:', fallbackError);
                return res.status(503).json({
                    error: 'AI service unavailable',
                    details: 'Both local and cloud AI services are unavailable'
                });
            }
        }

        // Add assistant response to history
        const assistantMessage: ChatMessage = { role: 'assistant', content: response.message };
        history.push(assistantMessage);

        // Keep only last 20 messages to prevent memory issues
        if (history.length > 20) {
            history = history.slice(-20);
        }
        conversationHistory.set(sessionId, history);

        res.json({
            reply: response.message,
            model: response.model,
            source: response.source,
            processingTime: response.processingTime,
            usedFallback
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/analyze
 * Analyze medical document text
 */
router.post('/analyze', async (req: Request, res: Response) => {
    try {
        const { text, analysisType = 'extract' } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text content is required' });
        }

        const validTypes = ['extract', 'summarize', 'interpret'];
        if (!validTypes.includes(analysisType)) {
            return res.status(400).json({
                error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        let response;

        try {
            const status = await getOllamaStatus();

            if (status.running && status.model) {
                response = await ollamaService.analyzeMedicalDocument(text, analysisType);
            } else {
                throw new Error('Ollama not available');
            }
        } catch {
            // Fallback to cloud
            response = await fallbackService.fallbackChat([
                {
                    role: 'system',
                    content: analysisType === 'extract'
                        ? 'Extract all lab test results from the medical report as JSON with fields: test_name, value, unit, reference_range, status.'
                        : analysisType === 'summarize'
                            ? 'Summarize the key findings of this medical report in plain language.'
                            : 'Interpret and explain the findings in this medical report.'
                },
                { role: 'user', content: text }
            ]);
        }

        res.json({
            analysis: response.message,
            model: response.model,
            source: response.source,
            processingTime: response.processingTime
        });

    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Analysis failed' });
    }
});

/**
 * GET /api/status
 * Check AI service status
 */
router.get('/status', async (_req: Request, res: Response) => {
    try {
        const ollamaStatus = await getOllamaStatus();
        const fallbackAvailable = fallbackService.isFallbackAvailable();

        res.json({
            ollama: {
                running: ollamaStatus.running,
                model: ollamaStatus.model,
                availableModels: ollamaStatus.models
            },
            fallback: {
                available: fallbackAvailable,
                providers: ['gemini', 'openrouter']
            },
            ready: ollamaStatus.running || fallbackAvailable
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({ error: 'Status check failed' });
    }
});

/**
 * DELETE /api/chat/history
 * Clear conversation history for a session
 */
router.delete('/chat/history', (req: Request, res: Response) => {
    const { sessionId = 'default' } = req.body;
    conversationHistory.delete(sessionId);
    res.json({ success: true, message: 'Conversation history cleared' });
});

export default router;
