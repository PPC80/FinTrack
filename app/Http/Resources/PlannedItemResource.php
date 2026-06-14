<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlannedItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'catalog_item_id' => $this->catalog_item_id,
            'catalog_item' => $this->whenLoaded('catalogItem', fn () => new CatalogItemResource($this->catalogItem)),
            'period' => $this->period,
            'quantity' => $this->quantity,
            'is_purchased' => $this->is_purchased,
            'purchase_id' => $this->purchase_id,
            'purchase' => $this->whenLoaded('purchase', fn () => new PurchaseResource($this->purchase)),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
