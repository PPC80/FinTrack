# Phase 6: Misc Expenses & Counter of Shame

## Goal

User can log unplanned/miscellaneous expenses and see a visual "counter of shame" summing up guilty spending.

## Tasks

1. **Log misc expense** — description, amount, payment source, optional "guilty" tag
2. **Category assignment** — misc expenses belong to the Misc category but are freeform
3. **Counter of shame** — visual sum of all "guilty"-tagged expenses for the month
4. **Taxi shame** — separately show total spent on taxis this month (from trip data in Phase 5)
5. **Misc expense list** — view all misc expenses for the current period
6. **Payment source integration** — deducts from selected account

## Acceptance Criteria

- [ ] Can log a misc expense with description, amount, payment source
- [ ] Can toggle "guilty" tag when logging
- [ ] Counter of shame displays sum of guilty expenses for current month
- [ ] Taxi spending total shown separately (pulled from trips data)
- [ ] Can view list of all misc expenses for the month
- [ ] Payment source balance decreases when expense logged
- [ ] Misc expenses included in overall monthly spending calculations
- [ ] Data tagged with period (YYYY-MM)

## Database Tables

### `misc_expenses`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| description | varchar | e.g., "McDonalds", "Panadería" |
| amount | numeric(10,2) | |
| is_guilty | boolean | Counts toward shame counter |
| account_id | FK → accounts | Payment source |
| period | varchar(7) | YYYY-MM |
| spent_at | timestamptz | |
| created_at | timestamptz | |

## Notes

- The counter of shame is a computed value (SUM of guilty expenses), not stored
- Taxi spending total is computed from the `trips` table where transport_mode is taxi
- No alerts or limits — purely informational display
- These expenses factor into the "total spent this month" calculation
- The UI should make it quick to log (minimal friction — description + amount + submit)
