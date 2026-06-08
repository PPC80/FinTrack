<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use Illuminate\Support\Facades\DB;

class AccountService
{
    public function createAccount(string $name, float $initialBalance = 0, bool $isDefault = false): Account
    {
        return DB::transaction(function () use ($name, $initialBalance, $isDefault) {
            if ($isDefault) {
                Account::where('is_default', true)->update(['is_default' => false]);
            }

            $account = Account::create([
                'name' => $name,
                'type' => 'bank',
                'balance' => $initialBalance,
                'is_default' => $isDefault,
            ]);

            if ($initialBalance != 0) {
                AccountTransaction::create([
                    'account_id' => $account->id,
                    'amount' => $initialBalance,
                    'description' => 'Initial balance',
                    'type' => 'adjustment',
                    'period' => now()->format('Y-m'),
                ]);
            }

            return $account;
        });
    }

    public function updateAccount(Account $account, string $name, bool $isDefault = false): Account
    {
        return DB::transaction(function () use ($account, $name, $isDefault) {
            if ($isDefault && ! $account->is_default) {
                Account::where('is_default', true)->update(['is_default' => false]);
            }

            $account->update([
                'name' => $name,
                'is_default' => $isDefault,
            ]);

            return $account->fresh();
        });
    }

    public function adjustBalance(Account $account, float $newBalance, ?string $description = null): Account
    {
        return DB::transaction(function () use ($account, $newBalance, $description) {
            $difference = $newBalance - (float) $account->balance;

            if ($difference == 0) {
                return $account;
            }

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => $difference,
                'description' => $description ?? 'Balance adjustment',
                'type' => 'adjustment',
                'period' => now()->format('Y-m'),
            ]);

            $account->update(['balance' => $newBalance]);

            return $account->fresh();
        });
    }

    public function deleteAccount(Account $account): void
    {
        if (! $account->isDeletable()) {
            throw new \InvalidArgumentException('This account cannot be deleted.');
        }

        DB::transaction(function () use ($account) {
            if ($account->is_default) {
                $cashAccount = Account::where('type', 'cash')->first();
                $cashAccount?->update(['is_default' => true]);
            }

            $account->delete();
        });
    }

    public function getTotalBalance(): float
    {
        return (float) Account::whereIn('type', ['bank', 'cash'])->sum('balance');
    }

    public function getMetroBalance(): float
    {
        return (float) Account::where('type', 'metro_card')->value('balance') ?? 0;
    }
}
