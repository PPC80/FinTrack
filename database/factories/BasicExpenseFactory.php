<?php

namespace Database\Factories;

use App\Models\BasicExpense;
use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class BasicExpenseFactory extends Factory
{
    protected $model = BasicExpense::class;

    public function definition(): array
    {
        return [
            'category_id' => ExpenseCategory::factory(),
            'template_id' => null,
            'name' => fake()->words(3, true),
            'amount' => fake()->randomFloat(2, 10, 500),
            'is_paid' => false,
            'paid_at' => null,
            'account_id' => null,
            'period' => now()->format('Y-m'),
        ];
    }
}
