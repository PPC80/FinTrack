<?php

use App\Models\Account;
use App\Models\BasicExpense;
use App\Models\CatalogItem;
use App\Models\ExpenseCategory;
use App\Models\IncomeEntry;
use App\Models\MiscExpense;
use App\Models\Purchase;
use App\Models\TransportMode;
use App\Models\Trip;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function () {
    $this->user = User::factory()->create();
    Account::factory()->create(['name' => 'Cash', 'type' => 'cash', 'balance' => 0, 'is_default' => true]);
    Account::factory()->create(['name' => 'Metro Card', 'type' => 'metro_card', 'balance' => 0]);
});

describe('Dashboard Index', function () {
    it('shows the dashboard page', function () {
        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Dashboard')
                ->has('budgetSummary')
                ->has('accounts')
                ->has('basicExpensesProgress')
                ->has('shameSummary')
                ->has('recentActivity')
                ->has('monthComparison')
                ->has('currentPeriod')
                ->has('monthlySummaries')
            );
    });

    it('requires authentication', function () {
        $this->get(route('dashboard'))
            ->assertRedirect(route('login'));
    });

    it('accepts a period query parameter', function () {
        $this->actingAs($this->user)
            ->get(route('dashboard', ['period' => '2024-06']))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('currentPeriod', '2024-06')
            );
    });
});

describe('Account Balances', function () {
    it('returns all accounts with balances', function () {
        Account::factory()->create(['name' => 'BanColombia', 'type' => 'bank', 'balance' => 5000.00]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('accounts', 3)
                ->where('accounts.0.name', 'BanColombia')
                ->where('accounts.0.balance', 5000)
                ->where('accounts.0.type', 'bank')
            );
    });
});

describe('Basic Expenses Progress', function () {
    it('calculates paid vs total progress', function () {
        $period = now()->format('Y-m');
        $category = ExpenseCategory::factory()->create(['type' => 'fixed']);

        BasicExpense::factory()->create([
            'category_id' => $category->id,
            'amount' => 100.00,
            'is_paid' => true,
            'paid_at' => now(),
            'period' => $period,
        ]);
        BasicExpense::factory()->create([
            'category_id' => $category->id,
            'amount' => 200.00,
            'is_paid' => false,
            'period' => $period,
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('basicExpensesProgress.total_count', 2)
                ->where('basicExpensesProgress.paid_count', 1)
                ->where('basicExpensesProgress.total_amount', 300)
                ->where('basicExpensesProgress.paid_amount', 100)
            );
    });

    it('returns zero progress when no expenses exist', function () {
        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('basicExpensesProgress.total_count', 0)
                ->where('basicExpensesProgress.paid_count', 0)
                ->where('basicExpensesProgress.percentage', 0)
            );
    });
});

describe('Counter of Shame', function () {
    it('returns guilty and taxi totals', function () {
        $period = now()->format('Y-m');
        $account = Account::where('type', 'cash')->first();

        MiscExpense::factory()->create([
            'amount' => 50.00,
            'is_guilty' => true,
            'account_id' => $account->id,
            'period' => $period,
            'spent_at' => now(),
        ]);
        MiscExpense::factory()->create([
            'amount' => 30.00,
            'is_guilty' => true,
            'account_id' => $account->id,
            'period' => $period,
            'spent_at' => now(),
        ]);

        $taxiMode = TransportMode::factory()->create(['is_taxi' => true]);
        Trip::factory()->create([
            'transport_mode_id' => $taxiMode->id,
            'fare_at_time' => 25.00,
            'account_id' => $account->id,
            'period' => $period,
            'taken_at' => now(),
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('shameSummary.guilty_total', 80)
                ->where('shameSummary.guilty_count', 2)
                ->where('shameSummary.taxi_total', 25)
            );
    });
});

describe('Recent Activity', function () {
    it('returns recent transactions across all types', function () {
        $period = now()->format('Y-m');
        $account = Account::where('type', 'cash')->first();

        IncomeEntry::factory()->create([
            'source' => 'Freelance work',
            'amount' => 1000.00,
            'account_id' => $account->id,
            'period' => $period,
            'received_at' => now()->subDays(1),
        ]);

        MiscExpense::factory()->create([
            'description' => 'Coffee',
            'amount' => 5.00,
            'account_id' => $account->id,
            'period' => $period,
            'spent_at' => now(),
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('recentActivity', 2)
                ->where('recentActivity.0.type', 'misc_expense')
                ->where('recentActivity.0.description', 'Coffee')
                ->where('recentActivity.1.type', 'income')
                ->where('recentActivity.1.description', 'Freelance work')
            );
    });

    it('limits to 10 most recent items', function () {
        $period = now()->format('Y-m');
        $account = Account::where('type', 'cash')->first();

        for ($i = 0; $i < 15; $i++) {
            MiscExpense::factory()->create([
                'description' => "Expense $i",
                'amount' => 10.00,
                'account_id' => $account->id,
                'period' => $period,
                'spent_at' => now()->subMinutes($i),
            ]);
        }

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('recentActivity', 10)
            );
    });
});

describe('Month Comparison', function () {
    it('compares current month spending to previous', function () {
        $currentPeriod = now()->format('Y-m');
        $previousPeriod = now()->subMonth()->format('Y-m');
        $account = Account::where('type', 'cash')->first();

        MiscExpense::factory()->create([
            'amount' => 200.00,
            'account_id' => $account->id,
            'period' => $currentPeriod,
            'spent_at' => now(),
        ]);

        MiscExpense::factory()->create([
            'amount' => 150.00,
            'account_id' => $account->id,
            'period' => $previousPeriod,
            'spent_at' => now()->subMonth(),
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('monthComparison.current_spent', 200)
                ->where('monthComparison.previous_spent', 150)
                ->where('monthComparison.difference', 50)
                ->where('monthComparison.direction', 'more')
            );
    });

    it('shows less when current spending is lower', function () {
        $currentPeriod = now()->format('Y-m');
        $previousPeriod = now()->subMonth()->format('Y-m');
        $account = Account::where('type', 'cash')->first();

        MiscExpense::factory()->create([
            'amount' => 100.00,
            'account_id' => $account->id,
            'period' => $currentPeriod,
            'spent_at' => now(),
        ]);

        MiscExpense::factory()->create([
            'amount' => 300.00,
            'account_id' => $account->id,
            'period' => $previousPeriod,
            'spent_at' => now()->subMonth(),
        ]);

        $this->actingAs($this->user)
            ->get(route('dashboard'))
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('monthComparison.direction', 'less')
                ->where('monthComparison.difference', 200)
            );
    });
});
