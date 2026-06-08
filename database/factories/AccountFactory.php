<?php

namespace Database\Factories;

use App\Models\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Account>
 */
class AccountFactory extends Factory
{
    protected $model = Account::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'type' => 'bank',
            'balance' => fake()->randomFloat(2, 0, 10000),
            'is_default' => false,
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Cash',
            'type' => 'cash',
        ]);
    }

    public function metroCard(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Metro Card',
            'type' => 'metro_card',
        ]);
    }

    public function asDefault(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_default' => true,
        ]);
    }
}
