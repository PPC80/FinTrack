# Phase 7: Monthly Budget & Real-Time Money Tracker

## Goal

Tie everything together. User logs income, the app calculates total obligations, and constantly displays "You have $X left to spend right now." This is the core value of the finance module.

## Tasks

1. **Income logging** — add multiple income entries per month (source name + amount + receiving account)
2. **Total income display** — sum of all income for the period
3. **Total obligations** — sum of all unpaid basic expenses + planned grocery budget + estimated category spending
4. **Monthly leftover** — income minus total planned spending
5. **Real-time available money** — actual balances minus remaining unpaid obligations
6. **The Big Number** — always-visible display of real-time available money
7. **Month carry-over** — previous month's leftover automatically added to current month
8. **Income deposits** — when logging income, specify which account received the money (increases that account's balance)

## Acceptance Criteria

- [ ] Can add income entry: source name, amount, receiving account
- [ ] Can edit/delete income entries
- [ ] Income deposit increases receiving account balance
- [ ] Total income displayed for current month
- [ ] Total obligations calculated from all unpaid expenses across all categories
- [ ] Monthly leftover = income - planned spending (displayed)
- [ ] The Big Number = sum of all account balances - unpaid obligations (displayed prominently)
- [ ] Previous month leftover carries into current month automatically
- [ ] All values update in real-time as expenses are logged/paid
- [ ] Works correctly when switching between months

## Database Tables

### `income_entries`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| source | varchar | e.g., "Salary", "Freelance project" |
| amount | numeric(12,2) | |
| account_id | FK → accounts | Which account received it |
| period | varchar(7) | YYYY-MM |
| received_at | timestamptz | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `monthly_summaries`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| period | varchar(7) | YYYY-MM |
| total_income | numeric(12,2) | Computed/cached |
| total_spent | numeric(12,2) | Computed/cached |
| leftover | numeric(12,2) | income - spent |
| carry_over_from_previous | numeric(12,2) | Previous month's leftover |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Calculations

```
Total Income = SUM(income_entries WHERE period = current)

Total Obligations = SUM(unpaid basic_expenses)
                  + SUM(planned_items not yet purchased × price)
                  + estimated remaining category budgets

Total Spent = SUM(purchases) + SUM(trips × fare) + SUM(misc_expenses)
            + SUM(paid basic_expenses)

Monthly Leftover = Total Income - Total Spent

The Big Number = SUM(all account balances) - SUM(unpaid obligations remaining)

Carry Over = previous month's (Total Income - Total Spent)
```

## Notes

- The Big Number is the most important metric — it answers "how much can I freely spend right now?"
- `monthly_summaries` is a cache table for performance; values recomputed when data changes
- Carry-over is calculated from the previous month's actual final state, not estimates
- This phase connects all previous phases into a unified financial picture
- The Big Number should be visible from the main dashboard at all times
