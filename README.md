# Coachino (کوچینو)

> **Personal AI Coach** that starts with an MBTI-style assessment and turns insights into actionable tasks, scenarios, and progress tracking — built with **Next.js 15 (App Router) + TypeScript + Prisma + PostgreSQL** and an AI stack (AI SDK + RAG + ASR).

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED" />
  <img src="https://img.shields.io/badge/PM2-deploy-2b2e3b" />
</p>

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Monorepo/Structure](#monorepostructure)
* [Getting Started](#getting-started)
* [Environment Variables](#environment-variables)
* [Database & Prisma](#database--prisma)
* [Seeding (MBTI 10Q)](#seeding-mbti-10q)
* [AI & RAG](#ai--rag)
* [ASR (Persian Whisper)](#asr-persian-whisper)
* [Scripts](#scripts)
* [Docker & Compose](#docker--compose)
* [Production Deploy (PM2 + Nginx)](#production-deploy-pm2--nginx)
* [API Endpoints](#api-endpoints)
* [Frontend Notes (RTL + Tailwind)](#frontend-notes-rtl--tailwind)
* [Testing](#testing)
* [Troubleshooting](#troubleshooting)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

**Coachino (کوچینو)** is a Persian-first personal coaching platform. Users take a short MBTI-style test (10 questions) and immediately receive:

* A type summary and color-coded dimension scores (E/I, S/N, T/F, J/P)
* Personalized tasks, scenarios, and resources
* Progress tracking and lightweight analytics

The app uses a RAG pipeline for knowledge retrieval and integrates a custom Persian **ASR** service for voice interactions.

## Key Features

* 🔐 **Auth via signed cookie/JWT** (server actions, API routes)
* 🧠 **AI chat** with context tools (tasks, exams, scenarios)
* 🧩 **MBTI 10Q** anchored Likert (A vs B) with scoring & stored results
* 📚 **RAG**: vector search (Milvus) + rerank + grading loop
* 🔊 **Persian ASR** endpoints for speech-to-text
* 🗃️ **Prisma ORM** with PostgreSQL
* 🛳️ **Docker-ready**, **PM2** process management, **Nginx** reverse proxy
* 🌐 **RTL UI** with Tailwind and Persian fonts

## Architecture

```
┌───────────────┐   HTTP/WebSocket   ┌────────────────────┐
│   Browser     │  ─────────────────▶│  Next.js AppRouter │
│ (RTL / UI)    │◀───────────────────│  API Routes        │
└──────┬────────┘                     └───────┬────────────┘
       │ Prisma ORM                             │ RAG/AI SDK
       ▼                                        ▼
┌───────────────┐                       ┌──────────────────┐
│  PostgreSQL   │◀──────────────────────│  AI Services     │
│  (User, MBTI, │    vectors/embeds     │  (OpenAI etc.)  │
│  Tasks, ... ) │──────────────────────▶│  Milvus VectorDB │
└───────────────┘                       └──────────────────┘
       ▲                                        ▲
       │ JWT/cookie                             │ ASR
       ▼                                        ▼
┌───────────────┐                       ┌──────────────────┐
│  Nginx        │  reverse proxy       │ Persian ASR (GPU)│
└───────────────┘                       └──────────────────┘
```

## Tech Stack

* **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS (RTL aware)
* **Backend**: API routes with AI SDK tooling (dynamic tools)
* **DB**: PostgreSQL + Prisma
* **RAG**: Milvus (vector DB), optional MinIO for object storage
* **ASR**: FastAPI-based Persian Whisper server
* **Infra**: Docker, PM2, Nginx

## Monorepo/Structure

```
.
├─ app/                   # Next.js (routes, pages, API)
├─ prisma/                # prisma.schema, migrations, seeders
├─ src/                   # lib, services, ai tools
│  ├─ auth/               # AuthFunctions (cookie/JWT)
│  ├─ function/ai/        # AI tool builders (e.g., MainChatFunctions)
│  ├─ lib/rag.ts          # RAG helpers
│  ├─ prisma/             # prisma client export
│  └─ ...
├─ docker/                # compose files, env templates
├─ public/                # static assets (fonts, icons)
└─ ...
```

## Getting Started

1. **Prereqs**: Node 20+, PNPM/NPM, Docker, PostgreSQL 15+, Milvus (optional in dev)
2. **Clone & Install**

   ```bash
   git clone <repo-url>
   cd coachino
   pnpm install # or npm i
   ```
3. **Configure ENV** (see below)
4. **DB Migrate**

   ```bash
   pnpm prisma migrate dev
   ```
5. **Seed (optional)**

   ```bash
   pnpm prisma db seed
   ```
6. **Run Dev**

   ```bash
   pnpm dev
   ```

## Environment Variables

Create a `.env` from `.env.example`:

```
# Core
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/coachino

# Auth
JWT_SECRET=replace_me
COOKIE_NAME=token
COOKIE_SECURE=false

# AI / OpenAI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-5 # or o3-mini, etc.
AI_TEMPERATURE=0.2

# RAG / Vector DB
MILVUS_HOST=localhost
MILVUS_PORT=19530
MILVUS_COLLECTION=ARAG_V3

# MinIO (optional)
MINIO_ENDPOINT=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=coachino

# ASR Service
ASR_URL=http://localhost:8000/transcribe
```

## Database & Prisma

* **Generate client**: `pnpm prisma generate`
* **Create migration**: `pnpm prisma migrate dev --name init`
* **Studio**: `pnpm prisma studio`

> Prisma client output is configured to `./generated/prisma`. Update imports if you change this path.

## Seeding (MBTI 10Q)

A minimal 10-question **A vs B** Likert-5 Persian MBTI seed is included. Run:

```bash
pnpm prisma db seed
```

This will upsert the `Likert5_A_vs_B_FA` scale and create 10 items mapped to E/I, S/N, T/F, J/P with weights `[2,1,0,-1,-2]` and store results for quick onboarding.

## AI & RAG

* **AI SDK**: Tools provide access to user data (`GetUserData`), tasks, exam results, and contextual history.
* **RAG Loop** (simplified): contextualize → embed → retrieve (Milvus) → rerank/grade → generate (or rewrite) → stop on quality threshold.
* **Embeddings**: Jina/OpenAI (configurable). See `src/lib/rag.ts`.

## ASR (Persian Whisper)

* Optional **FastAPI** server exposing `/transcribe` (GPU recommended).
* Configure `ASR_URL` and call from client/server to enable voice input in chat.

## Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start -p $PORT",
    "lint": "next lint",
    "prisma:gen": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed"
  }
}
```

## Docker & Compose

> Example `docker-compose.yml` (Postgres + Milvus + MinIO). Adjust volumes/ports as needed.

```yaml
version: "3.9"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: coachino
      POSTGRES_PASSWORD: coachino
      POSTGRES_DB: coachino
    ports: ["5432:5432"]
    volumes:
      - pgdata:/var/lib/postgresql/data

  milvus:
    image: milvusdb/milvus:latest
    ports: ["19530:19530"]
    environment:
      ETCD_USE_EMBED: "true"
      MINIO_USE_EMBED: "true"

  minio:
    image: minio/minio
    command: server /data
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports: ["9000:9000", "9001:9001"]
    volumes:
      - minio:/data

volumes:
  pgdata:
  minio:
```

## Production Deploy (PM2 + Nginx)

**PM2 ecosystem** (`ecosystem.config.js`):

```js
module.exports = {
  apps: [{
    name: "coachino",
    script: "node .next/standalone/server.js",
    env: { PORT: 3000, NODE_ENV: "production" }
  }]
}
```

**Nginx** (example for `coachino.nexiino.info`):

```
server {
  server_name coachino.nexiino.info;
  listen 80;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Add SSL via certbot and upgrade `listen 443 ssl;` with proper certificates.

## API Endpoints

> Paths may vary depending on your routing.

* `POST /api/chat/main` — streaming chat with AI tools
* `GET  /api/exams` — list available exams
* `POST /api/exams/submit` — submit MBTI answers
* `GET  /api/tasks` — user tasks
* `GET  /api/scenarios` — recommended scenarios
* `POST /api/search` — SmartSearch with RAG iteration

## Frontend Notes (RTL + Tailwind)

* Use Persian fonts (e.g., **Vazirmatn**). Example in `globals.css`:

  ```css
  html { direction: rtl; }
  body { font-family: Vazirmatn, sans-serif; }
  ```
* Components should support **RTL** and right-aligned text by default.
* Landing sections: *What is Coachino?*, *Why Coachino?*, *How it works (roadmap)* with transparent assets.

## Testing

* Unit tests (Jest/Vitest) for utils/services
* API integration tests (supertest) for critical routes
* E2E (Playwright) for main onboarding flow

## Troubleshooting

* **Prisma engine error** inside node_modules → remove lockfile and `node_modules`, then reinstall: `rm -rf node_modules && pnpm i && pnpm prisma:gen`
* **Milvus high RAM** → tune `milvus.yaml` or use embedded etcd/minio in dev, lower index cache size
* **Next.js CSS import warning** in VSCode → ensure `declarations.d.ts` includes `declare module '*.css';`
* **ASR import error** (`Could not import module "server"`) → verify FastAPI `server.py` or `api.py` entrypoint name and `uvicorn` command

## Contributing

1. Fork and clone
2. Create a feature branch: `git checkout -b feat/<name>`
3. Commit with conventional messages
4. Open a PR with screenshots for UI changes

## License

MIT © 2025 Coachino Team
