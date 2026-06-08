# FinTrack — Product Requirements Document

## Overview

FinTrack is a personal web application for tracking daily finances and nutrition. It combines a finance tracker with a macro/calorie tracker in a single unified interface.

**Currency:** USD (Ecuador)
**Period:** Calendar month (1st to last day)
**User:** Single user, personal use only

---

## Finance Module

### Core Concept

A real-time money tracker. The user logs income, planned expenses, and actual spending. The app constantly shows: "You have $X left to spend right now."

**Formula:**
```
Available Money = (Sum of all bank accounts + cash)
                - (Remaining unpaid obligations for the month)
```

**Monthly Carry-over:**
Previous month leftover carries into the next. The "big number" represents cumulative available money across months.

---

### 1. Bank Accounts & Balance Tracking

- Multiple bank accounts (initially: Banco Bolivariano, Banco Guayaquil)
- Can add/remove accounts via UI
- Cash on hand as a separate "account"
- Metro card with its own balance (single card, fixed fare per trip)
- **Total balance** = sum of all accounts + cash (metro card is separate/dedicated)
- When logging any expense, select payment source → automatically deducts from that source's balance

### 2. Expense Categories

Categories are extensible via UI. Initial categories:

| Category | Type | Behavior |
|----------|------|----------|
| Basic Expenses | Fixed monthly | Auto-populates each month with editable amounts. Mark paid/unpaid. |
| Food (Groceries) | Item-based | Planned list + unplanned purchases. Items have saved prices. Quantity tracking. IVA per-item. |
| Personal Care | Item-based | Same as food (items with prices, quantities, IVA). |
| Cat | Item-based | Same pattern. |
| Transportation | Trip-based | Modes with per-trip cost. One-click "+1 trip" button. Monthly reset. Metro deducts from metro card. |
| Misc / Unplanned | Log-based | One-off expenses. Counter of shame (visual sum of "guilty" spending). |

**Per-category default payment source** — each category can have a default bank account/cash.

### 3. Basic Expenses (Fixed Monthly)

- Items: arriendo, luz, agua, internet, etc.
- Each has a fixed amount (editable per month)
- Status: paid / to-be-paid
- Shows: total, paid so far, remaining to pay
- Auto-populates when new month starts (amounts from previous month as defaults)
- User can add/remove basic expense items

### 4. Item-Based Categories (Food, Personal Care, Cat)

- **Item catalog:** Each item has a name and a saved base price in the database
- Prices are editable at any time
- **IVA handling:** Each item individually tagged as "gravan IVA" (15% added) or "exento" (no tax)
- **Quantity:** When logging a purchase, specify quantity (default: 1)
- **Total calculation:** (price × quantity) + IVA if applicable
- **Grocery planning:** User can pre-define a planned grocery list, then mark items as bought. Also log unplanned purchases that weren't on the list.
- **Flexible frequency:** No set schedule — buy when needed

### 5. Transportation

- Transport modes: metro, bus normal, taxi, semi-taxi (extensible)
- Each mode has a saved per-trip cost
- Log a trip with one-click "+" button
- Trip counter resets each month
- Shows: trips taken per mode, total cost per mode, total transportation cost
- **Metro card:** Separate balance. When logging a metro trip, deduct fare from metro card balance. User can log "recargas" (top-ups) to metro card.
- Metro card top-ups are also an expense (from a payment source)

### 6. Misc Expenses & Counter of Shame

- Log any unplanned expense with: description, amount, payment source
- Optional tag: "guilty" (counts toward shame counter)
- **Counter of shame:** Visual sum of all "guilty"-tagged expenses for the month
- Also separately shows total spent on taxis
- No alerts/limits — purely visual

### 7. Monthly Budget & Real-Time Tracker

- **Income:** Log multiple income sources per month (salary, freelance, side gigs, etc.)
- **Total monthly income** = sum of all income entries
- **Total planned spending** = sum of all category obligations
- **Monthly leftover** = income - planned spending
- **Real-time available** = actual bank balances + cash - remaining unpaid obligations
- **Carry-over:** Previous month's leftover adds to current month
- **The Big Number:** "You have $X left to spend right now" — always visible, always accurate

### 8. Payment Source Integration

- Every expense optionally asks: "From which account?"
- Per-category default (e.g., groceries → Banco Bolivariano, transport → cash)
- When expense is logged with a source, that source's balance decreases in the app
- Income deposits specify which account received the money

### 9. Month Transition

- When a new month starts (calendar month):
  - All basic expenses reset to "to be paid"
  - Grocery planned list resets (items stay in catalog, purchases clear)
  - All category spending resets
  - Transport trip counters reset
  - Previous month data preserved for history
  - Leftover balance carries forward
- All data tagged with period (YYYY-MM format)

### 10. History

- Browse previous months' data
- Basic view: see what was spent in any past month
- Data preserved indefinitely for future dashboard/charts

### 11. Predicted Income & Wishlist (Sub-module)

- **Predicted income:** Log expected future money (e.g., lawsuit settlement, tax return)
- Each entry: description + estimated amount + optional date
- **Wishlist:** Simple list of items with name + price
- Purely reference — does NOT affect budget calculations or real-time balance
- Separate section within the Finance module

---

## Nutrition Module

<!-- To be defined in a future planning session. -->

---

## Design

- Dark mode as default, light mode toggle
- Modern UI with shadcn/ui components
- Mobile-focused design
- Fully responsive (desktop and mobile)
- Clean, minimal interface prioritizing usability
- "The Big Number" prominently displayed on the finance dashboard
