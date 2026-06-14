<?php

use App\Models\Account;
use App\Models\BasicExpense;
use App\Models\CatalogItem;
use App\Models\ExpenseCategory;
use App\Models\IncomeEntry;
use App\Models\MiscExpense;
use App\Models\MonthlySummary;
use App\Models\PlannedItem;
use App\Models\Purchase;
use App\Models\User;
use App\Services\Finance\BudgetCalculationService;

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->cashAccount = Account::create([
        'name' => 'Cash',
        'type' => 'cash',
        'balance' => 200,
        'is_default' => true,
    ]);

    $this->bankAccount = Account::create([
        'name' => 'Bank',
        'type' => 'bank',
        'balance' => 1000,
        'is_default' => false,
    ]);

    Account::create([
        'name' => 'Metro Card',
        'type' => 'metro_card',
        'balance' => 50,
        'is_default' => false,
    ]);

    $this->service = app(BudgetCalculationService::class);
});

describe('The Big Number', function () {
    it('equals account balances when no obligations exist', function () {
        $result = $this->service->getTheBigNumber();

        expect($result)->toBe(1200.00);
    });

    it('subtracts unpaid basic expenses', function () {
        $category = ExpenseCategory::create([
            'name' => 'Bills',
            'type' => 'fixed',
            'sort_order' => 1,
        ]);

        BasicExpense::create([
            'category_id' => $category->id,
            'name' => 'Electricity',
            'amount' => 80,
            'is_paid' => false,
            'period' => now()->format('Y-m'),
        ]);

        BasicExpense::create([
            'category_id' => $category->id,
            'name' => 'Internet',
            'amount' => 40,
            'is_paid' => true,
            'paid_at' => now(),
            'account_id' => $this->bankAccount->id,
            'period' => now()->format('Y-m'),
        ]);

        $result = $this->service->getTheBigNumber();

        expect($result)->toBe(1120.00);
    });

    it('subtracts remaining category budgets', function () {
        $category = ExpenseCategory::create([
            'name' => 'Food',
            'type' => 'item_based',
            'monthly_budget' => 300,
            'sort_order' => 1,
        ]);

        $catalogItem = CatalogItem::create([
            'category_id' => $category->id,
            'name' => 'Groceries',
            'price' => 50,
            'has_iva' => false,
            'is_active' => true,
        ]);

        Purchase::create([
            'catalog_item_id' => $catalogItem->id,
            'category_id' => $category->id,
            'quantity' => 1,
            'unit_price' => 50,
            'iva_amount' => 0,
            'total' => 50,
            'account_id' => $this->bankAccount->id,
            'period' => now()->format('Y-m'),
            'is_planned' => false,
            'purchased_at' => now(),
        ]);

        $result = $this->service->getTheBigNumber();

        expect($result)->toBe(950.00);
    });

    it('subtracts unpaid planned items', function () {
        $category = ExpenseCategory::create([
            'name' => 'Electronics',
            'type' => 'item_based',
            'sort_order' => 1,
        ]);

        $catalogItem = CatalogItem::create([
            'category_id' => $category->id,
            'name' => 'Headphones',
            'price' => 100,
            'has_iva' => true,
            'is_active' => true,
        ]);

        PlannedItem::create([
            'catalog_item_id' => $catalogItem->id,
            'period' => now()->format('Y-m'),
            'quantity' => 1,
            'is_purchased' => false,
        ]);

        $result = $this->service->getTheBigNumber();

        $expectedObligation = 100 + (100 * config('fintrack.iva_rate'));
        $expected = 1200 - $expectedObligation;

        expect($result)->toBe($expected);
    });
});

