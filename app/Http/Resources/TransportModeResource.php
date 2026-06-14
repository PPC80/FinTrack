<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransportModeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'fare' => (float) $this->fare,
            'deducts_from_metro' => $this->deducts_from_metro,
            'default_account_id' => $this->default_account_id,
            'default_account' => $this->whenLoaded('defaultAccount', fn () => new AccountResource($this->defaultAccount)),
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'is_taxi' => $this->is_taxi,
            'trip_count' => $this->whenCounted('trips', $this->trips_count),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
