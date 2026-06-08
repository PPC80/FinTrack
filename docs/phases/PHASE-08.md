# Phase 8: History & Period Navigation

## Goal

User can browse previous months' financial data and see historical records. All data is organized by period (YYYY-MM).

## Tasks

1. **Period selector** — dropdown or navigation to switch between months
2. **View past month data** — all categories, expenses, income, totals for any past period
3. **Read-only past months** — can browse but editing past data requires explicit confirmation
4. **Monthly summary cards** — at a glance: income, spent, leftover for each month
5. **Period-based queries** — all existing views filter by selected period

## Acceptance Criteria

- [ ] Period selector visible on finance pages
- [ ] Can switch to any previous month
- [ ] All data (expenses, income, categories) filters by selected period
- [ ] Past months show final totals (income, spent, leftover, carry-over)
- [ ] Current month is always the default view
- [ ] Editing past month data shows a confirmation warning
- [ ] Monthly summary list shows all months with data

## Notes

- No charts or complex analytics yet — that's Phase 10 (Dashboard)
- This phase ensures the data model supports period-based queries throughout the app
- All existing pages from phases 2-7 gain period awareness
- The period selector becomes a global UI element (in layout or header)
