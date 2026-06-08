<?php

use App\Models\Account;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();

    Account::create([
        'name' => 'Cash',
        'type' => 'cash',
        'balance' => 0,
        'is_default' => true,
    ]);

    Account::create([
        'name' => 'Metro Card',
        'type' => 'metro_card',
        'balance' => 0,
        'is_default' => false,
    ]);
});

describe('Accounts Index', function () {
    it('shows the accounts page', function () {
        $this->actingAs($this->user)
            ->get('/finance/accounts')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/Accounts/Index')
                ->has('accounts.data', 2)
                ->has('totalBalance')
                ->has('metroBalance')
            );
    });

    it('requires authentication', function () {
        $this->get('/finance/accounts')
            ->assertRedirect('/login');
    });
});

describe('Create Account', function () {
    it('can create a bank account', function () {
        $this->actingAs($this->user)
            ->post('/finance/accounts', [
                'name' => 'Banco Bolivariano',
                'initial_balance' => 1500.50,
                'is_default' => false,
            ])
            ->assertRedirect('/finance/accounts');

        $this->assertDatabaseHas('accounts', [
            'name' => 'Banco Bolivariano',
            'type' => 'bank',
            'balance' => 1500.50,
        ]);

        $this->assertDatabaseHas('account_transactions', [
            'description' => 'Initial balance',
            'amount' => 1500.50,
            'type' => 'adjustment',
        ]);
    });

    it('creates account with zero balance without transaction', function () {
        $this->actingAs($this->user)
            ->post('/finance/accounts', [
                'name' => 'Empty Account',
                'initial_balance' => 0,
                'is_default' => false,
            ])
            ->assertRedirect('/finance/accounts');

        $this->assertDatabaseHas('accounts', [
            'name' => 'Empty Account',
            'balance' => 0,
        ]);

        $account = Account::where('name', 'Empty Account')->first();
        expect($account->transactions()->count())->toBe(0);
    });

    it('validates required fields', function () {
        $this->actingAs($this->user)
            ->post('/finance/accounts', [
                'name' => '',
                'initial_balance' => '',
            ])
            ->assertSessionHasErrors(['name', 'initial_balance']);
    });

    it('can set account as default', function () {
        $this->actingAs($this->user)
            ->post('/finance/accounts', [
                'name' => 'Primary Bank',
                'initial_balance' => 100,
                'is_default' => true,
            ]);

        $cashAccount = Account::where('type', 'cash')->first();
        $newAccount = Account::where('name', 'Primary Bank')->first();

        expect($cashAccount->fresh()->is_default)->toBeFalse();
        expect($newAccount->is_default)->toBeTrue();
    });
});

describe('Update Account', function () {
    it('can update account name', function () {
        $account = Account::factory()->create(['name' => 'Old Name']);

        $this->actingAs($this->user)
            ->put("/finance/accounts/{$account->id}", [
                'name' => 'New Name',
                'is_default' => false,
            ])
            ->assertRedirect('/finance/accounts');

        expect($account->fresh()->name)->toBe('New Name');
    });

    it('can set account as default', function () {
        $account = Account::factory()->create(['is_default' => false]);

        $this->actingAs($this->user)
            ->put("/finance/accounts/{$account->id}", [
                'name' => $account->name,
                'is_default' => true,
            ]);

        $cashAccount = Account::where('type', 'cash')->first();

        expect($account->fresh()->is_default)->toBeTrue();
        expect($cashAccount->fresh()->is_default)->toBeFalse();
    });
});

describe('Adjust Balance', function () {
    it('can adjust account balance', function () {
        $account = Account::factory()->create(['balance' => 100]);

        $this->actingAs($this->user)
            ->patch("/finance/accounts/{$account->id}/balance", [
                'balance' => 250,
                'description' => 'Corrected after statement',
            ])
            ->assertRedirect('/finance/accounts');

        expect((float) $account->fresh()->balance)->toBe(250.00);

        $this->assertDatabaseHas('account_transactions', [
            'account_id' => $account->id,
            'amount' => 150.00,
            'description' => 'Corrected after statement',
            'type' => 'adjustment',
        ]);
    });

    it('can adjust cash balance', function () {
        $cashAccount = Account::where('type', 'cash')->first();

        $this->actingAs($this->user)
            ->patch("/finance/accounts/{$cashAccount->id}/balance", [
                'balance' => 50.75,
            ])
            ->assertRedirect('/finance/accounts');

        expect((float) $cashAccount->fresh()->balance)->toBe(50.75);
    });
});

