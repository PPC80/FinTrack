<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseCategoryRequest;
use App\Http\Requests\Finance\UpdateExpenseCategoryRequest;
use App\Models\ExpenseCategory;
use App\Services\Finance\ExpenseCategoryService;
use Illuminate\Http\RedirectResponse;

class ExpenseCategoryController extends Controller
{
    public function __construct(
        private readonly ExpenseCategoryService $categoryService,
    ) {}

    public function store(StoreExpenseCategoryRequest $request): RedirectResponse
    {
        $this->categoryService->create($request->validated());

        $period = $request->query('period');

        return redirect()->route('expenses.index', $period ? ['period' => $period] : [])
            ->with('success', 'Category created successfully.');
    }

    public function update(UpdateExpenseCategoryRequest $request, ExpenseCategory $category): RedirectResponse
    {
        $this->categoryService->update($category, $request->validated());

        $period = $request->query('period');

        return redirect()->route('expenses.index', $period ? ['period' => $period] : [])
            ->with('success', 'Category updated successfully.');
    }

    public function destroy(ExpenseCategory $category): RedirectResponse
    {
        $this->categoryService->delete($category);

        $period = request()->query('period');

        return redirect()->route('expenses.index', $period ? ['period' => $period] : [])
            ->with('success', 'Category deleted successfully.');
    }
}
