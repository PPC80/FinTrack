# Implementation Plan — Finance Module

## Phase Overview

| Phase | Name | Dependencies | Scope |
|-------|------|-------------|-------|
| 1 | Foundation & Scaffolding | None | Laravel + Breeze + shadcn + dark mode + layout |
| 2 | Bank Accounts & Balances | Phase 1 | Account CRUD, balances, metro card |
| 3 | Categories & Basic Expenses | Phase 2 | Category system, fixed monthly expenses, paid/unpaid |
| 4 | Item-Based Categories | Phase 3 | Food, personal care, cat. Catalog, IVA, quantities |
| 5 | Transportation | Phase 2, 3 | Transport modes, trip logging, metro deductions |
| 6 | Misc & Shame Counter | Phase 2, 3 | Freeform expenses, guilty tagging |
| 7 | Monthly Budget & Tracker | Phase 2-6 | Income, The Big Number, carry-over, real-time balance |
| 8 | History & Periods | Phase 7 | Period navigation, past month browsing |
| 9 | Predicted Income & Wishlist | Phase 1 | Future income, wishlist (independent sub-module) |
| 10 | Dashboard | Phase 7, 8 | Overview page tying everything together |

## Dependency Graph

```
Phase 1 (Foundation)
  ├── Phase 2 (Accounts)
  │     ├── Phase 3 (Categories & Basic Expenses)
  │     │     ├── Phase 4 (Item-Based: Food, Care, Cat)
  │     │     ├── Phase 5 (Transportation)
  │     │     └── Phase 6 (Misc & Shame)
  │     └────────── Phase 7 (Budget & Real-Time Tracker) ← needs 2-6
  │                   └── Phase 8 (History & Periods)
  │                         └── Phase 10 (Dashboard) ← needs 7, 8
  └── Phase 9 (Predicted Income & Wishlist) ← independent
```

## Implementation Rules

- Complete one phase fully before starting the next
- Each phase must pass its acceptance criteria before proceeding
- Reference `@docs/phases/PHASE-XX.md` in chat when implementing a phase
- Database tables build on each other — never skip a phase's migrations
- Phases 4, 5, and 6 can be done in any order (they're siblings under Phase 3)
- Phase 9 is independent and can be done at any point after Phase 1

## Future (Not Planned Yet)

- Nutrition Module (separate planning session)
- Advanced dashboard with charts/graphs
- Data export (CSV, PDF reports)
- Recurring expense automation
- Budget forecasting
