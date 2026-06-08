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

## Cursor Cloud specific instructions

### System prerequisites (one-time on a fresh VM)

Ubuntu cloud VMs need PHP 8.3+ and Composer before `composer install` works:

```bash
sudo apt-get install -y php8.3 php8.3-cli php8.3-sqlite3 php8.3-mbstring php8.3-xml php8.3-curl php8.3-zip php8.3-bcmath php8.3-intl
curl -sS https://getcomposer.org/installer | php -- --install-dir=$HOME/.local/bin --filename=composer
export PATH="$HOME/.local/bin:$PATH"
```

### First-time app setup (after dependencies)

```bash
cp .env.example .env          # if .env missing
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

`.env.example` defaults to **SQLite** (no PostgreSQL server required). Project docs target PostgreSQL for production-style dev; switch `DB_CONNECTION=pgsql` only when a Postgres instance is available.

### Running the app

| Service | Command | Port |
|---------|---------|------|
| All-in-one dev | `composer dev` | Laravel **8000**, Vite **5173** |
| Laravel only | `php artisan serve` | **8000** |
| Vite only | `npm run dev` | **5173** |

Use two terminals (or `composer dev`) so both Laravel and Vite run together for HMR. Queue worker and Pail in `composer dev` are optional conveniences.

### Lint and tests

- **PHP lint:** `./vendor/bin/pint --test` (Laravel Pint; no npm lint script)
- **Tests:** `composer test` or `php artisan test` (uses in-memory SQLite; no external DB)
- **Feature tests that render Inertia pages** need built assets: run `npm run build` first, or keep `npm run dev` running
- **Frontend typecheck/build:** `npm run build` (`tsc && vite build`)

### Common gotchas

- `composer` is installed to `$HOME/.local/bin`; ensure that directory is on `PATH`.
- `ExampleTest` expects `GET /` to return 200, but `routes/web.php` redirects `/` to the dashboard (302) — one pre-existing test failure unrelated to environment setup.
- No Docker/Sail compose file in the repo; local dev uses native PHP + Node.
