<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\AccountTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AccountTransaction>
 */
class AccountTransactionFactory extends Factory
{
    protected $model = AccountTransaction::class;

    public function definition(): array
    {
        return [
            'account_id' => Account::factory(),
            'amount' => fake()->randomFloat(2, -500, 500),
            'description' => fake()->sentence(3),
            'type' => fake()->randomElement(['top_up', 'expense', 'income', 'adjustment']),
            'period' => now()->format('Y-m'),
        ];
    }
}
