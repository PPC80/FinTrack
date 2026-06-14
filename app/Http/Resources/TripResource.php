<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TripResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transport_mode_id' => $this->transport_mode_id,
            'transport_mode' => $this->whenLoaded('transportMode', fn () => new TransportModeResource($this->transportMode)),
            'fare_at_time' => (float) $this->fare_at_time,
            'account_id' => $this->account_id,
            'account' => $this->whenLoaded('account', fn () => new AccountResource($this->account)),
            'period' => $this->period,
            'taken_at' => $this->taken_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
