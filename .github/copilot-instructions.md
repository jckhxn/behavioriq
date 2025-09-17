# Copilot Instructions for AI Diagnostic Codebase

## Project Overview

This is a Next.js 15 application for AI-powered behavioral assessments and document-based knowledge chat. It integrates OpenAI GPT-4, vector search (pgvector), and real-time scoring. The architecture is modular, with clear separation between UI, API, business logic, and data layers.

## Key Architectural Patterns

- **App Router**: All routing is handled via Next.js App Router (`app/`). API endpoints are in `app/api/`.
- **Component Organization**: UI components are grouped by domain in `components/` (e.g., `admin/`, `assessment/`, `chat/`, `documents/`, `scoring/`, `ui/`).
- **AI Services**: Core AI logic is in `lib/ai/AssessmentAI.ts` and `lib/ai/KnowledgeAI.ts`. OpenAI integration is in `lib/ai/openai.ts`.
- **Document Processing**: Format-specific processors are in `lib/documents/processors/` (e.g., `pdf.ts`, `docx.ts`, etc.). Chunking and embeddings logic is in `lib/documents/chunker.ts` and `lib/documents/embeddings.ts`.
- **Database Access**: Prisma ORM is configured in `lib/db/prisma.ts`. Models are defined in `prisma/schema.prisma`.
- **Authentication**: NextAuth.js v5 is configured in `app/api/auth/[...nextauth]/route.ts` and `lib/auth/config.ts`.

## Developer Workflows

- **Start Dev Server**: `npm run dev`
- **Build/Prod**: `npm run build` → `npm run start`
- **Database Migrations**: `npx prisma migrate dev --name <name>`
- **Seed Database**: `npx prisma db seed`
- **Prisma Studio**: `npx prisma studio` (GUI)
- **Lint/Type Check**: `npm run lint`, `npm run type-check`

## Testing

- Tests are located in `lib/assessment/scoring.test.ts`. Use your preferred test runner (not specified in README).

## Conventions & Patterns

- **Chunking**: Documents are split into ~1500 character chunks with overlap for embeddings.
- **Vector Search**: Uses OpenAI embeddings (1536-dim) and pgvector for semantic search.
- **Role-Based Access**: Admin/user roles enforced in API routes and UI.
- **Risk Scoring**: Assessment scores are mapped to risk levels (LOW, MODERATE, HIGH, VERY_HIGH) with visual indicators.
- **Source Attribution**: Knowledge chat responses cite document sources.
- **API Validation**: Input validation is handled in API route files.

## Integration Points

- **OpenAI**: API key required in `.env.local` (`OPENAI_API_KEY`). Used for chat and embeddings.
- **PostgreSQL**: Requires pgvector extension. Connection string in `.env.local` (`DATABASE_URL`).
- **File Uploads**: Supported formats: PDF, DOCX, Excel, CSV, TXT. Upload via `/api/documents/upload`.

## Example: Adding a Document Processor

1. Create a new processor in `lib/documents/processors/` (e.g., `pptx.ts`).
2. Update `lib/documents/processors/index.ts` to include the new processor.
3. Ensure chunking and embeddings logic supports the new format.

## Troubleshooting

- **Database**: Ensure PostgreSQL and pgvector are running. Check `DATABASE_URL`.
- **OpenAI**: Verify API key and quota.
- **File Uploads**: Check `MAX_FILE_SIZE` and `UPLOAD_DIR` in `.env.local`.

## References

- `README.md`: Full setup, architecture, and troubleshooting details.
- `prisma/schema.prisma`: Database models.
- `lib/ai/AssessmentAI.ts`, `lib/ai/KnowledgeAI.ts`: Core AI logic.
- `components/`: UI components by domain.
- `app/api/`: API endpoints.

---

**Feedback:** If any section is unclear or missing, please specify what needs improvement or additional detail.
