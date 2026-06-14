<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\BasicExpense;
use App\Models\ExpenseCategory;
use App\Models\IncomeEntry;
use App\Models\MiscExpense;
use App\Models\MonthlySummary;
use App\Models\PlannedItem;
use App\Models\Purchase;
use App\Models\Trip;

class BudgetCalculationService
{
    public function computeForPeriod(string $period): array
    {
        $totalIncome = $this->getTotalIncome($period);
        $carryOver = $this->getCarryOverFromPrevious($period);
        $totalObligations = $this->getTotalObligations($period);
        $totalSpent = $this->getTotalSpent($period);
        $accountBalances = $this->getAccountBalances();
        $theBigNumber = $accountBalances - $totalObligations;
        $monthlyLeftover = ($totalIncome + $carryOver) - $totalSpent;

        $this->updateSummaryCache($period, $totalIncome, $totalSpent, $monthlyLeftover, $carryOver);

        return [
            'total_income' => $totalIncome,
            'carry_over' => $carryOver,
            'effective_income' => $totalIncome + $carryOver,
            'total_obligations' => $totalObligations,
            'total_spent' => $totalSpent,
            'account_balances' => $accountBalances,
            'the_big_number' => $theBigNumber,
            'monthly_leftover' => $monthlyLeftover,
            'obligations_breakdown' => $this->getObligationsBreakdown($period),
            'spending_breakdown' => $this->getSpendingBreakdown($period),
            'category_budgets' => $this->getCategoryBudgetStatus($period),
        ];
    }

    public function getTheBigNumber(): float
    {
        $period = now()->format('Y-m');
        $accountBalances = $this->getAccountBalances();
        $totalObligations = $this->getTotalObligations($period);

        return $accountBalances - $totalObligations;
    }

    public function getAvailablePeriods(): array
    {
        $periods = collect();

        $periods = $periods->merge(IncomeEntry::distinct()->pluck('period'));
        $periods = $periods->merge(BasicExpense::distinct()->pluck('period'));
        $periods = $periods->merge(Purchase::distinct()->pluck('period'));
        $periods = $periods->merge(MiscExpense::distinct()->pluck('period'));
        $periods = $periods->merge(Trip::distinct()->pluck('period'));

        $currentPeriod = now()->format('Y-m');
        $periods->push($currentPeriod);

        return $periods->unique()->sort()->reverse()->values()->toArray();
    }

    public function getMonthlySummaries(): array
    {
        $periods = $this->getAvailablePeriods();

        return collect($periods)->map(function (string $period) {
            $summary = MonthlySummary::where('period', $period)->first();

            if ($summary) {
                return [
                    'period' => $period,
                    'total_income' => (float) $summary->total_income,
                    'total_spent' => (float) $summary->total_spent,
                    'leftover' => (float) $summary->leftover,
                    'carry_over_from_previous' => (float) $summary->carry_over_from_previous,
                ];
            }

            $totalIncome = $this->getTotalIncome($period);
            $totalSpent = $this->getTotalSpent($period);
            $leftover = $totalIncome - $totalSpent;

            return [
                'period' => $period,
                'total_income' => $totalIncome,
                'total_spent' => $totalSpent,
                'leftover' => $leftover,
                'carry_over_from_previous' => $this->getCarryOverFromPrevious($period),
            ];
        })->values()->toArray();
    }

    public function getTotalIncome(string $period): float
    {
        return (float) IncomeEntry::where('period', $period)->sum('amount');
    }

    public function getCarryOverFromPrevious(string $period): float
    {
        $previousPeriod = $this->getPreviousPeriod($period);

        $summary = MonthlySummary::where('period', $previousPeriod)->first();

        if ($summary) {
            return (float) $summary->leftover;
        }

        $previousIncome = (float) IncomeEntry::where('period', $previousPeriod)->sum('amount');

        if ($previousIncome === 0.0) {
            return 0.0;
        }

        $previousSpent = $this->getTotalSpent($previousPeriod);

        return $previousIncome - $previousSpent;
    }

    public function getTotalObligations(string $period): float
    {
        $unpaidBasicExpenses = $this->getUnpaidBasicExpenses($period);
        $remainingCategoryBudgets = $this->getRemainingCategoryBudgets($period);
        $unpaidPlannedItems = $this->getUnpaidPlannedItemsTotal($period);

        return $unpaidBasicExpenses + $remainingCategoryBudgets + $unpaidPlannedItems;
    }

