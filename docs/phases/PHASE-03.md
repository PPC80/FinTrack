# Phase 3: Expense Categories & Basic Expenses

## Goal

User can manage expense categories and log fixed monthly expenses (rent, utilities, etc.) with paid/unpaid tracking.

## Tasks

1. **Categories CRUD** — create, edit, delete expense categories via UI
2. **Seed initial categories** — Basic Expenses, Food, Personal Care, Cat, Transportation, Misc
3. **Per-category default payment source** — assign a default bank account to each category
4. **Basic expenses management** — add/remove fixed monthly items (arriendo, luz, agua, internet)
5. **Monthly amounts** — each item has an amount (editable, defaults from previous month)
6. **Paid/unpaid toggle** — mark items as paid for the current month
7. **Summary display** — total, paid so far, remaining to pay
8. **Month auto-population** — when a new month starts, basic expenses populate with previous month's amounts as defaults

## Acceptance Criteria

- [ ] Can create a new expense category with name and optional default payment source
- [ ] Can edit/delete categories
- [ ] Can add a basic expense item (name + monthly amount)
- [ ] Can mark a basic expense as paid → amount deducts from selected payment source
- [ ] Can unmark (revert to unpaid) → amount returns to payment source
- [ ] Summary shows: total obligations, paid so far, remaining
- [ ] Items persist across sessions
- [ ] New month auto-populates items with previous month's amounts (all marked unpaid)

## Database Tables

### `expense_categories`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g., "Basic Expenses" |
| type | varchar | fixed, item_based, trip_based, misc |
| default_account_id | FK → accounts, nullable | |
| sort_order | integer | Display order |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `basic_expenses`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | FK → expense_categories | |
| name | varchar | e.g., "Arriendo" |
| amount | numeric(12,2) | Monthly amount |
| is_paid | boolean | For current period |
| paid_at | timestamptz, nullable | When marked paid |
| account_id | FK → accounts, nullable | Which account paid (overrides category default) |
| period | varchar(7) | YYYY-MM |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `basic_expense_templates`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | FK → expense_categories | |
| name | varchar | Template name |
| default_amount | numeric(12,2) | Default amount for new months |
| sort_order | integer | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Notes

- Templates define what items auto-populate each month
- Actual `basic_expenses` records are created per-period from templates
- User can override amounts per month without affecting the template
- Deleting a template doesn't delete historical records
