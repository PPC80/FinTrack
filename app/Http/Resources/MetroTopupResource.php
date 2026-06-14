<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MetroTopupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'amount' => (float) $this->amount,
            'source_account_id' => $this->source_account_id,
            'source_account' => $this->whenLoaded('sourceAccount', fn () => new AccountResource($this->sourceAccount)),
            'period' => $this->period,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
