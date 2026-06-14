<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreMiscExpenseRequest;
use App\Http\Requests\Finance\UpdateMiscExpenseRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\MiscExpenseResource;
use App\Models\Account;
use App\Models\MiscExpense;
use App\Services\Finance\MiscExpenseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MiscExpenseController extends Controller
{
    public function __construct(
        private readonly MiscExpenseService $miscExpenseService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        $expenses = $this->miscExpenseService->getExpensesForPeriod($period);
        $shameSummary = $this->miscExpenseService->getShameSummary($period);
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();

        return Inertia::render('Finance/MiscExpenses/Index', [
            'expenses' => MiscExpenseResource::collection($expenses),
            'shameSummary' => $shameSummary,
            'accounts' => AccountResource::collection($accounts),
            'currentPeriod' => $period,
        ]);
    }

    public function store(StoreMiscExpenseRequest $request): RedirectResponse
    {
        $account = Account::findOrFail($request->validated('account_id'));

        $this->miscExpenseService->createExpense(
            description: $request->validated('description'),
            amount: (float) $request->validated('amount'),
            isGuilty: (bool) $request->validated('is_guilty', false),
            isTaxi: (bool) $request->validated('is_taxi', false),
            isBankTransfer: (bool) $request->validated('is_bank_transfer', false),
            isInternational: (bool) $request->validated('is_international', false),
            account: $account,
        );

        return redirect()->back()
            ->with('success', 'Misc expense logged.');
    }

    public function update(UpdateMiscExpenseRequest $request, MiscExpense $miscExpense): RedirectResponse
    {
        $account = Account::findOrFail($request->validated('account_id'));

        $this->miscExpenseService->updateExpense(
            expense: $miscExpense,
            description: $request->validated('description'),
            amount: (float) $request->validated('amount'),
            isGuilty: (bool) $request->validated('is_guilty', false),
            isTaxi: (bool) $request->validated('is_taxi', false),
            isBankTransfer: (bool) $request->validated('is_bank_transfer', false),
            isInternational: (bool) $request->validated('is_international', false),
            account: $account,
        );

        return redirect()->back()
            ->with('success', 'Misc expense updated.');
    }

    public function destroy(MiscExpense $miscExpense): RedirectResponse
    {
        $this->miscExpenseService->deleteExpense($miscExpense);

        return redirect()->back()
            ->with('success', 'Misc expense removed and balance restored.');
    }
}
