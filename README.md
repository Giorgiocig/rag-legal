# Legal Document Analysis RAG System

A full-stack web application for intelligent legal document analysis using Retrieval-Augmented Generation (RAG). Upload documents, create dossiers, and analyze them with AI-powered insights.

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip & npm

### Backend Setup

```bash
cd backend
python -m venv myvenv

# Windows
myvenv\Scripts\activate
# macOS/Linux
source myvenv/bin/activate

pip install -r requirements.txt
python main.py
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## 📋 Project Structure

```
backend/
├── main.py              # FastAPI server & endpoints
├── rag.py              # RAG service implementation
├── dossier_analysis.py # Dossier analysis logic
├── evaluate.py         # Evaluation utilities
├── db/                 # Database configuration (SQLAlchemy)
├── models/             # SQLAlchemy models (Document, Dossier, Chunk)
├── schemas/            # Request/response schemas
├── helper/             # Utility functions
└── storage/            # PDF storage directory

frontend/
├── app/                # Next.js pages (layout, dossier)
├── components/         # React components (chat, documents, analysis)
├── lib/                # Utilities & interfaces
└── public/             # Static assets
```

## 🔧 Features

- **Document Management**: Upload and store PDF documents
- **RAG System**: Semantic search with embeddings and retrieval
- **Dossier Creation**: Organize documents into dossiers
- **AI Analysis**: Query documents with AI-powered responses
- **Chat Interface**: Real-time chat for document interaction
- **Source Attribution**: Track document sources in responses

## 🛠️ Tech Stack

**Backend**:

- FastAPI (async Python web framework)
- SQLAlchemy + SQLite (database ORM)
- RAG pipeline (embeddings, vectorstore, LLM)

**Frontend**:

- Next.js 16.2.6 (React framework)
- React 19 with TypeScript
- Tailwind CSS + shadcn/ui (styling)
- Vercel AI SDK (OpenAI integration)
- Zod (schema validation)

## 📡 API Endpoints

Key endpoints:

- `POST /upload` - Upload document
- `POST /dossier` - Create dossier
- `POST /query` - Query with RAG
- `GET /documents` - List documents
- `GET /dossiers` - List dossiers

See FastAPI docs at `http://localhost:8000/docs`

## 🔐 Configuration

Create `.env` file in backend/:

```
OPENAI_API_KEY=your_key
DATABASE_URL=sqlite:///./app.db
```

Frontend uses environment from `package.json` scripts.

## 📦 Key Dependencies

**Backend**:

- FastAPI, SQLAlchemy, aiosqlite, pydantic, langchain/llamaindex

**Frontend**:

- Next.js, React, @ai-sdk/openai, Tailwind CSS, shadcn/ui

## 🚦 Development

1. Start backend: `python main.py` (port 8000)
2. Start frontend: `npm run dev` (port 3000)
3. Access UI at `http://localhost:3000`

CORS enabled for `localhost:3000`
