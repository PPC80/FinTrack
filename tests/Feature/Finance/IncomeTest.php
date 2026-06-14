<?php

use App\Models\Account;
use App\Models\IncomeEntry;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();

    $this->cashAccount = Account::create([
        'name' => 'Cash',
        'type' => 'cash',
        'balance' => 0,
        'is_default' => true,
    ]);

    $this->bankAccount = Account::create([
        'name' => 'Banco Bolivariano',
        'type' => 'bank',
        'balance' => 500,
        'is_default' => false,
    ]);

    Account::create([
        'name' => 'Metro Card',
        'type' => 'metro_card',
        'balance' => 0,
        'is_default' => false,
    ]);
});

describe('Income Index', function () {
    it('shows the income page', function () {
        $this->actingAs($this->user)
            ->get('/finance/income')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/Income/Index')
                ->has('entries')
                ->has('accounts')
                ->has('budgetSummary')
                ->has('currentPeriod')
            );
    });

    it('requires authentication', function () {
        $this->get('/finance/income')
            ->assertRedirect('/login');
    });

    it('filters entries by period', function () {
        IncomeEntry::create([
            'source' => 'January Salary',
            'amount' => 2000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-01',
            'received_at' => '2024-01-15',
        ]);

        IncomeEntry::create([
            'source' => 'February Salary',
            'amount' => 2000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-02',
            'received_at' => '2024-02-15',
        ]);

        $this->actingAs($this->user)
            ->get('/finance/income?period=2024-01')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('entries.data', 1)
                ->where('entries.data.0.source', 'January Salary')
            );
    });
});

describe('Store Income', function () {
    it('can add an income entry', function () {
        $this->actingAs($this->user)
            ->post('/finance/income?period=2024-06', [
                'source' => 'Salary',
                'amount' => 2500.00,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-01',
            ])
            ->assertRedirect('/finance/income?period=2024-06');

        $this->assertDatabaseHas('income_entries', [
            'source' => 'Salary',
            'amount' => 2500.00,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
        ]);
    });

    it('increases account balance on deposit', function () {
        $this->actingAs($this->user)
            ->post('/finance/income?period=2024-06', [
                'source' => 'Freelance',
                'amount' => 1000.00,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-15',
            ]);

        expect((float) $this->bankAccount->fresh()->balance)->toBe(1500.00);
    });

    it('creates an account transaction', function () {
        $this->actingAs($this->user)
            ->post('/finance/income?period=2024-06', [
                'source' => 'Bonus',
                'amount' => 500.00,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-10',
            ]);

        $this->assertDatabaseHas('account_transactions', [
            'account_id' => $this->bankAccount->id,
            'amount' => 500.00,
            'type' => 'income',
            'description' => 'Income: Bonus',
        ]);
    });

    it('validates required fields', function () {
        $this->actingAs($this->user)
            ->post('/finance/income', [
                'source' => '',
                'amount' => '',
                'account_id' => '',
                'received_at' => '',
            ])
            ->assertSessionHasErrors(['source', 'amount', 'account_id', 'received_at']);
    });

    it('validates amount must be positive', function () {
        $this->actingAs($this->user)
            ->post('/finance/income', [
                'source' => 'Test',
                'amount' => -100,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-01',
            ])
            ->assertSessionHasErrors(['amount']);
    });
});

describe('Update Income', function () {
    it('can update an income entry', function () {
        $entry = IncomeEntry::create([
            'source' => 'Old Source',
            'amount' => 1000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-01',
        ]);
        $this->bankAccount->increment('balance', 1000);

        $this->actingAs($this->user)
            ->put("/finance/income/{$entry->id}", [
                'source' => 'New Source',
                'amount' => 1500,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-05',
            ])
            ->assertRedirect();

        expect($entry->fresh()->source)->toBe('New Source');
        expect((float) $entry->fresh()->amount)->toBe(1500.00);
    });

    it('adjusts account balances when changing amount', function () {
        $entry = IncomeEntry::create([
            'source' => 'Salary',
            'amount' => 2000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-01',
        ]);
        $this->bankAccount->increment('balance', 2000);

        $this->actingAs($this->user)
            ->put("/finance/income/{$entry->id}", [
                'source' => 'Salary',
                'amount' => 2500,
                'account_id' => $this->bankAccount->id,
                'received_at' => '2024-06-01',
            ]);

        expect((float) $this->bankAccount->fresh()->balance)->toBe(3000.00);
    });

    it('adjusts balances when changing account', function () {
        $entry = IncomeEntry::create([
            'source' => 'Salary',
            'amount' => 1000,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-01',
        ]);
        $this->bankAccount->increment('balance', 1000);

        $this->actingAs($this->user)
            ->put("/finance/income/{$entry->id}", [
                'source' => 'Salary',
                'amount' => 1000,
                'account_id' => $this->cashAccount->id,
                'received_at' => '2024-06-01',
            ]);

        expect((float) $this->bankAccount->fresh()->balance)->toBe(500.00);
        expect((float) $this->cashAccount->fresh()->balance)->toBe(1000.00);
    });
});

describe('Delete Income', function () {
    it('can delete an income entry', function () {
        $entry = IncomeEntry::create([
            'source' => 'Bonus',
            'amount' => 500,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-10',
        ]);
        $this->bankAccount->increment('balance', 500);

        $this->actingAs($this->user)
            ->delete("/finance/income/{$entry->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('income_entries', ['id' => $entry->id]);
    });

    it('decreases account balance on deletion', function () {
        $entry = IncomeEntry::create([
            'source' => 'Bonus',
            'amount' => 500,
            'account_id' => $this->bankAccount->id,
            'period' => '2024-06',
            'received_at' => '2024-06-10',
        ]);
        $this->bankAccount->increment('balance', 500);

        $this->actingAs($this->user)
            ->delete("/finance/income/{$entry->id}");

        expect((float) $this->bankAccount->fresh()->balance)->toBe(500.00);
    });
});
