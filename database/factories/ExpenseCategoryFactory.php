<?php

namespace Database\Factories;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class ExpenseCategoryFactory extends Factory
{
    protected $model = ExpenseCategory::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'type' => 'fixed',
            'default_account_id' => null,
            'monthly_budget' => null,
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
