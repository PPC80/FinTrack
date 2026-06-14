<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\MiscExpense;
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
        bool $isTaxi,
        bool $isBankTransfer,
        bool $isInternational,
        Account $account,
    ): MiscExpense {
        $period = now()->format('Y-m');
        $commission = $this->calculateCommission($account, $amount, $isBankTransfer, $isInternational);
        $totalDeducted = $amount + $commission;

        return DB::transaction(function () use ($description, $amount, $isGuilty, $isTaxi, $isBankTransfer, $isInternational, $commission, $totalDeducted, $account, $period) {
            $expense = MiscExpense::create([
                'description' => $description,
                'amount' => $amount,
                'is_guilty' => $isGuilty,
                'is_taxi' => $isTaxi,
                'is_bank_transfer' => $isBankTransfer,
                'is_international' => $isInternational,
                'commission_amount' => $commission,
                'account_id' => $account->id,
                'period' => $period,
                'spent_at' => now(),
            ]);

            $commissionNote = $commission > 0 ? " (fee: \${$commission})" : '';
            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs($totalDeducted),
                'description' => "Misc: {$description}{$commissionNote}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $account->decrement('balance', abs($totalDeducted));

            return $expense->fresh()->load('account');
        });
    }

    public function updateExpense(
        MiscExpense $expense,
        string $description,
        float $amount,
        bool $isGuilty,
        bool $isTaxi,
        bool $isBankTransfer,
        bool $isInternational,
        Account $account,
    ): MiscExpense {
        return DB::transaction(function () use ($expense, $description, $amount, $isGuilty, $isTaxi, $isBankTransfer, $isInternational, $account) {
            $oldAccount = $expense->account;
            $oldTotalDeducted = (float) $expense->amount + (float) $expense->commission_amount;

            AccountTransaction::create([
                'account_id' => $oldAccount->id,
                'amount' => abs($oldTotalDeducted),
                'description' => "Reverted misc: {$expense->description}",
                'type' => 'adjustment',
                'period' => $expense->period,
            ]);
            $oldAccount->increment('balance', abs($oldTotalDeducted));

            $commission = $this->calculateCommission($account, $amount, $isBankTransfer, $isInternational);
            $newTotalDeducted = $amount + $commission;

            $expense->update([
                'description' => $description,
                'amount' => $amount,
                'is_guilty' => $isGuilty,
                'is_taxi' => $isTaxi,
                'is_bank_transfer' => $isBankTransfer,
                'is_international' => $isInternational,
                'commission_amount' => $commission,
                'account_id' => $account->id,
            ]);

            $commissionNote = $commission > 0 ? " (fee: \${$commission})" : '';
            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs($newTotalDeducted),
                'description' => "Misc: {$description}{$commissionNote}",
                'type' => 'expense',
                'period' => $expense->period,
            ]);
            $account->decrement('balance', abs($newTotalDeducted));

            return $expense->fresh()->load('account');
        });
    }

    public function deleteExpense(MiscExpense $expense): void
    {
        DB::transaction(function () use ($expense) {
            $account = $expense->account;
            $totalDeducted = (float) $expense->amount + (float) $expense->commission_amount;

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs($totalDeducted),
                'description' => "Reverted misc: {$expense->description}",
                'type' => 'adjustment',
                'period' => $expense->period,
            ]);

            $account->increment('balance', abs($totalDeducted));

            $expense->delete();
        });
    }

    private function calculateCommission(Account $account, float $amount, bool $isBankTransfer, bool $isInternational): float
    {
        $commission = 0.0;

        if ($isBankTransfer) {
            $commission += (float) ($account->cross_bank_transfer_fee ?? 0);
        }

        if ($isInternational) {
            $ivaRate = (float) ($account->international_iva_rate ?? 0);
            $isdRate = (float) ($account->isd_rate ?? 0);
            $commission += $amount * ($ivaRate / 100);
            $commission += $amount * ($isdRate / 100);
        }

        return round($commission, 2);
    }

    public function getShameSummary(string $period): array
    {
        $guiltyTotal = (float) MiscExpense::forPeriod($period)
            ->guilty()
            ->sum('amount');

        $taxiTotal = (float) MiscExpense::forPeriod($period)
            ->where('is_taxi', true)
            ->sum('amount');

        $totalSpent = (float) MiscExpense::forPeriod($period)->sum('amount');
        $expenseCount = MiscExpense::forPeriod($period)->count();
        $guiltyCount = MiscExpense::forPeriod($period)->guilty()->count();
        $taxiCount = MiscExpense::forPeriod($period)->where('is_taxi', true)->count();

        return [
            'total_spent' => $totalSpent,
            'expense_count' => $expenseCount,
            'guilty_total' => $guiltyTotal,
            'guilty_count' => $guiltyCount,
            'taxi_total' => $taxiTotal,
            'taxi_count' => $taxiCount,
        ];
    }
}
