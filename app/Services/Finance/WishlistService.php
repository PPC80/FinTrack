<?php

namespace App\Services\Finance;

use App\Models\WishlistItem;
use Illuminate\Database\Eloquent\Collection;

class WishlistService
{
    public function getAll(): Collection
    {
        return WishlistItem::orderByRaw('is_purchased ASC, priority ASC NULLS LAST, created_at DESC')
            ->get();
    }

    public function store(array $data): WishlistItem
    {
        return WishlistItem::create([
            'name' => $data['name'],
            'price' => $data['price'],
            'url' => $data['url'] ?? null,
            'priority' => $data['priority'] ?? null,
        ]);
    }

    public function update(WishlistItem $wishlistItem, array $data): WishlistItem
    {
        $wishlistItem->update([
            'name' => $data['name'],
            'price' => $data['price'],
            'url' => $data['url'] ?? null,
            'priority' => $data['priority'] ?? null,
        ]);

        return $wishlistItem->fresh();
    }

    public function togglePurchased(WishlistItem $wishlistItem): WishlistItem
    {
        $wishlistItem->update([
            'is_purchased' => ! $wishlistItem->is_purchased,
        ]);

        return $wishlistItem->fresh();
    }

    public function destroy(WishlistItem $wishlistItem): void
    {
        $wishlistItem->delete();
    }

    public function getTotalPending(): float
    {
        return (float) WishlistItem::pending()->sum('price');
    }

    public function getTotalPurchased(): float
    {
        return (float) WishlistItem::purchased()->sum('price');
    }
}
