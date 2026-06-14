<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'catalog_item_id' => $this->catalog_item_id,
            'catalog_item' => $this->whenLoaded('catalogItem', fn () => new CatalogItemResource($this->catalogItem)),
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new ExpenseCategoryResource($this->category)),
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'iva_amount' => (float) $this->iva_amount,
            'total' => (float) $this->total,
            'account_id' => $this->account_id,
            'account' => $this->whenLoaded('account', fn () => new AccountResource($this->account)),
            'period' => $this->period,
            'is_planned' => $this->is_planned,
            'purchased_at' => $this->purchased_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
