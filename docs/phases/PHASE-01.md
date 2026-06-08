# Phase 1: Foundation & Project Scaffolding

## Goal

Set up the Laravel project with all dependencies, database connection, authentication, base layout, and dark mode theming. At the end of this phase, you can log in and see an empty dashboard shell.

## Tasks

1. **Create Laravel project** with Breeze (Inertia/React + TypeScript)
2. **Configure PostgreSQL** connection in `.env`
3. **Install and configure shadcn/ui** (rsc: false, Tailwind v4, dark mode, Lucide icons)
4. **Set up global theme file** (font sizes, color palette, design tokens, CSS variables)
5. **Dark mode as default** with light mode toggle in header
6. **Create base layout** — sidebar/navigation shell with placeholders for Finance and Nutrition modules
7. **Configure path aliases** (`@/components`, `@/lib`, `@/hooks`, etc.)
8. **Verify auth flow** — login works, redirects to dashboard

## Acceptance Criteria

- [ ] `php artisan serve` + `npm run dev` runs without errors
- [ ] PostgreSQL connected and migrations run
- [ ] User can register/login (Breeze)
- [ ] Dashboard page renders with dark mode by default
- [ ] Light mode toggle works
- [ ] shadcn/ui components render correctly (test with a Button)
- [ ] TypeScript strict mode enabled, no type errors
- [ ] Base layout is responsive (mobile nav works)

## Database

No domain tables yet. Only Breeze's default auth tables.

## Files Created

- Base layout component
- Theme configuration file
- Dark mode toggle component
- Dashboard page (empty shell)
