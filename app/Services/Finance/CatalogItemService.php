<?php

namespace App\Services\Finance;

use App\Models\CatalogItem;
use Illuminate\Database\Eloquent\Collection;

class CatalogItemService
{
    public function getItemsByCategory(int $categoryId): Collection
    {
        return CatalogItem::where('category_id', $categoryId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function getActiveItemsForCategories(array $categoryIds): Collection
    {
        return CatalogItem::whereIn('category_id', $categoryIds)
            ->where('is_active', true)
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): CatalogItem
    {
        return CatalogItem::create([
            'category_id' => $data['category_id'],
            'name' => $data['name'],
            'price' => $data['price'],
            'has_iva' => $data['has_iva'] ?? false,
        ]);
    }

    public function update(CatalogItem $item, array $data): CatalogItem
    {
        $item->update([
            'name' => $data['name'] ?? $item->name,
            'price' => $data['price'] ?? $item->price,
            'has_iva' => $data['has_iva'] ?? $item->has_iva,
        ]);

        return $item->fresh();
    }

    public function deactivate(CatalogItem $item): void
    {
        $item->update(['is_active' => false]);
    }
}
