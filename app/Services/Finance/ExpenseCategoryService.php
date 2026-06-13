<?php

namespace App\Services\Finance;

use App\Models\ExpenseCategory;
use Illuminate\Database\Eloquent\Collection;

class ExpenseCategoryService
{
    public function getAll(): Collection
    {
        return ExpenseCategory::with('defaultAccount')
            ->orderBy('sort_order')
            ->get();
    }

    public function create(array $data): ExpenseCategory
    {
        $maxSortOrder = ExpenseCategory::max('sort_order') ?? 0;

        return ExpenseCategory::create([
            'name' => $data['name'],
            'type' => $data['type'],
            'default_account_id' => $data['default_account_id'] ?? null,
            'sort_order' => $maxSortOrder + 1,
        ]);
    }

    public function update(ExpenseCategory $category, array $data): ExpenseCategory
    {
        $category->update([
            'name' => $data['name'],
            'type' => $data['type'] ?? $category->type,
            'default_account_id' => $data['default_account_id'] ?? $category->default_account_id,
        ]);

        return $category->fresh();
    }

    public function delete(ExpenseCategory $category): void
    {
        $category->delete();
    }
}
