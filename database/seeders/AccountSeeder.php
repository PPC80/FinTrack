<?php

namespace Database\Seeders;

use App\Models\Account;
use Illuminate\Database\Seeder;

class AccountSeeder extends Seeder
{
    public function run(): void
    {
        if (! Account::where('type', 'cash')->exists()) {
            Account::create([
                'name' => 'Cash',
                'type' => 'cash',
                'balance' => 0,
                'is_default' => true,
            ]);
        }

        if (! Account::where('type', 'metro_card')->exists()) {
            Account::create([
                'name' => 'Metro Card',
                'type' => 'metro_card',
                'balance' => 0,
                'is_default' => false,
            ]);
        }
    }
}