describe('Budget Computation', function () {
    it('computes total income for period', function () {
        IncomeEntry::create([
            'source' => 'Salary',
            'amount' => 3000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-01',
        ]);

        IncomeEntry::create([
            'source' => 'Freelance',
            'amount' => 500,
            'account_id' => $this->cashAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-15',
        ]);

        $result = $this->service->getTotalIncome('2024-06');

        expect($result)->toBe(3500.00);
    });

    it('computes total spent for period', function () {
        $category = ExpenseCategory::create([
            'name' => 'Bills',
            'type' => 'fixed',
            'sort_order' => 1,
        ]);

        BasicExpense::create([
            'category_id' => $category->id,
            'name' => 'Rent',
            'amount' => 800,
            'is_paid' => true,
            'paid_at' => now(),
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
        ]);

        MiscExpense::create([
            'description' => 'Coffee',
            'amount' => 5,
            'is_guilty' => false,
            'account_id' => $this->cashAccount->id,
            'period' => '2024-06',
            'spent_at' => now(),
        ]);

        $result = $this->service->getTotalSpent('2024-06');

        expect($result)->toBe(805.00);
    });

    it('computes carry over from previous month', function () {
        MonthlySummary::create([
            'period' => '2024-05',
            'total_income' => 3000,
            'total_spent' => 2500,
            'leftover' => 500,
            'carry_over_from_previous' => 0,
        ]);

        $result = $this->service->getCarryOverFromPrevious('2024-06');

        expect($result)->toBe(500.00);
    });

    it('returns zero carry over when no previous month data', function () {
        $result = $this->service->getCarryOverFromPrevious('2024-01');

        expect($result)->toBe(0.0);
    });

    it('updates monthly summary cache on compute', function () {
        IncomeEntry::create([
            'source' => 'Salary',
            'amount' => 3000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-01',
        ]);

        $this->service->computeForPeriod('2024-06');

        $this->assertDatabaseHas('monthly_summaries', [
            'period' => '2024-06',
            'total_income' => 3000,
        ]);
    });
});

describe('Category Budget Status', function () {
    it('tracks spending against category budgets', function () {
        $category = ExpenseCategory::create([
            'name' => 'Food',
            'type' => 'item_based',
            'monthly_budget' => 200,
            'sort_order' => 1,
        ]);

        $catalogItem = CatalogItem::create([
            'category_id' => $category->id,
            'name' => 'Groceries',
            'price' => 30,
            'has_iva' => false,
            'is_active' => true,
        ]);

        Purchase::create([
            'catalog_item_id' => $catalogItem->id,
            'category_id' => $category->id,
            'quantity' => 2,
            'unit_price' => 30,
            'iva_amount' => 0,
            'total' => 60,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'is_planned' => false,
            'purchased_at' => now(),
        ]);

        $result = $this->service->getCategoryBudgetStatus('2024-06');

        expect($result)->toHaveCount(1);
        expect($result[0]['name'])->toBe('Food');
        expect($result[0]['budget'])->toBe(200.00);
        expect($result[0]['spent'])->toBe(60.00);
        expect($result[0]['remaining'])->toBe(140.00);
        expect($result[0]['percentage_used'])->toBe(30.0);
    });

    it('caps remaining at zero when overspent', function () {
        $category = ExpenseCategory::create([
            'name' => 'Food',
            'type' => 'item_based',
            'monthly_budget' => 100,
            'sort_order' => 1,
        ]);

        $catalogItem = CatalogItem::create([
            'category_id' => $category->id,
            'name' => 'Expensive dinner',
            'price' => 150,
            'has_iva' => false,
            'is_active' => true,
        ]);

        Purchase::create([
            'catalog_item_id' => $catalogItem->id,
            'category_id' => $category->id,
            'quantity' => 1,
            'unit_price' => 150,
            'iva_amount' => 0,
            'total' => 150,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'is_planned' => false,
            'purchased_at' => now(),
        ]);

        $result = $this->service->getCategoryBudgetStatus('2024-06');

        expect($result[0]['remaining'])->toBe(0.0);
        expect($result[0]['percentage_used'])->toBe(100.0);
    });

    it('only includes item_based categories with budgets', function () {
        ExpenseCategory::create([
            'name' => 'Bills',
            'type' => 'fixed',
            'monthly_budget' => 500,
            'sort_order' => 1,
        ]);

        ExpenseCategory::create([
            'name' => 'Food',
            'type' => 'item_based',
            'monthly_budget' => 200,
            'sort_order' => 2,
        ]);

        ExpenseCategory::create([
            'name' => 'Cat',
            'type' => 'item_based',
            'sort_order' => 3,
        ]);

        $result = $this->service->getCategoryBudgetStatus('2024-06');

        expect($result)->toHaveCount(1);
        expect($result[0]['name'])->toBe('Food');
    });
});
