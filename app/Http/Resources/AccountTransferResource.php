<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountTransferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source_account_id' => $this->source_account_id,
            'source_account' => $this->whenLoaded('sourceAccount', fn () => new AccountResource($this->sourceAccount)),
            'destination_account_id' => $this->destination_account_id,
            'destination_account' => $this->whenLoaded('destinationAccount', fn () => new AccountResource($this->destinationAccount)),
            'amount' => (float) $this->amount,
            'commission_amount' => (float) $this->commission_amount,
            'transfer_type' => $this->transfer_type,
            'description' => $this->description,
            'period' => $this->period,
            'transferred_at' => $this->transferred_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
