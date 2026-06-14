<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\AccountTransfer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class AccountTransferService
{
    public function getTransfersForPeriod(string $period): Collection
    {
        return AccountTransfer::forPeriod($period)
            ->with(['sourceAccount', 'destinationAccount'])
            ->orderByDesc('transferred_at')
            ->get();
    }

    public function createTransfer(
        Account $sourceAccount,
        Account $destinationAccount,
        float $amount,
        string $transferType,
        ?string $description = null,
    ): AccountTransfer {
        $commission = $this->calculateCommission($sourceAccount, $transferType);
        $totalDeducted = $amount + $commission;
        $period = now()->format('Y-m');

        return DB::transaction(function () use (
            $sourceAccount,
            $destinationAccount,
            $amount,
            $commission,
            $totalDeducted,
            $transferType,
            $description,
            $period,
        ) {
            $transfer = AccountTransfer::create([
                'source_account_id' => $sourceAccount->id,
                'destination_account_id' => $destinationAccount->id,
                'amount' => $amount,
                'commission_amount' => $commission,
                'transfer_type' => $transferType,
                'description' => $description,
                'period' => $period,
                'transferred_at' => now(),
            ]);

            $transferLabel = $this->getTransferTypeLabel($transferType);
            $commissionNote = $commission > 0 ? " (fee: \${$commission})" : '';

            AccountTransaction::create([
                'account_id' => $sourceAccount->id,
                'amount' => -abs($totalDeducted),
                'description' => "{$transferLabel} to {$destinationAccount->name}{$commissionNote}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $sourceAccount->decrement('balance', abs($totalDeducted));

            AccountTransaction::create([
                'account_id' => $destinationAccount->id,
                'amount' => abs($amount),
                'description' => "{$transferLabel} from {$sourceAccount->name}",
                'type' => 'income',
                'period' => $period,
            ]);

            $destinationAccount->increment('balance', abs($amount));

            return $transfer->fresh()->load(['sourceAccount', 'destinationAccount']);
        });
    }

    public function deleteTransfer(AccountTransfer $transfer): void
    {
        DB::transaction(function () use ($transfer) {
            $sourceAccount = $transfer->sourceAccount;
            $destinationAccount = $transfer->destinationAccount;
            $totalDeducted = (float) $transfer->amount + (float) $transfer->commission_amount;

            AccountTransaction::create([
                'account_id' => $sourceAccount->id,
                'amount' => abs($totalDeducted),
                'description' => "Reverted transfer to {$destinationAccount->name}",
                'type' => 'adjustment',
                'period' => $transfer->period,
            ]);

            $sourceAccount->increment('balance', abs($totalDeducted));

            AccountTransaction::create([
                'account_id' => $destinationAccount->id,
                'amount' => -abs((float) $transfer->amount),
                'description' => "Reverted transfer from {$sourceAccount->name}",
                'type' => 'adjustment',
                'period' => $transfer->period,
            ]);

            $destinationAccount->decrement('balance', abs((float) $transfer->amount));

            $transfer->delete();
        });
    }

    public function calculateCommission(Account $sourceAccount, string $transferType): float
    {
        return match ($transferType) {
            'cross_bank_transfer' => (float) ($sourceAccount->cross_bank_transfer_fee ?? 0),
            'other_bank_atm' => (float) ($sourceAccount->withdrawal_atm_fee ?? 0),
            'store_withdrawal' => (float) ($sourceAccount->withdrawal_store_fee ?? 0),
            'same_bank_atm' => 0.0,
            default => 0.0,
        };
    }

    private function getTransferTypeLabel(string $transferType): string
    {
        return match ($transferType) {
            'cross_bank_transfer' => 'Transfer',
            'other_bank_atm' => 'ATM Withdrawal',
            'store_withdrawal' => 'Store Withdrawal',
            'same_bank_atm' => 'ATM Withdrawal (same bank)',
            default => 'Transfer',
        };
    }
}
