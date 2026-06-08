# Phase 9: Predicted Income & Wishlist

## Goal

A separate sub-module within Finance for tracking expected future income and maintaining a simple wishlist. Purely informational — does not affect budget calculations.

## Tasks

1. **Predicted income list** — add entries with description, estimated amount, optional expected date
2. **Edit/remove predictions**
3. **Wishlist** — simple list of desired items with name and price
4. **Add/remove/edit wishlist items**
5. **Total predicted income display**
6. **Total wishlist cost display**
7. **Separate page/section** — clearly distinct from the main budget

## Acceptance Criteria

- [ ] Can add predicted income entry (description + amount + optional date)
- [ ] Can edit/remove predicted income entries
- [ ] Total predicted income displayed
- [ ] Can add wishlist item (name + price)
- [ ] Can edit/remove wishlist items
- [ ] Total wishlist cost displayed
- [ ] None of this data affects The Big Number or real-time balance
- [ ] Clear UI separation from main finance tracking

## Database Tables

### `predicted_income`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| description | varchar | e.g., "Ingreso juicio" |
| amount | numeric(12,2) | Estimated amount |
| expected_date | date, nullable | When you might receive it |
| is_received | boolean | Mark when actually received |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `wishlist_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g., "New headphones" |
| price | numeric(10,2) | Estimated price |
| url | varchar, nullable | Link to product |
| priority | integer, nullable | Optional ranking |
| is_purchased | boolean | Mark when bought |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Notes

- When predicted income is "received," user can manually create an income_entry (Phase 7) to make it real
- Wishlist is just a reference list — buying an item is a manual action separate from this
- These tables are NOT period-based — they persist until resolved/deleted
- Added a simple priority field even though it was described as "simple list" — it's just an integer for ordering, costs nothing
