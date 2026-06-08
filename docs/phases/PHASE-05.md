# Phase 5: Transportation Module

## Goal

User can log trips by transport mode with one-click buttons, track trip counts, and manage metro card balance with automatic fare deductions.

## Tasks

1. **Transport modes CRUD** — metro, bus normal, taxi, semi-taxi (extensible)
2. **Per-mode fare** — saved cost per single trip (editable)
3. **One-click trip logging** — "+" button per mode, instantly logs a trip
4. **Trip counter** — shows count per mode for current month, resets monthly
5. **Cost calculation** — trips × fare per mode
6. **Metro card integration** — metro trips deduct from metro card balance (not from bank account)
7. **Metro top-ups** — log a "recarga" that increases metro card balance and deducts from a payment source
8. **Other modes** — taxi, bus, semi-taxi deduct from their category's default payment source (or cash)
9. **Monthly summary** — total trips, total cost, breakdown by mode

## Acceptance Criteria

- [ ] Can add/edit/remove transport modes with name and fare
- [ ] "+" button logs a trip instantly (one click)
- [ ] Trip counter shows per-mode count for current month
- [ ] Metro trip deducts fare from metro card balance
- [ ] Non-metro trips deduct from assigned payment source
- [ ] Can log metro card top-up (increases metro balance, decreases bank/cash)
- [ ] Monthly total shows correctly
- [ ] Trip counters reset when new month starts
- [ ] Cannot log metro trip if metro card balance is insufficient (warning, not block)

## Database Tables

### `transport_modes`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| name | varchar | e.g., "Metro", "Bus Normal" |
| fare | numeric(8,2) | Cost per trip |
| deducts_from_metro | boolean | True only for metro |
| default_account_id | FK → accounts, nullable | For non-metro modes |
| sort_order | integer | |
| is_active | boolean | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `trips`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| transport_mode_id | FK → transport_modes | |
| fare_at_time | numeric(8,2) | Fare snapshot |
| account_id | FK → accounts | Actual payment source used |
| period | varchar(7) | YYYY-MM |
| taken_at | timestamptz | |
| created_at | timestamptz | |

### `metro_topups`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| amount | numeric(8,2) | Top-up amount |
| source_account_id | FK → accounts | Bank/cash that funded the top-up |
| period | varchar(7) | YYYY-MM |
| created_at | timestamptz | |

## Notes

- Metro card is an account (type: metro_card) from Phase 2
- Metro trip: deducts fare from metro card account balance
- Metro top-up: deducts from bank/cash, adds to metro card balance
- Non-metro trips: deducts from the mode's default account or category default
- Fare is snapshotted at trip time (if fare changes mid-month, old trips keep old fare)
- Taxi spending is also trackable via the shame counter (Phase 6) if tagged
