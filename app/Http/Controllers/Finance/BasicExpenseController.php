<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreBasicExpenseTemplateRequest;
use App\Http\Requests\Finance\ToggleBasicExpensePaidRequest;
use App\Http\Requests\Finance\UpdateBasicExpenseAmountRequest;
use App\Http\Requests\Finance\UpdateBasicExpenseTemplateRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\BasicExpenseResource;
use App\Http\Resources\BasicExpenseTemplateResource;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\Account;
use App\Models\BasicExpense;
use App\Models\BasicExpenseTemplate;
use App\Services\Finance\BasicExpenseService;
use App\Services\Finance\ExpenseCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BasicExpenseController extends Controller
{
    public function __construct(
        private readonly BasicExpenseService $expenseService,
        private readonly ExpenseCategoryService $categoryService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        $this->expenseService->ensurePeriodPopulated($period);

        $expenses = $this->expenseService->getExpensesForPeriod($period);
        $summary = $this->expenseService->getSummary($period);
        $categories = $this->categoryService->getAll();
        $templates = $this->expenseService->getTemplates();
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();

        return Inertia::render('Finance/Expenses/Index', [
            'expenses' => BasicExpenseResource::collection($expenses),
            'summary' => $summary,
            'categories' => ExpenseCategoryResource::collection($categories),
            'templates' => BasicExpenseTemplateResource::collection($templates),
            'accounts' => AccountResource::collection($accounts),
            'currentPeriod' => $period,
        ]);
    }

    public function storeTemplate(StoreBasicExpenseTemplateRequest $request): RedirectResponse
    {
        $period = $request->query('period', now()->format('Y-m'));

        $this->expenseService->createTemplateWithExpense(
            $request->validated(),
            $period,
        );

        return redirect()->route('expenses.index', ['period' => $period])
            ->with('success', 'Expense added successfully.');
    }

    public function updateTemplate(UpdateBasicExpenseTemplateRequest $request, BasicExpenseTemplate $template): RedirectResponse
    {
        $this->expenseService->updateTemplate($template, $request->validated());

        return redirect()->back()
            ->with('success', 'Template updated successfully.');
    }

    public function destroyTemplate(BasicExpenseTemplate $template): RedirectResponse
    {
        $this->expenseService->deleteTemplate($template);

        return redirect()->back()
            ->with('success', 'Template deleted successfully.');
    }

    public function togglePaid(ToggleBasicExpensePaidRequest $request, BasicExpense $expense): RedirectResponse
    {
        $isPaid = (bool) $request->validated('is_paid');

        if ($isPaid) {
            $this->expenseService->markAsPaid(
                $expense,
                (int) $request->validated('account_id'),
            );
        } else {
            $this->expenseService->markAsUnpaid($expense);
        }

        $action = $isPaid ? 'marked as paid' : 'marked as unpaid';

        return redirect()->back()
            ->with('success', "{$expense->name} {$action}.");
    }

    public function updateAmount(UpdateBasicExpenseAmountRequest $request, BasicExpense $expense): RedirectResponse
    {
        try {
            $this->expenseService->updateExpenseAmount(
                $expense,
                (float) $request->validated('amount'),
            );
        } catch (\InvalidArgumentException $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }

        return redirect()->back()
            ->with('success', 'Amount updated successfully.');
    }
}
