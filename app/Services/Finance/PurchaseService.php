<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\CatalogItem;
use App\Models\PlannedItem;
use App\Models\Purchase;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function getPurchasesForPeriod(string $period, ?int $categoryId = null): Collection
    {
        $query = Purchase::with(['catalogItem', 'category', 'account'])
            ->where('period', $period)
            ->orderByDesc('purchased_at');

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->get();
    }

    public function logPurchase(array $data): Purchase
    {
        $catalogItem = CatalogItem::findOrFail($data['catalog_item_id']);
        $account = Account::findOrFail($data['account_id']);
        $quantity = $data['quantity'] ?? 1;
        $period = $data['period'] ?? now()->format('Y-m');

        $calculation = $catalogItem->calculateTotal($quantity);

        return DB::transaction(function () use ($catalogItem, $account, $quantity, $period, $calculation, $data) {
            $purchase = Purchase::create([
                'catalog_item_id' => $catalogItem->id,
                'category_id' => $catalogItem->category_id,
                'quantity' => $quantity,
                'unit_price' => $calculation['unit_price'],
                'iva_amount' => $calculation['iva_amount'],
                'total' => $calculation['total'],
                'account_id' => $account->id,
                'period' => $period,
                'is_planned' => $data['is_planned'] ?? false,
                'purchased_at' => now(),
            ]);

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs($calculation['total']),
                'description' => "Purchase: {$catalogItem->name} x{$quantity}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $account->decrement('balance', abs($calculation['total']));

            return $purchase->fresh()->load(['catalogItem', 'category', 'account']);
        });
    }

    public function logPurchaseFromPlannedItem(PlannedItem $plannedItem, int $accountId): Purchase
    {
        if ($plannedItem->is_purchased) {
            throw new \InvalidArgumentException('This planned item has already been purchased.');
        }

        $purchase = $this->logPurchase([
            'catalog_item_id' => $plannedItem->catalog_item_id,
            'account_id' => $accountId,
            'quantity' => $plannedItem->quantity,
            'period' => $plannedItem->period,
            'is_planned' => true,
        ]);

        $plannedItem->update([
            'is_purchased' => true,
            'purchase_id' => $purchase->id,
        ]);

        return $purchase;
    }

    public function deletePurchase(Purchase $purchase): void
    {
        DB::transaction(function () use ($purchase) {
            $account = Account::findOrFail($purchase->account_id);

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs((float) $purchase->total),
                'description' => "Reverted purchase: {$purchase->catalogItem->name}",
                'type' => 'expense',
                'period' => $purchase->period,
            ]);

            $account->increment('balance', abs((float) $purchase->total));

            $plannedItem = PlannedItem::where('purchase_id', $purchase->id)->first();
            if ($plannedItem) {
                $plannedItem->update([
                    'is_purchased' => false,
                    'purchase_id' => null,
                ]);
            }

            $purchase->delete();
        });
    }

    public function getSummaryForPeriod(string $period, ?int $categoryId = null): array
    {
        $query = Purchase::where('period', $period);

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        $purchases = $query->get();

        return [
            'total_spent' => (float) $purchases->sum('total'),
            'total_iva' => (float) $purchases->sum('iva_amount'),
            'purchase_count' => $purchases->count(),
            'planned_count' => $purchases->where('is_planned', true)->count(),
            'unplanned_count' => $purchases->where('is_planned', false)->count(),
        ];
    }

    public function getCategorySummaries(string $period, array $categoryIds): array
    {
        $purchases = Purchase::whereIn('category_id', $categoryIds)
            ->where('period', $period)
            ->get();

        $summaries = [];

        foreach ($categoryIds as $categoryId) {
            $categoryPurchases = $purchases->where('category_id', $categoryId);
            $summaries[$categoryId] = [
                'total_spent' => (float) $categoryPurchases->sum('total'),
                'total_iva' => (float) $categoryPurchases->sum('iva_amount'),
                'purchase_count' => $categoryPurchases->count(),
            ];
        }

        return $summaries;
    }
}
