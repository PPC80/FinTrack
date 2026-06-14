<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\MiscExpense;
use Illuminate\Database\Eloquent\Factories\Factory;

class MiscExpenseFactory extends Factory
{
    protected $model = MiscExpense::class;

    public function definition(): array
    {
        return [
            'description' => fake()->sentence(3),
            'amount' => fake()->randomFloat(2, 5, 200),
            'is_guilty' => false,
            'account_id' => Account::factory(),
            'period' => now()->format('Y-m'),
            'spent_at' => now(),
        ];
    }
}
