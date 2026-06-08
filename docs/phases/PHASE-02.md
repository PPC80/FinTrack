# Phase 2: Bank Accounts & Balance Tracking

## Goal

User can manage their bank accounts, cash balance, and metro card. The app shows total available balance at all times.

## Tasks

1. **Bank accounts CRUD** — add, edit, rename, remove accounts
2. **Set initial balance** for each account
3. **Cash on hand** — treated as a special "account" (always exists, can't be deleted)
4. **Metro card** — single card, displays balance, allows logging "recargas" (top-ups)
5. **Total balance display** — sum of all bank accounts + cash (metro card shown separately)
6. **UI: Accounts page** — list all accounts with current balances
7. **UI: Balance widget** — always-visible total balance (header or sidebar)

## Acceptance Criteria

- [ ] Can add a new bank account with name and initial balance
- [ ] Can edit account name and manually adjust balance
- [ ] Can remove a bank account (with confirmation)
- [ ] Cash on hand always present, balance editable
- [ ] Metro card shows its own balance
- [ ] Can log a metro card top-up (increases metro balance, decreases selected payment source)
- [ ] Total balance calculated correctly and displayed prominently
- [ ] All data persists in PostgreSQL

## Database Tables

### `accounts`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g., "Banco Bolivariano" |
| type | varchar | bank, cash, metro_card |
| balance | numeric(12,2) | Current balance |
| is_default | boolean | Default payment source |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `account_transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| account_id | FK → accounts | |
| amount | numeric(12,2) | Positive = deposit, negative = withdrawal |
| description | varchar | |
| type | varchar | top_up, expense, income, adjustment |
| period | varchar(7) | YYYY-MM |
| created_at | timestamptz | |

## Notes

- The "cash" account is seeded automatically and cannot be deleted
- The "metro card" account is seeded automatically and cannot be deleted
- Balance is denormalized for quick reads; transactions provide the audit trail
- Adjustments allow manual balance corrections without needing to log a fake expense
