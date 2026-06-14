<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\IncomeEntry;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class IncomeService
{
    public function getEntriesForPeriod(string $period): Collection
    {
        return IncomeEntry::with('account')
            ->forPeriod($period)
            ->orderBy('received_at', 'desc')
            ->get();
    }

    public function store(array $data): IncomeEntry
    {
        $account = Account::findOrFail($data['account_id']);

        return DB::transaction(function () use ($data, $account) {
            $entry = IncomeEntry::create([
                'source' => $data['source'],
                'amount' => $data['amount'],
                'account_id' => $account->id,
                'period' => $data['period'],
                'received_at' => $data['received_at'],
            ]);

            $account->increment('balance', abs((float) $data['amount']));

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs((float) $data['amount']),
                'description' => "Income: {$data['source']}",
                'type' => 'income',
                'period' => $data['period'],
            ]);

            return $entry->load('account');
        });
    }

    public function update(IncomeEntry $entry, array $data): IncomeEntry
    {
        $oldAccount = Account::findOrFail($entry->account_id);
        $newAccount = Account::findOrFail($data['account_id']);
        $oldAmount = (float) $entry->amount;
        $newAmount = (float) $data['amount'];

        return DB::transaction(function () use ($entry, $data, $oldAccount, $newAccount, $oldAmount, $newAmount) {
            $oldAccount->decrement('balance', $oldAmount);

            AccountTransaction::create([
                'account_id' => $oldAccount->id,
                'amount' => -$oldAmount,
                'description' => "Reverted income: {$entry->source}",
                'type' => 'income',
                'period' => $entry->period,
            ]);

            $newAccount->increment('balance', $newAmount);

            AccountTransaction::create([
                'account_id' => $newAccount->id,
                'amount' => $newAmount,
                'description' => "Income: {$data['source']}",
                'type' => 'income',
                'period' => $entry->period,
            ]);

            $entry->update([
                'source' => $data['source'],
                'amount' => $newAmount,
                'account_id' => $newAccount->id,
                'received_at' => $data['received_at'],
            ]);

            return $entry->fresh()->load('account');
        });
    }

    public function destroy(IncomeEntry $entry): void
    {
        $account = Account::findOrFail($entry->account_id);

        DB::transaction(function () use ($entry, $account) {
            $account->decrement('balance', abs((float) $entry->amount));

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs((float) $entry->amount),
                'description' => "Deleted income: {$entry->source}",
                'type' => 'income',
                'period' => $entry->period,
            ]);

            $entry->delete();
        });
    }

    public function getTotalForPeriod(string $period): float
    {
        return (float) IncomeEntry::forPeriod($period)->sum('amount');
    }
}
