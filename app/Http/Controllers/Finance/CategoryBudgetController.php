<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\CategoryPeriodBudget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CategoryBudgetController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id' => ['required', 'integer', 'exists:expense_categories,id'],
            'period' => ['required', 'string', 'regex:/^\d{4}-\d{2}$/'],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
        ]);

        CategoryPeriodBudget::updateOrCreate(
            [
                'category_id' => $validated['category_id'],
                'period' => $validated['period'],
            ],
            [
                'amount' => $validated['amount'],
            ],
        );

        return redirect()->back()
            ->with('success', 'Budget updated.');
    }
}
