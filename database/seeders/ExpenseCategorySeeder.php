<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Basic Expenses', 'type' => 'fixed', 'sort_order' => 1],
            ['name' => 'Food', 'type' => 'item_based', 'sort_order' => 2],
            ['name' => 'Personal Care', 'type' => 'item_based', 'sort_order' => 3],
            ['name' => 'Cat', 'type' => 'item_based', 'sort_order' => 4],
            ['name' => 'Transportation', 'type' => 'trip_based', 'sort_order' => 5],
            ['name' => 'Misc', 'type' => 'misc', 'sort_order' => 6],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::firstOrCreate(
                ['name' => $category['name']],
                $category,
            );
        }
    }
}
