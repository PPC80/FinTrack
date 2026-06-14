<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'balance' => (float) $this->balance,
            'is_default' => $this->is_default,
            'is_deletable' => $this->isDeletable(),
            'service_payment_fee' => $this->service_payment_fee ? (float) $this->service_payment_fee : null,
            'cross_bank_transfer_fee' => $this->cross_bank_transfer_fee ? (float) $this->cross_bank_transfer_fee : null,
            'withdrawal_atm_fee' => $this->withdrawal_atm_fee ? (float) $this->withdrawal_atm_fee : null,
            'withdrawal_store_fee' => $this->withdrawal_store_fee ? (float) $this->withdrawal_store_fee : null,
            'international_iva_rate' => $this->international_iva_rate ? (float) $this->international_iva_rate : null,
            'isd_rate' => $this->isd_rate ? (float) $this->isd_rate : null,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
