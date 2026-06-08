# FinTrack

Personal finance tracker + daily nutrition/macro tracker.

## Tech Stack

- **Backend:** Laravel 12, PHP 8.3+
- **Frontend:** React 19, TypeScript (strict), Inertia.js v2
- **UI:** shadcn/ui, Tailwind CSS v4, Lucide React icons
- **Database:** PostgreSQL
- **Auth:** Laravel Breeze (Inertia/React scaffold)
- **Testing:** Pest PHP

## Architecture

Monolith with SPA-like navigation via Inertia.js. Two core modules:

- **Finance** — Income, expenses, budgets, spending analysis
- **Nutrition** — Daily macros, calories, meal logging

Modules are separate but have synergy (e.g., food spending correlates with nutrition data).

Single-user personal app. No multi-tenancy.

## Directory Structure

```
app/
  Http/Controllers/       # One controller per module, method per action
  Http/Requests/          # FormRequest validation classes
  Models/                 # Eloquent models
  Services/{Domain}/      # Business logic (Finance/, Nutrition/)
  Actions/                # Single-purpose action classes
resources/js/
  Pages/{Module}/         # Inertia pages (Finance/, Nutrition/)
  Components/{Domain}/    # Domain-specific components
  Components/Forms/       # Form input components
  Components/ui/          # shadcn/ui components
  hooks/                  # Custom React hooks
  lib/                    # Utilities (cn, helpers)
database/
  migrations/             # PostgreSQL migrations
  factories/              # Model factories
  seeders/                # Development seeders
tests/
  Feature/                # HTTP/integration tests
  Unit/                   # Isolated logic tests
```

## Commands

```bash
composer install          # Install PHP dependencies
npm install               # Install JS dependencies
php artisan serve         # Start dev server
npm run dev               # Vite dev server
php artisan migrate       # Run migrations
php artisan test          # Run Pest tests
npx shadcn@latest add X  # Add shadcn component
```

## Environment

- Windows development (use cmd over PowerShell)
- OS-agnostic file path handling in code
