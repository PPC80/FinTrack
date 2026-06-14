<?php

namespace App\Services\Finance;

use App\Models\PlannedItem;
use Illuminate\Database\Eloquent\Collection;

class PlannedItemService
{
    public function getPlannedItemsForPeriod(string $period, ?int $categoryId = null): Collection
    {
        $query = PlannedItem::with(['catalogItem.category', 'purchase'])
            ->where('period', $period);

        if ($categoryId !== null) {
            $query->whereHas('catalogItem', function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            });
        }

        return $query->orderBy('id')->get();
    }

    public function addPlannedItem(array $data): PlannedItem
    {
        return PlannedItem::create([
            'catalog_item_id' => $data['catalog_item_id'],
            'period' => $data['period'],
            'quantity' => $data['quantity'] ?? 1,
        ]);
    }

    public function updatePlannedItem(PlannedItem $plannedItem, array $data): PlannedItem
    {
        if ($plannedItem->is_purchased) {
            throw new \InvalidArgumentException('Cannot update a purchased planned item.');
        }

        $plannedItem->update([
            'quantity' => $data['quantity'] ?? $plannedItem->quantity,
        ]);

        return $plannedItem->fresh();
    }

    public function removePlannedItem(PlannedItem $plannedItem): void
    {
        if ($plannedItem->is_purchased) {
            throw new \InvalidArgumentException('Cannot remove a purchased planned item.');
        }

        $plannedItem->delete();
    }

    public function getPlannedSummary(string $period, ?int $categoryId = null): array
    {
        $query = PlannedItem::with('catalogItem')
            ->where('period', $period);

        if ($categoryId !== null) {
            $query->whereHas('catalogItem', function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            });
        }

        $items = $query->get();

        return [
            'total_items' => $items->count(),
            'purchased_count' => $items->where('is_purchased', true)->count(),
            'pending_count' => $items->where('is_purchased', false)->count(),
        ];
    }
}
