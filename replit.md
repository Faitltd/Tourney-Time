# Tourney Time - Tournament Bracket Research App

## Overview

Tourney Time is a web application that helps users research and predict tournament brackets using AI-powered analysis. Users input a sport and tournament name, the system fetches bracket information using the Perplexity API, and users can research each matchup before making predictions. The app displays AI-generated research with inline citations from trusted sources, allowing users to build complete bracket predictions one matchup at a time.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Query for server state, custom hooks for local tournament state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Design System**: Linear/Notion-inspired clean interface with Inter font, emphasis on information clarity and progress transparency

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints under `/api` prefix
- **Build Process**: Vite for client, esbuild for server bundling
- **Development**: Hot module replacement via Vite middleware

### Key API Endpoints
- `POST /api/research` - Fetch tournament bracket structure via Perplexity API
- `POST /api/matchup` - Get AI research for a specific matchup with citations

### External AI Integration
- **Perplexity API**: Used for real-time sports research with the `llama-3.1-sonar-large-128k-online` model
- Returns structured content with citations from recent web sources
- Search recency filter set to "week" for current tournament data

### Data Flow
1. User submits sport + tournament name
2. Backend queries Perplexity for bracket structure
3. Frontend displays bracket with matchup navigation
4. User requests research for current matchup
5. Backend fetches AI analysis with citations
6. User selects winner and progresses through bracket

### Storage
- **Current**: In-memory storage (MemStorage class) for user data
- **Schema**: Drizzle ORM configured with PostgreSQL dialect
- **Future-ready**: Database schema exists in `shared/schema.ts` with Zod validation

## External Dependencies

### AI/Research Services
- **Perplexity API** (`PERPLEXITY_API_KEY` required): Powers tournament discovery and matchup research with real-time web search capabilities

### Database
- **PostgreSQL**: Configured via Drizzle ORM, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tooling

### Core Libraries
- **React Query**: Async state management for API calls
- **Zod**: Runtime schema validation shared between client and server
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling

### Development Tools
- **Vite**: Frontend bundling with HMR
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development