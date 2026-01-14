// HealthWise.AI Backend Server
// Express server with Ollama integration for local AI processing

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import transcriptionRoutes from './routes/transcriptionRoutes.js';
import { getOllamaStatus } from './services/ollamaService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Allow any Netlify app
        if (origin.endsWith('.netlify.app')) return callback(null, true);

        // Check allowed origins
        if (allowedOrigins.includes(origin)) return callback(null, true);

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
    const ollamaStatus = await getOllamaStatus();

    res.json({
        status: 'ok',
        message: 'HealthWise.AI Backend is running',
        timestamp: new Date().toISOString(),
        services: {
            ollama: ollamaStatus.running ? 'connected' : 'disconnected',
            model: ollamaStatus.model
        }
    });
});

// API Routes
app.use('/api', chatRoutes);
app.use('/api', uploadRoutes);
app.use('/api', doctorRoutes);
app.use('/api', transcriptionRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, async () => {
    console.log('\n🚀 HealthWise.AI Backend Server');
    console.log('================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);

    // Check Ollama status on startup
    const ollamaStatus = await getOllamaStatus();
    if (ollamaStatus.running) {
        console.log(`🤖 Ollama connected: ${ollamaStatus.model}`);
        console.log(`   Available models: ${ollamaStatus.models.join(', ')}`);
    } else {
        console.log('⚠️  Ollama not running - will use cloud fallback');
    }

    console.log('\n📋 Available endpoints:');
    console.log('   POST /api/chat              - AI chat');
    console.log('   POST /api/analyze           - Analyze medical text');
    console.log('   POST /api/upload            - Upload & analyze file');
    console.log('   POST /api/transcribe        - Whisper audio transcription');
    console.log('   POST /api/doctors/search    - Search doctors');
    console.log('   POST /api/doctors/natural-search - Natural language search');
    console.log('   GET  /api/status            - Service status');
    console.log('   GET  /api/health            - Health check');
    console.log('================================\n');
});

export default app;

