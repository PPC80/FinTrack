<?php

namespace Database\Factories;

use App\Models\Account;
use App\Models\TransportMode;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        return [
            'transport_mode_id' => TransportMode::factory(),
            'fare_at_time' => fake()->randomFloat(2, 1, 50),
            'account_id' => Account::factory(),
            'period' => now()->format('Y-m'),
            'taken_at' => now(),
        ];
    }
}
