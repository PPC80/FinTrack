<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\BasicExpense;
use App\Models\BasicExpenseTemplate;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class BasicExpenseService
{
    public function getExpensesForPeriod(string $period): Collection
    {
        return BasicExpense::with(['category', 'account'])
            ->where('period', $period)
            ->orderBy('category_id')
            ->orderBy('id')
            ->get();
    }

    public function ensurePeriodPopulated(string $period): void
    {
        $hasExpenses = BasicExpense::where('period', $period)->exists();

        if ($hasExpenses) {
            return;
        }

        $this->populateFromTemplates($period);
    }

    public function createTemplate(array $data): BasicExpenseTemplate
    {
        $maxSortOrder = BasicExpenseTemplate::where('category_id', $data['category_id'])->max('sort_order') ?? 0;

        return BasicExpenseTemplate::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'default_amount' => $data['default_amount'],
            'sort_order' => $maxSortOrder + 1,
        ]);
    }

    public function createTemplateWithExpense(array $data, string $period): array
    {
        return DB::transaction(function () use ($data, $period) {
            $template = $this->createTemplate($data);

            $expense = BasicExpense::create([
                'category_id' => $template->category_id,
                'template_id' => $template->id,
                'name' => $template->name,
                'amount' => $template->default_amount,
                'is_paid' => false,
                'period' => $period,
            ]);

            return ['template' => $template, 'expense' => $expense];
        });
    }

    public function updateTemplate(BasicExpenseTemplate $template, array $data): BasicExpenseTemplate
    {
        $template->update([
            'name' => $data['name'],
            'default_amount' => $data['default_amount'],
        ]);

        return $template->fresh();
    }

    public function deleteTemplate(BasicExpenseTemplate $template): void
    {
        $template->delete();
    }

    public function updateExpenseAmount(BasicExpense $expense, float $amount): BasicExpense
    {
        if ($expense->is_paid) {
            throw new \InvalidArgumentException('Cannot update amount of a paid expense. Unmark it first.');
        }

        $expense->update(['amount' => $amount]);

        return $expense->fresh();
    }

    public function markAsPaid(BasicExpense $expense, int $accountId): BasicExpense
    {
        if ($expense->is_paid) {
            return $expense;
        }

        $account = Account::findOrFail($accountId);

        return DB::transaction(function () use ($expense, $account) {
            $expense->update([
                'is_paid' => true,
                'paid_at' => now(),
                'account_id' => $account->id,
            ]);

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs((float) $expense->amount),
                'description' => "Paid: {$expense->name}",
                'type' => 'expense',
                'period' => $expense->period,
            ]);

            $account->decrement('balance', abs((float) $expense->amount));

            return $expense->fresh()->load(['category', 'account']);
        });
    }

    public function markAsUnpaid(BasicExpense $expense): BasicExpense
    {
        if (! $expense->is_paid) {
            return $expense;
        }

        $account = Account::findOrFail($expense->account_id);

        return DB::transaction(function () use ($expense, $account) {
            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs((float) $expense->amount),
                'description' => "Reverted: {$expense->name}",
                'type' => 'expense',
                'period' => $expense->period,
            ]);

            $account->increment('balance', abs((float) $expense->amount));

            $expense->update([
                'is_paid' => false,
                'paid_at' => null,
                'account_id' => null,
            ]);

            return $expense->fresh()->load(['category', 'account']);
        });
    }

    public function getSummary(string $period): array
    {
        $expenses = BasicExpense::where('period', $period)->get();

        $total = (float) $expenses->sum('amount');
        $paid = (float) $expenses->where('is_paid', true)->sum('amount');
        $remaining = $total - $paid;

        return [
            'total' => $total,
            'paid' => $paid,
            'remaining' => $remaining,
            'count' => $expenses->count(),
            'paid_count' => $expenses->where('is_paid', true)->count(),
        ];
    }

    public function getTemplates(): Collection
    {
        return BasicExpenseTemplate::with('category')
            ->orderBy('category_id')
            ->orderBy('sort_order')
            ->get();
    }

    private function populateFromTemplates(string $period): void
    {
        $templates = BasicExpenseTemplate::all();

        $previousPeriod = $this->getPreviousPeriod($period);
        $previousExpenses = BasicExpense::where('period', $previousPeriod)
            ->whereNotNull('template_id')
            ->get()
            ->keyBy('template_id');

        $expenses = $templates->map(function (BasicExpenseTemplate $template) use ($period, $previousExpenses) {
            $previousExpense = $previousExpenses->get($template->id);
            $amount = $previousExpense ? (float) $previousExpense->amount : (float) $template->default_amount;

            return [
                'category_id' => $template->category_id,
                'template_id' => $template->id,
                'name' => $template->name,
                'amount' => $amount,
                'is_paid' => false,
                'period' => $period,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        });

        if ($expenses->isNotEmpty()) {
            BasicExpense::insert($expenses->toArray());
        }
    }

    private function getPreviousPeriod(string $period): string
    {
        $year = (int) substr($period, 0, 4);
        $month = (int) substr($period, 5, 2);

        if ($month === 1) {
            return ($year - 1).'-12';
        }

        return $year.'-'.str_pad($month - 1, 2, '0', STR_PAD_LEFT);
    }
}