describe('Delete Account', function () {
    it('can delete a bank account', function () {
        $account = Account::factory()->create();

        $this->actingAs($this->user)
            ->delete("/finance/accounts/{$account->id}")
            ->assertRedirect('/finance/accounts');

        $this->assertDatabaseMissing('accounts', ['id' => $account->id]);
    });

    it('cannot delete cash account', function () {
        $cashAccount = Account::where('type', 'cash')->first();

        $this->actingAs($this->user)
            ->delete("/finance/accounts/{$cashAccount->id}")
            ->assertRedirect('/finance/accounts')
            ->assertSessionHas('error');
    });

    it('cannot delete metro card account', function () {
        $metroCard = Account::where('type', 'metro_card')->first();

        $this->actingAs($this->user)
            ->delete("/finance/accounts/{$metroCard->id}")
            ->assertRedirect('/finance/accounts')
            ->assertSessionHas('error');
    });

    it('reassigns default to cash when deleting default bank account', function () {
        $account = Account::factory()->create(['is_default' => true]);
        $cashAccount = Account::where('type', 'cash')->first();
        $cashAccount->update(['is_default' => false]);

        $this->actingAs($this->user)
            ->delete("/finance/accounts/{$account->id}");

        expect($cashAccount->fresh()->is_default)->toBeTrue();
    });
});

describe('Metro Card Top Up', function () {
    it('can top up metro card from cash', function () {
        $cashAccount = Account::where('type', 'cash')->first();
        $cashAccount->update(['balance' => 100]);

        $metroCard = Account::where('type', 'metro_card')->first();

        $this->actingAs($this->user)
            ->post('/finance/metro-card/top-up', [
                'amount' => 25,
                'payment_source_id' => $cashAccount->id,
                'description' => 'Weekly recarga',
            ])
            ->assertRedirect('/finance/accounts');

        expect((float) $metroCard->fresh()->balance)->toBe(25.00);
        expect((float) $cashAccount->fresh()->balance)->toBe(75.00);
    });

    it('can top up metro card from bank account', function () {
        $bankAccount = Account::factory()->create(['balance' => 500]);
        $metroCard = Account::where('type', 'metro_card')->first();

        $this->actingAs($this->user)
            ->post('/finance/metro-card/top-up', [
                'amount' => 30,
                'payment_source_id' => $bankAccount->id,
            ])
            ->assertRedirect('/finance/accounts');

        expect((float) $metroCard->fresh()->balance)->toBe(30.00);
        expect((float) $bankAccount->fresh()->balance)->toBe(470.00);
    });

    it('creates transaction records for both accounts', function () {
        $cashAccount = Account::where('type', 'cash')->first();
        $cashAccount->update(['balance' => 100]);

        $metroCard = Account::where('type', 'metro_card')->first();

        $this->actingAs($this->user)
            ->post('/finance/metro-card/top-up', [
                'amount' => 10,
                'payment_source_id' => $cashAccount->id,
                'description' => 'Test top-up',
            ]);

        $this->assertDatabaseHas('account_transactions', [
            'account_id' => $metroCard->id,
            'amount' => 10,
            'type' => 'top_up',
            'description' => 'Test top-up',
        ]);

        $this->assertDatabaseHas('account_transactions', [
            'account_id' => $cashAccount->id,
            'amount' => -10,
            'type' => 'expense',
            'description' => 'Test top-up',
        ]);
    });

    it('validates amount must be positive', function () {
        $cashAccount = Account::where('type', 'cash')->first();

        $this->actingAs($this->user)
            ->post('/finance/metro-card/top-up', [
                'amount' => 0,
                'payment_source_id' => $cashAccount->id,
            ])
            ->assertSessionHasErrors(['amount']);
    });

    it('validates payment source must exist', function () {
        $this->actingAs($this->user)
            ->post('/finance/metro-card/top-up', [
                'amount' => 10,
                'payment_source_id' => 99999,
            ])
            ->assertSessionHasErrors(['payment_source_id']);
    });
});

describe('Balance Calculation', function () {
    it('calculates total balance correctly', function () {
        Account::factory()->create(['type' => 'bank', 'balance' => 1000]);
        Account::factory()->create(['type' => 'bank', 'balance' => 500]);

        $cashAccount = Account::where('type', 'cash')->first();
        $cashAccount->update(['balance' => 200]);

        $this->actingAs($this->user)
            ->get('/finance/accounts')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('totalBalance', fn ($value) => (float) $value === 1700.0)
            );
    });

    it('excludes metro card from total balance', function () {
        $metroCard = Account::where('type', 'metro_card')->first();
        $metroCard->update(['balance' => 50]);

        $cashAccount = Account::where('type', 'cash')->first();
        $cashAccount->update(['balance' => 100]);

        $this->actingAs($this->user)
            ->get('/finance/accounts')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('totalBalance', fn ($value) => (float) $value === 100.0)
                ->where('metroBalance', fn ($value) => (float) $value === 50.0)
            );
    });
});
