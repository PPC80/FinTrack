<?php

namespace App\Services\Finance;

use App\Models\PredictedIncome;
use Illuminate\Database\Eloquent\Collection;

class PredictedIncomeService
{
    public function getAll(): Collection
    {
        return PredictedIncome::orderByRaw('is_received ASC, expected_date ASC NULLS LAST, created_at DESC')
            ->get();
    }

    public function store(array $data): PredictedIncome
    {
        return PredictedIncome::create([
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expected_date' => $data['expected_date'] ?? null,
        ]);
    }

    public function update(PredictedIncome $predictedIncome, array $data): PredictedIncome
    {
        $predictedIncome->update([
            'description' => $data['description'],
            'amount' => $data['amount'],
            'expected_date' => $data['expected_date'] ?? null,
        ]);

        return $predictedIncome->fresh();
    }

    public function toggleReceived(PredictedIncome $predictedIncome): PredictedIncome
    {
        $predictedIncome->update([
            'is_received' => ! $predictedIncome->is_received,
        ]);

        return $predictedIncome->fresh();
    }

    public function destroy(PredictedIncome $predictedIncome): void
    {
        $predictedIncome->delete();
    }

    public function getTotalPending(): float
    {
        return (float) PredictedIncome::pending()->sum('amount');
    }

    public function getTotalReceived(): float
    {
        return (float) PredictedIncome::received()->sum('amount');
    }
}
