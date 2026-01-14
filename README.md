# HealthWise.AI

AI-powered health companion for medical report analysis, exercise routines, nutrition tracking, and wellness management.

## Project Structure

```
healthwise.ai/
├── frontend/          # React + Vite frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── config/        # Configuration
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── backend/           # Express.js backend API (placeholder)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Business logic
│   │   └── index.ts       # Server entry
│   └── package.json       # Backend dependencies
│
└── docs/              # Documentation
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend (Coming Soon)

```bash
cd backend
npm install
npm run dev
```

The backend will run at `http://localhost:5000`

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment

- **Vercel**: Deploy the `frontend/` directory
- **Netlify**: Configure build settings to use `frontend/` as base directory
