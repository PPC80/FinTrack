<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use Illuminate\Support\Facades\DB;

class MetroCardService
{
    public function topUp(float $amount, Account $paymentSource, ?string $description = null): void
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Top-up amount must be positive.');
        }

        DB::transaction(function () use ($amount, $paymentSource, $description) {
            $metroCard = Account::where('type', 'metro_card')->firstOrFail();
            $period = now()->format('Y-m');
            $topUpDescription = $description ?? 'Metro card top-up';

            AccountTransaction::create([
                'account_id' => $metroCard->id,
                'amount' => $amount,
                'description' => $topUpDescription,
                'type' => 'top_up',
                'period' => $period,
            ]);

            $metroCard->increment('balance', $amount);

            AccountTransaction::create([
                'account_id' => $paymentSource->id,
                'amount' => -$amount,
                'description' => $topUpDescription,
                'type' => 'expense',
                'period' => $period,
            ]);

            $paymentSource->decrement('balance', $amount);
        });
    }
}
