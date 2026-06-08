# 🏥 HealthWise.AI — Full Stack

<div align="center">

AI-powered **health companion** with medical report analysis, exercise routines, nutrition tracking, medication management, and community features — built as a full-stack application.

![React](https://img.shields.io/badge/React-19-61DAFB)
![Express](https://img.shields.io/badge/Express-Backend-000000)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-FF6B35)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green)
![API Fallback](https://img.shields.io/badge/API-Multi--key%20Fallback-blue)

</div>

---

## ✨ Features

### 🩺 Medical Report Analysis
- Upload medical reports (PDF, images, text)
- OCR via Tesseract.js for image-based reports
- AI analysis with local Ollama LLM
- Multi-provider API key fallback (Gemini, OpenRouter, Groq)

### 🏃 Exercise & Wellness
- Interactive exercise player with video
- Custom workout planner
- Daily exercise tracking with streaks

### 🥗 Nutrition Tracking
- Meal logging and analysis
- AI-powered meal insights
- Weekly nutrition dashboard

### 💊 Health Management
- Medication tracker with reminders
- Doctor finder
- Health analytics and trends

### 👥 Community
- Community forum
- Social features

### 🔐 Authentication
- Supabase authentication
- User profiles and data persistence
- Weekly data persistence in localStorage

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | UI framework |
| **TypeScript** | Type safety |
| **Supabase Client** | Auth + database |
| **Google GenAI** | AI features (Gemini) |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|---|---|
| **Express.js** | REST API server |
| **Ollama** | Local LLM inference |
| **Tesseract.js** | OCR for medical images |
| **Multer** | File upload handling |
| **Supabase** | Database + auth |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Ollama installed locally (for local AI)
- Supabase project
- API keys: Gemini, OpenRouter, and/or Groq

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GEMINI_API_KEY=your-key
VITE_OPENROUTER_KEY_1=your-key
VITE_OPENROUTER_KEY_2=your-key
VITE_GROQ_KEY_1=your-key
VITE_GROQ_KEY_2=your-key
```

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
```

Backend runs at `http://localhost:5001`

---

## 📁 Project Structure

```
tejas1/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Hero.tsx
│   │   │   ├── UploadSection.tsx
│   │   │   ├── ExercisePlayer.tsx
│   │   │   ├── NutritionSection.tsx
│   │   │   ├── AnalyticsSection.tsx
│   │   │   ├── ChatBot.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── MedicationTracker.tsx
│   │   │   ├── CommunityForum.tsx
│   │   │   ├── DoctorFinder.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── CustomWorkoutPlanner.tsx
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── services/       # API services
│   │   ├── config/         # API key fallback config
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/             # Static assets + service worker
│   └── package.json
│
├── backend/                # Express backend
│   ├── src/
│   │   ├── routes/         # API routes (chat, upload, doctor, transcription)
│   │   ├── services/       # Business logic (ollama, ocr, pdf)
│   │   └── index.ts        # Server entry
│   ├── Procfile            # Railway deployment
│   └── package.json
│
├── docs/
│   └── API_KEY_FALLBACK.md # API key fallback documentation
│
├── presentation/           # Project presentation
│   ├── index.html
│   ├── architecture_diagram.png
│   └── gamma_prompt.md
│
├── netlify.toml            # Frontend deploy config
├── vercel.json             # Vercel deploy config
└── README.md
```

---

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check + Ollama status |
| `POST` | `/api/chat` | Chat with local Ollama LLM |
| `POST` | `/api/upload` | Upload medical report (PDF/image) |
| `POST` | `/api/doctor` | Doctor finder |
| `POST` | `/api/transcription` | Audio transcription fallback |

---

## 🔑 API Key Fallback System

The app uses a **multi-provider fallback system** for AI operations:

1. **Gemini** (Primary) → Google AI
2. **OpenRouter** (Fallback 1 & 2) → Multi-model access
3. **Groq** (Fallback 1 & 2) → Ultra-fast inference

When one API key fails, the system automatically rotates to the next. See `docs/API_KEY_FALLBACK.md` for full details.

---

## 🌐 Deployment

| Component | Platform | Config |
|---|---|---|
| Frontend | Vercel / Netlify | `vercel.json` / `netlify.toml` |
| Backend | Railway | `backend/Procfile` + `railway.toml` |

---
