# Repository Guidelines

## Project Structure & Module Organization
The Next.js app lives in `app/` with route groups like `app/api/...` for server actions and `app/(dashboard)` for UI flows. Shared React building blocks sit in `components/`, and supporting logic is under `lib/` (assessment scoring, services) and `hooks/` for client state. Data blueprints (`data/`), schema and migrations (`prisma/`), and typed contracts (`types/`) round out the domain layer. Assets and marketing collateral live in `public/` and `docs/`, while operational scripts (Stripe, SES, Supabase smoke tests) are collected in `scripts/`.

## Build, Test, and Development Commands
Use `npm run dev` for local development with Turbopack, and `npm run build` plus `npm run start` for production parity checks. Database tooling is driven through Prisma: `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed` (requires a populated `.env`). Quick health checks live in `scripts/`: e.g., `npx tsx scripts/test-db-connection.ts` verifies credentials, and `npx tsx lib/assessment/scoring.test.ts` exercises the scoring engine.

## Coding Style & Naming Conventions
Write TypeScript with two-space indentation and double-quoted imports to match existing files. Use PascalCase for React components (`components/AdminDashboard.tsx`), camelCase for hooks and helpers (`lib/services/assessmentService.ts`), and snake_case only when aligning with Prisma enums. Keep UI concerns in components, domain logic in `lib/`, and confine `fetch`/Prisma calls to server contexts or dedicated services. Tailwind CSS is preferred for styling; co-locate Tailwind utilities with semantic class helpers (`class-variance-authority`) when needed.

## Testing Guidelines
Automated coverage is lightweight; lean on the targeted TSX scripts in `scripts/` and the walkthroughs in `docs/TESTING_GUIDE.md` and `docs/TESTING_CONVERSATIONAL_FLOW.md`. Name exploratory scripts with the `test-*` prefix to keep alignment. When touching Prisma models, rerun `npx prisma generate` and smoke-test with the Stripe/Supabase scripts before opening a pull request.

## Commit & Pull Request Guidelines
Follow the existing `type: summary` convention (`feat:`, `fix:`, `chore:`) and scope in parentheses when helpful (`feat(onboarding): …`). Keep bodies concise, noting migrations or breaking changes. Pull requests should link the relevant Linear/GitHub issue, include screenshots or terminal output for observable UI/API changes, and document any manual test steps taken. Flag required environment or schema updates in the description so reviewers can reproduce reliably.

## Security & Configuration
Never commit secrets; base your local `.env` on `.env.example`. Run `npm run db:studio` only against sandbox data. When introducing new third-party integrations, document keys and webhook setup in `docs/` and ensure `middleware.ts` or API routes enforce auth before deploying.
