<?php

namespace Database\Factories;

use App\Models\TransportMode;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransportModeFactory extends Factory
{
    protected $model = TransportMode::class;

    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'fare' => fake()->randomFloat(2, 1, 50),
            'deducts_from_metro' => false,
            'default_account_id' => null,
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
            'is_taxi' => false,
        ];
    }
}
