# NoteSync - AI-Powered Note-Taking App

A modern note-taking application with AI features including summarization, auto-tagging, semantic search, and chat with your notes.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TanStack Query, TanStack Router, TipTap
- **Backend**: Hono, Node.js, TypeScript
- **Database**: PostgreSQL with pgvector
- **AI**: Anthropic Claude API
- **Infrastructure**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js 22+
- Docker Desktop
- pnpm (or npm)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd AI-Note-Taking-App
```

2. Start the database
```bash
docker compose up -d
```

3. Install and run the backend
```bash
cd backend
pnpm install
pnpm dev
```

4. Install and run the frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Environment Variables

Create `.env` in the backend directory:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/notesync
CLAUDE_API_KEY=your_key_here
ACCESS_TOKEN_SECRET=your_secret_here
REFRESH_TOKEN_SECRET=your_secret_here
```

## Project Structure
```
AI-Note-Taking-App/
├── frontend/          # React frontend
├── backend/           # Hono API
├── docker-compose.yml # PostgreSQL database
└── README.md
```

## Development Roadmap

- [x] Week 1-2: Foundation & Setup
- [ ] Week 3-4: Authentication
- [ ] Week 5-6: Core CRUD & Editor
- [ ] Week 7-8: AI Features (Summarization, Auto-tagging)
- [ ] Week 9-10: Semantic Search & RAG
- [ ] Week 11-12: Production Deployment

## License

MIT