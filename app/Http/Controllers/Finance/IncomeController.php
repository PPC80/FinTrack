<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreIncomeEntryRequest;
use App\Http\Requests\Finance\UpdateIncomeEntryRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\IncomeEntryResource;
use App\Models\Account;
use App\Models\IncomeEntry;
use App\Services\Finance\BudgetCalculationService;
use App\Services\Finance\IncomeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function __construct(
        private readonly IncomeService $incomeService,
        private readonly BudgetCalculationService $budgetService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        $entries = $this->incomeService->getEntriesForPeriod($period);
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();
        $budgetSummary = $this->budgetService->computeForPeriod($period);

        return Inertia::render('Finance/Income/Index', [
            'entries' => IncomeEntryResource::collection($entries),
            'accounts' => AccountResource::collection($accounts),
            'budgetSummary' => $budgetSummary,
            'currentPeriod' => $period,
        ]);
    }

    public function store(StoreIncomeEntryRequest $request): RedirectResponse
    {
        $period = $request->query('period', now()->format('Y-m'));

        $this->incomeService->store([
            ...$request->validated(),
            'period' => $period,
        ]);

        return redirect()->route('income.index', ['period' => $period])
            ->with('success', 'Income entry added successfully.');
    }

    public function update(UpdateIncomeEntryRequest $request, IncomeEntry $incomeEntry): RedirectResponse
    {
        $this->incomeService->update($incomeEntry, $request->validated());

        return redirect()->back()
            ->with('success', 'Income entry updated successfully.');
    }

    public function destroy(IncomeEntry $incomeEntry): RedirectResponse
    {
        $this->incomeService->destroy($incomeEntry);

        return redirect()->back()
            ->with('success', 'Income entry deleted successfully.');
    }
}
