<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\IncomeEntry;
use Illuminate\Database\Eloquent\Factories\Factory;

class IncomeEntryFactory extends Factory
{
    protected $model = IncomeEntry::class;

    public function definition(): array
    {
        return [
            'source' => fake()->words(2, true),
            'amount' => fake()->randomFloat(2, 100, 5000),
            'account_id' => Account::factory(),
            'period' => now()->format('Y-m'),
            'received_at' => now(),
        ];
    }
}
