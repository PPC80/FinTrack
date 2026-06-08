# Phase 4: Item-Based Categories (Food, Personal Care, Cat)

## Goal

User can manage item catalogs with saved prices, IVA handling, and quantity-based purchase logging for groceries, personal care, and cat supplies.

## Tasks

1. **Item catalog** — global list of items with name, base price, IVA status
2. **Add/remove items** from catalog
3. **Edit item prices** at any time (updates catalog, doesn't affect past purchases)
4. **IVA toggle per item** — "gravan IVA" (15% added) or "exento" (no tax)
5. **Log a purchase** — select item, specify quantity (default: 1), confirm total
6. **Total calculation** — (price × quantity) + 15% IVA if applicable
7. **Planned grocery list** — pre-define items you plan to buy, mark as bought
8. **Unplanned purchases** — log items not on the planned list
9. **Payment source selection** — uses category default, overridable per purchase
10. **Monthly view** — show all purchases for current period, totals per category

## Acceptance Criteria

- [ ] Can add an item to catalog with name, price, IVA status
- [ ] Can edit item name, price, or IVA status
- [ ] Can remove item from catalog (historical purchases preserved)
- [ ] Can log a purchase: item + quantity + payment source
- [ ] IVA calculated correctly (15% on tagged items, 0% on exempt)
- [ ] Purchase deducts from selected payment source balance
- [ ] Can create a planned grocery list for the month
- [ ] Can mark planned items as "bought" (creates purchase record)
- [ ] Can log unplanned purchases
- [ ] Monthly totals display correctly per category
- [ ] Purchases reset each month (catalog persists)

## Database Tables

### `catalog_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| category_id | FK → expense_categories | Which category (food, personal care, cat) |
| name | varchar | e.g., "Atún", "Pasta de dientes" |
| price | numeric(10,2) | Base price (before IVA) |
| has_iva | boolean | If true, 15% IVA applies |
| is_active | boolean | Soft delete for catalog |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `purchases`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| catalog_item_id | FK → catalog_items | |
| category_id | FK → expense_categories | Denormalized for quick queries |
| quantity | integer | Default: 1 |
| unit_price | numeric(10,2) | Price at time of purchase |
| iva_amount | numeric(10,2) | Calculated IVA (0 if exempt) |
| total | numeric(10,2) | (unit_price × quantity) + iva_amount |
| account_id | FK → accounts | Payment source |
| period | varchar(7) | YYYY-MM |
| is_planned | boolean | Was this on the planned list? |
| purchased_at | timestamptz | |
| created_at | timestamptz | |

### `planned_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| catalog_item_id | FK → catalog_items | |
| period | varchar(7) | YYYY-MM |
| quantity | integer | Planned quantity |
| is_purchased | boolean | Marked when bought |
| purchase_id | FK → purchases, nullable | Links to actual purchase |
| created_at | timestamptz | |
| updated_at | timestamptz | |

## Notes

- Catalog items persist forever (soft-deleted via is_active)
- Purchases snapshot the price at purchase time (independent of catalog updates)
- Planned items reset each month (clear is_purchased, remove purchase_id)
- IVA rate (15%) stored as app config, not hardcoded in calculations
- A purchase from a planned item automatically marks the planned_item as purchased
