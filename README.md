# 📚 StudyMate AI

AI-powered study platform — notes, flashcards, live multiplayer quizzes, AI tutor, and more.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Edit .env — add GROQ_API_KEY and JWT_SECRET at minimum

# 3. Run
npm start          # Production mode (serves built React + API on :3001)
npm run dev        # Dev mode (API on :3001, Vite on :5173)
```

## Deploy to Render

1. Push to GitHub
2. Render → New Web Service → connect repo
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add env vars: `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BASE_URL`, `CLIENT_URL`, `JWT_SECRET`

Accounts now persist via Supabase when `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are set. Without them, accounts are in-memory only.
See `OAUTH_SETUP.md` for Google/GitHub/Discord social login setup.

## Features
- 📄 Upload PDF, DOCX, PPTX, XLSX, TXT — AI extracts text
- 🤖 AI summaries, flashcards, mind maps (Groq LLaMA3)
- 🎯 Solo quizzes and live multiplayer (Kahoot-style)
- 💬 AI Tutor chat with document context
- 📅 Personalized study plan generator
- 🏆 XP, levels, achievements, leaderboard
- 📱 PWA — installable on any device

## Environment Variables
| Key | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ | AI features — free at console.groq.com |
| `SUPABASE_URL` | ✅ for prod accounts | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ for prod accounts | Server-side key used to persist users |
| `JWT_SECRET` | ✅ | Random secret string |
| `BASE_URL` | ✅ for prod | Your Render URL |
| `CLIENT_URL` | ✅ for prod | Your Render URL (same as BASE_URL) |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | Optional | GitHub OAuth |
| `DISCORD_CLIENT_ID/SECRET` | Optional | Discord OAuth |
