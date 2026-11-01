 HEAD
# Nexora-ai
AI-powered Career Intelligence and Skill Gap Analysis Platform

# Nexora AI — Career Intelligence & Gap Analysis Platform

Nexora AI is a full-stack career acceleration platform that analyzes resumes against target market roles, performs semantic skill extraction, constructs prerequisite knowledge graphs, and generates personalized learning roadmaps with recommended projects.



## 🛠️ System Architecture

 **Frontend (`/frontend`)**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, ReactFlow (interactive skill knowledge graphs), TanStack Query, and React Router 6.
 **Backend API (`/backend`)**: Express, TypeScript, Zod schema validation, JWT authentication with bcrypt password hashing, and hybrid Postgres / In-Memory database store with automatic fallback and seed synchronization.
 **ML & NLP Service (`/ml-service`)**: Python FastAPI, NetworkX directed graphs for prerequisite resolution and topological sorting, keyword & alias normalization, and semantic matching.
 **Seed Knowledge Data (`/data/seed`)**: Curated taxonomy of 80+ skills, prerequisite dependency edges, 5 benchmark role profiles, and 6 portfolio project blueprints.



## 🚀 Quick Start

### 1. Launch All Services
Run the launcher script to start all 3 services in separate windows:

powershell
.\scripts\start-all.ps1


Or on CMD / Windows Explorer:
cmd
scripts\start-all.bat


### 2. Manual Startup

**ML Service (Port 8000)**:
bash
cd ml-service
python -m uvicorn main:app --reload --port 8000


**Backend API (Port 3001)**:
bash
cd backend
npm run dev


**Frontend (Port 5173)**:
bash
cd frontend
npm run dev
```

---

## 🔑 Demo Account

You can click **"Sign in with Demo Account"** on the login page, or use:

- **Email**: `demo@nexora.ai`
- **Password**: `Password123!`



## 🧭 Application Routes

- `/` — Interactive landing page explaining semantic matching and graph analysis.
- `/dashboard` — Personal progress overview, quick metric cards, and recent gap analyses.
- `/resume` — PDF resume upload with client and ML parsing, manual skill tagging, and text inspection.
- `/roles` — Benchmark role catalog (Full Stack, Frontend, Backend, ML Engineer, DevOps) and custom job description analyzer.
- `/analysis/:id` — Explainable skill gap comparison (matched, missing, uncertain) with confidence scores and verified evidence.
- `/graph` — Interactive ReactFlow node canvas showing prerequisite skill relationships.
- `/roadmap/:analysisId` — Chronologically ordered learning tasks calculated via topological graph traversal with study hours.
- `/projects` — Real-world project blueprints mapped to bridge missing skills.
- `/settings` — Profile management, JSON career dossier export, and data sovereignty controls.

 0469b82 (Initial commit - Nexora AI Career Intelligence Platform)
