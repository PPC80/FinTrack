# Phase 10: Finance Dashboard

## Goal

A comprehensive overview page showing all financial data at a glance — The Big Number, category breakdowns, monthly trends, and key metrics.

## Tasks

1. **The Big Number** — prominent display of real-time available money
2. **Quick stats row** — total income, total spent, monthly leftover, carry-over
3. **Category breakdown** — how much spent per category vs. remaining
4. **Basic expenses progress** — paid vs. unpaid visual indicator
5. **Account balances** — all accounts with current balances
6. **Counter of shame** — visible on dashboard
7. **Recent activity** — last 5-10 transactions across all categories
8. **Month-over-month comparison** — basic comparison with previous month (spent more/less)

## Acceptance Criteria

- [ ] Dashboard loads with all financial summary data
- [ ] The Big Number is the most prominent element
- [ ] Category spending breakdown visible
- [ ] Basic expenses show paid/unpaid progress
- [ ] All account balances displayed
- [ ] Counter of shame visible
- [ ] Recent transactions listed
- [ ] Previous month comparison shown
- [ ] Page is responsive and performant
- [ ] All data is real-time accurate

## Notes

- This is the "home page" of the finance module
- No complex charts in initial implementation — use simple numbers, progress bars, and cards
- Charts/graphs can be added as a future enhancement
- Should load fast — use cached/computed values from monthly_summaries
- This page ties together everything from phases 2-9
