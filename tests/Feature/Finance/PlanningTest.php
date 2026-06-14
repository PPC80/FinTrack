<?php

use App\Models\PredictedIncome;
use App\Models\User;
use App\Models\WishlistItem;

beforeEach(function () {
    $this->user = User::factory()->create();
});

describe('Planning Index', function () {
    it('shows the planning page', function () {
        $this->actingAs($this->user)
            ->get('/finance/planning')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/Planning/Index')
                ->has('predictedIncomes')
                ->has('wishlistItems')
                ->has('summary')
            );
    });

    it('requires authentication', function () {
        $this->get('/finance/planning')
            ->assertRedirect('/login');
    });
});

describe('Predicted Income CRUD', function () {
    it('can add a predicted income entry', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/predicted-income', [
                'description' => 'Ingreso freelance',
                'amount' => 5000.00,
                'expected_date' => '2024-06-15',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('predicted_incomes', [
            'description' => 'Ingreso freelance',
            'amount' => 5000.00,
            'is_received' => false,
        ]);

        $entry = PredictedIncome::first();
        expect($entry->expected_date->toDateString())->toBe('2024-06-15');
    });

    it('can add a predicted income without expected date', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/predicted-income', [
                'description' => 'Bonus',
                'amount' => 1000.00,
                'expected_date' => null,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('predicted_incomes', [
            'description' => 'Bonus',
            'amount' => 1000.00,
            'expected_date' => null,
        ]);
    });

    it('validates required fields for predicted income', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/predicted-income', [
                'description' => '',
                'amount' => '',
            ])
            ->assertSessionHasErrors(['description', 'amount']);
    });

    it('validates amount must be positive', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/predicted-income', [
                'description' => 'Test',
                'amount' => -100,
            ])
            ->assertSessionHasErrors(['amount']);
    });

    it('can update a predicted income entry', function () {
        $predicted = PredictedIncome::create([
            'description' => 'Old Description',
            'amount' => 1000,
            'expected_date' => '2024-06-01',
        ]);

        $this->actingAs($this->user)
            ->put("/finance/planning/predicted-income/{$predicted->id}", [
                'description' => 'New Description',
                'amount' => 2000,
                'expected_date' => '2024-07-01',
            ])
            ->assertRedirect();

        expect($predicted->fresh()->description)->toBe('New Description');
        expect((float) $predicted->fresh()->amount)->toBe(2000.00);
    });

    it('can toggle predicted income as received', function () {
        $predicted = PredictedIncome::create([
            'description' => 'Salary',
            'amount' => 3000,
        ]);

        $this->actingAs($this->user)
            ->patch("/finance/planning/predicted-income/{$predicted->id}/toggle")
            ->assertRedirect();

        expect($predicted->fresh()->is_received)->toBeTrue();

        $this->actingAs($this->user)
            ->patch("/finance/planning/predicted-income/{$predicted->id}/toggle")
            ->assertRedirect();

        expect($predicted->fresh()->is_received)->toBeFalse();
    });

    it('can delete a predicted income entry', function () {
        $predicted = PredictedIncome::create([
            'description' => 'To Delete',
            'amount' => 500,
        ]);

        $this->actingAs($this->user)
            ->delete("/finance/planning/predicted-income/{$predicted->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('predicted_incomes', ['id' => $predicted->id]);
    });

    it('returns correct summary totals for predicted income', function () {
        PredictedIncome::create([
            'description' => 'Pending 1',
            'amount' => 1000,
        ]);

        PredictedIncome::create([
            'description' => 'Pending 2',
            'amount' => 2000,
        ]);

        PredictedIncome::create([
            'description' => 'Received',
            'amount' => 500,
            'is_received' => true,
        ]);

        $this->actingAs($this->user)
            ->get('/finance/planning')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('summary.predicted_income_pending', 3000)
                ->where('summary.predicted_income_received', 500)
            );
    });
});

describe('Wishlist CRUD', function () {
    it('can add a wishlist item', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/wishlist', [
                'name' => 'New Headphones',
                'price' => 199.99,
                'url' => 'https://example.com/headphones',
                'priority' => 1,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('wishlist_items', [
            'name' => 'New Headphones',
            'price' => 199.99,
            'url' => 'https://example.com/headphones',
            'priority' => 1,
            'is_purchased' => false,
        ]);
    });

    it('can add a wishlist item with only required fields', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/wishlist', [
                'name' => 'Basic Item',
                'price' => 50.00,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('wishlist_items', [
            'name' => 'Basic Item',
            'price' => 50.00,
            'url' => null,
            'priority' => null,
        ]);
    });

    it('validates required fields for wishlist item', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/wishlist', [
                'name' => '',
                'price' => '',
            ])
            ->assertSessionHasErrors(['name', 'price']);
    });

    it('validates url format', function () {
        $this->actingAs($this->user)
            ->post('/finance/planning/wishlist', [
                'name' => 'Test',
                'price' => 100,
                'url' => 'not-a-url',
            ])
            ->assertSessionHasErrors(['url']);
    });

    it('can update a wishlist item', function () {
        $item = WishlistItem::create([
            'name' => 'Old Name',
            'price' => 100,
            'priority' => 1,
        ]);

        $this->actingAs($this->user)
            ->put("/finance/planning/wishlist/{$item->id}", [
                'name' => 'New Name',
                'price' => 200,
                'priority' => 2,
            ])
            ->assertRedirect();

        expect($item->fresh()->name)->toBe('New Name');
        expect((float) $item->fresh()->price)->toBe(200.00);
        expect($item->fresh()->priority)->toBe(2);
    });

    it('can toggle wishlist item as purchased', function () {
        $item = WishlistItem::create([
            'name' => 'Test Item',
            'price' => 50,
        ]);

        $this->actingAs($this->user)
            ->patch("/finance/planning/wishlist/{$item->id}/toggle")
            ->assertRedirect();

        expect($item->fresh()->is_purchased)->toBeTrue();

        $this->actingAs($this->user)
            ->patch("/finance/planning/wishlist/{$item->id}/toggle")
            ->assertRedirect();

        expect($item->fresh()->is_purchased)->toBeFalse();
    });

    it('can delete a wishlist item', function () {
        $item = WishlistItem::create([
            'name' => 'To Delete',
            'price' => 25,
        ]);

        $this->actingAs($this->user)
            ->delete("/finance/planning/wishlist/{$item->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('wishlist_items', ['id' => $item->id]);
    });

    it('returns correct summary totals for wishlist', function () {
        WishlistItem::create([
            'name' => 'Pending 1',
            'price' => 100,
        ]);

        WishlistItem::create([
            'name' => 'Pending 2',
            'price' => 200,
        ]);

        WishlistItem::create([
            'name' => 'Purchased',
            'price' => 50,
            'is_purchased' => true,
        ]);

        $this->actingAs($this->user)
            ->get('/finance/planning')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('summary.wishlist_pending', 300)
                ->where('summary.wishlist_purchased', 50)
            );
    });
});