    public function getTotalSpent(string $period): float
    {
        $paidBasicExpenses = (float) BasicExpense::where('period', $period)
            ->where('is_paid', true)
            ->sum('amount');

        $purchases = (float) Purchase::where('period', $period)->sum('total');

        $miscExpenses = (float) MiscExpense::where('period', $period)->sum('amount');

        $trips = (float) Trip::where('period', $period)->sum('fare_at_time');

        return $paidBasicExpenses + $purchases + $miscExpenses + $trips;
    }

    public function getAccountBalances(): float
    {
        return (float) Account::whereIn('type', ['bank', 'cash'])->sum('balance');
    }

    public function getObligationsBreakdown(string $period): array
    {
        return [
            'unpaid_basic_expenses' => $this->getUnpaidBasicExpenses($period),
            'remaining_category_budgets' => $this->getRemainingCategoryBudgets($period),
            'unpaid_planned_items' => $this->getUnpaidPlannedItemsTotal($period),
        ];
    }

    public function getSpendingBreakdown(string $period): array
    {
        return [
            'basic_expenses' => (float) BasicExpense::where('period', $period)
                ->where('is_paid', true)
                ->sum('amount'),
            'purchases' => (float) Purchase::where('period', $period)->sum('total'),
            'misc_expenses' => (float) MiscExpense::where('period', $period)->sum('amount'),
            'transportation' => (float) Trip::where('period', $period)->sum('fare_at_time'),
        ];
    }

    public function getCategoryBudgetStatus(string $period): array
    {
        $categories = ExpenseCategory::where('type', 'item_based')
            ->whereNotNull('monthly_budget')
            ->where('monthly_budget', '>', 0)
            ->get();

        return $categories->map(function (ExpenseCategory $category) use ($period) {
            $spent = (float) Purchase::where('period', $period)
                ->where('category_id', $category->id)
                ->sum('total');

            $budget = (float) $category->monthly_budget;
            $remaining = (float) max(0, $budget - $spent);

            return [
                'id' => $category->id,
                'name' => $category->name,
                'budget' => $budget,
                'spent' => $spent,
                'remaining' => $remaining,
                'percentage_used' => $budget > 0 ? min(100.0, round(($spent / $budget) * 100, 1)) : 0.0,
            ];
        })->values()->toArray();
    }

    private function getUnpaidBasicExpenses(string $period): float
    {
        return (float) BasicExpense::where('period', $period)
            ->where('is_paid', false)
            ->sum('amount');
    }

    private function getRemainingCategoryBudgets(string $period): float
    {
        $categories = ExpenseCategory::where('type', 'item_based')
            ->whereNotNull('monthly_budget')
            ->where('monthly_budget', '>', 0)
            ->get();

        $totalRemaining = 0.0;

        foreach ($categories as $category) {
            $spent = (float) Purchase::where('period', $period)
                ->where('category_id', $category->id)
                ->sum('total');

            $remaining = max(0, (float) $category->monthly_budget - $spent);
            $totalRemaining += $remaining;
        }

        return $totalRemaining;
    }

    private function getUnpaidPlannedItemsTotal(string $period): float
    {
        $plannedItems = PlannedItem::with('catalogItem')
            ->where('period', $period)
            ->where('is_purchased', false)
            ->get();

        $total = 0.0;

        foreach ($plannedItems as $item) {
            if ($item->catalogItem) {
                $calculation = $item->catalogItem->calculateTotal($item->quantity);
                $total += $calculation['total'];
            }
        }

        return $total;
    }

    private function updateSummaryCache(
        string $period,
        float $totalIncome,
        float $totalSpent,
        float $leftover,
        float $carryOver,
    ): void {
        MonthlySummary::updateOrCreate(
            ['period' => $period],
            [
                'total_income' => $totalIncome,
                'total_spent' => $totalSpent,
                'leftover' => $leftover,
                'carry_over_from_previous' => $carryOver,
            ],
        );
    }

    private function getPreviousPeriod(string $period): string
    {
        $year = (int) substr($period, 0, 4);
        $month = (int) substr($period, 5, 2);

        if ($month === 1) {
            return ($year - 1).'-12';
        }

        return $year.'-'.str_pad($month - 1, 2, '0', STR_PAD_LEFT);
    }
}
