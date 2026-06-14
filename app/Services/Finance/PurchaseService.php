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
        $isBankTransfer = $data['is_bank_transfer'] ?? false;
        $isInternational = $data['is_international'] ?? false;

        $calculation = $catalogItem->calculateTotal($quantity);
        $commission = $this->calculateCommission($account, (float) $calculation['total'], $isBankTransfer, $isInternational);
        $totalDeducted = $calculation['total'] + $commission;

        return DB::transaction(function () use ($catalogItem, $account, $quantity, $period, $calculation, $data, $isBankTransfer, $isInternational, $commission, $totalDeducted) {
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
                'is_bank_transfer' => $isBankTransfer,
                'is_international' => $isInternational,
                'commission_amount' => $commission,
                'purchased_at' => now(),
            ]);

            $commissionNote = $commission > 0 ? " (fee: \${$commission})" : '';
            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -abs($totalDeducted),
                'description' => "Purchase: {$catalogItem->name} x{$quantity}{$commissionNote}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $account->decrement('balance', abs($totalDeducted));

            return $purchase->fresh()->load(['catalogItem', 'category', 'account']);
        });
    }

    private function calculateCommission(Account $account, float $amount, bool $isBankTransfer, bool $isInternational): float
    {
        $commission = 0.0;

        if ($isBankTransfer) {
            $commission += (float) ($account->cross_bank_transfer_fee ?? 0);
        }

        if ($isInternational) {
            $ivaRate = (float) ($account->international_iva_rate ?? 0);
            $isdRate = (float) ($account->isd_rate ?? 0);
            $commission += $amount * ($ivaRate / 100);
            $commission += $amount * ($isdRate / 100);
        }

        return round($commission, 2);
    }

    public function logPurchaseFromPlannedItem(PlannedItem $plannedItem, int $accountId, bool $isBankTransfer = false, bool $isInternational = false): Purchase
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
            'is_bank_transfer' => $isBankTransfer,
            'is_international' => $isInternational,
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
            $totalRestored = (float) $purchase->total + (float) $purchase->commission_amount;

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => abs($totalRestored),
                'description' => "Reverted purchase: {$purchase->catalogItem->name}",
                'type' => 'adjustment',
                'period' => $purchase->period,
            ]);

            $account->increment('balance', abs($totalRestored));

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
