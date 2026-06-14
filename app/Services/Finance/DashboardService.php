<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\BasicExpense;
use App\Models\IncomeEntry;
use App\Models\MiscExpense;
use App\Models\Purchase;
use App\Models\Trip;

class DashboardService
{
    public function __construct(
        private readonly BudgetCalculationService $budgetService,
    ) {}

    public function getFullDashboardData(string $period): array
    {
        return [
            'budgetSummary' => $this->budgetService->computeForPeriod($period),
            'accounts' => $this->getAccountBalances(),
            'basicExpensesProgress' => $this->getBasicExpensesProgress($period),
            'shameSummary' => $this->getShameSummary($period),
            'recentActivity' => $this->getRecentActivity($period),
            'monthComparison' => $this->getMonthComparison($period),
            'currentPeriod' => $period,
            'monthlySummaries' => $this->budgetService->getMonthlySummaries(),
        ];
    }

    public function getAccountBalances(): array
    {
        return Account::orderByRaw("
            CASE type
                WHEN 'bank' THEN 1
                WHEN 'cash' THEN 2
                WHEN 'metro_card' THEN 3
            END
        ")
            ->orderBy('name')
            ->get()
            ->map(fn (Account $account) => [
                'id' => $account->id,
                'name' => $account->name,
                'type' => $account->type,
                'balance' => (float) $account->balance,
            ])
            ->values()
            ->toArray();
    }

    public function getBasicExpensesProgress(string $period): array
    {
        $expenses = BasicExpense::where('period', $period)->get();

        $totalCount = $expenses->count();
        $paidCount = $expenses->where('is_paid', true)->count();
        $totalAmount = (float) $expenses->sum('amount');
        $paidAmount = (float) $expenses->where('is_paid', true)->sum('amount');

        return [
            'total_count' => $totalCount,
            'paid_count' => $paidCount,
            'total_amount' => $totalAmount,
            'paid_amount' => $paidAmount,
            'percentage' => $totalAmount > 0
                ? round(($paidAmount / $totalAmount) * 100, 1)
                : 0.0,
        ];
    }

    public function getShameSummary(string $period): array
    {
        $guiltyTotal = (float) MiscExpense::where('period', $period)
            ->where('is_guilty', true)
            ->sum('amount');

        $guiltyCount = MiscExpense::where('period', $period)
            ->where('is_guilty', true)
            ->count();

        $taxiTotal = (float) MiscExpense::where('period', $period)
            ->where('is_taxi', true)
            ->sum('amount');

        return [
            'guilty_total' => $guiltyTotal,
            'guilty_count' => $guiltyCount,
            'taxi_total' => $taxiTotal,
        ];
    }

    public function getRecentActivity(string $period): array
    {
        $activities = collect();

        $incomeEntries = IncomeEntry::with('account')
            ->where('period', $period)
            ->get()
            ->map(fn (IncomeEntry $entry) => [
                'id' => "income-{$entry->id}",
                'type' => 'income',
                'description' => $entry->source,
                'amount' => (float) $entry->amount,
                'date' => $entry->received_at->toISOString(),
                'account_name' => $entry->account?->name,
            ]);

        $activities = $activities->merge($incomeEntries);

        $paidExpenses = BasicExpense::with('category')
            ->where('period', $period)
            ->where('is_paid', true)
            ->whereNotNull('paid_at')
            ->get()
            ->map(fn (BasicExpense $expense) => [
                'id' => "basic-expense-{$expense->id}",
                'type' => 'basic_expense',
                'description' => $expense->name,
                'amount' => (float) $expense->amount,
                'date' => $expense->paid_at->toISOString(),
                'account_name' => null,
            ]);

        $activities = $activities->merge($paidExpenses);

        $purchases = Purchase::with('catalogItem')
            ->where('period', $period)
            ->get()
            ->map(fn (Purchase $purchase) => [
                'id' => "purchase-{$purchase->id}",
                'type' => 'purchase',
                'description' => $purchase->catalogItem?->name ?? 'Purchase',
                'amount' => (float) $purchase->total,
                'date' => $purchase->purchased_at->toISOString(),
                'account_name' => null,
            ]);

        $activities = $activities->merge($purchases);

        $miscExpenses = MiscExpense::where('period', $period)
            ->get()
            ->map(fn (MiscExpense $expense) => [
                'id' => "misc-{$expense->id}",
                'type' => 'misc_expense',
                'description' => $expense->description,
                'amount' => (float) $expense->amount,
                'date' => $expense->spent_at->toISOString(),
                'account_name' => null,
            ]);

        $activities = $activities->merge($miscExpenses);

        $trips = Trip::with('transportMode')
            ->where('period', $period)
            ->get()
            ->map(fn (Trip $trip) => [
                'id' => "trip-{$trip->id}",
                'type' => 'trip',
                'description' => $trip->transportMode?->name ?? 'Trip',
                'amount' => (float) $trip->fare_at_time,
                'date' => $trip->taken_at->toISOString(),
                'account_name' => null,
            ]);

        $activities = $activities->merge($trips);

        return $activities
            ->sortByDesc('date')
            ->take(10)
            ->values()
            ->toArray();
    }

    public function getMonthComparison(string $period): array
    {
        $currentSpent = $this->budgetService->getTotalSpent($period);
        $previousPeriod = $this->getPreviousPeriod($period);
        $previousSpent = $this->budgetService->getTotalSpent($previousPeriod);

        $difference = $currentSpent - $previousSpent;

        return [
            'current_spent' => $currentSpent,
            'previous_spent' => $previousSpent,
            'difference' => abs($difference),
            'direction' => $difference >= 0 ? 'more' : 'less',
            'previous_period' => $previousPeriod,
        ];
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
