<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MiscExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'is_guilty' => $this->is_guilty,
            'is_taxi' => $this->is_taxi,
            'is_bank_transfer' => $this->is_bank_transfer,
            'is_international' => $this->is_international,
            'commission_amount' => (float) $this->commission_amount,
            'account_id' => $this->account_id,
            'account' => $this->whenLoaded('account', fn () => new AccountResource($this->account)),
            'period' => $this->period,
            'spent_at' => $this->spent_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
