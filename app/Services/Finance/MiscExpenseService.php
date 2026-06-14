<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\MiscExpense;
use App\Models\TransportMode;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MiscExpenseService
{
    public function getExpensesForPeriod(string $period): Collection
    {
        return MiscExpense::forPeriod($period)
            ->with('account')
            ->orderByDesc('spent_at')
            ->get();
    }

    public function createExpense(
        string $description,
        float $amount,
        bool $isGuilty,
        Account $account,
    ): MiscExpense {
        $period = now()->format('Y-m');

        return DB::transaction(function () use ($description, $amount, $isGuilty, $account, $period) {
            $expense = MiscExpense::create([
                'description' => $description,
                'amount' => $amount,
                'is_guilty' => $isGuilty,
                'account_id' => $account->id,
                'period' => $period,
                'spent_at' => now(),
            ]);

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs($amount),
                'description' => "Misc: {$description}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $account->decrement('balance', abs($amount));

            return $expense->fresh()->load('account');
        });
    }

    public function deleteExpense(MiscExpense $expense): void
    {
        DB::transaction(function () use ($expense) {
            $account = $expense->account;

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs((float) $expense->amount),
                'description' => "Reverted misc: {$expense->description}",
                'type' => 'adjustment',
                'period' => $expense->period,
            ]);

            $account->increment('balance', abs((float) $expense->amount));

            $expense->delete();
        });
    }

    public function getShameSummary(string $period): array
    {
        $guiltyTotal = (float) MiscExpense::forPeriod($period)
            ->guilty()
            ->sum('amount');

        $taxiModeIds = TransportMode::where('is_taxi', true)->pluck('id');

        $taxiTotal = $taxiModeIds->isNotEmpty()
            ? (float) Trip::forPeriod($period)
                ->whereIn('transport_mode_id', $taxiModeIds)
                ->sum('fare_at_time')
            : 0.0;

        $totalSpent = (float) MiscExpense::forPeriod($period)->sum('amount');
        $expenseCount = MiscExpense::forPeriod($period)->count();
        $guiltyCount = MiscExpense::forPeriod($period)->guilty()->count();

        return [
            'total_spent' => $totalSpent,
            'expense_count' => $expenseCount,
            'guilty_total' => $guiltyTotal,
            'guilty_count' => $guiltyCount,
            'taxi_total' => $taxiTotal,
        ];
    }
}
