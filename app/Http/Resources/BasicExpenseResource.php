<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BasicExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new ExpenseCategoryResource($this->category)),
            'template_id' => $this->template_id,
            'name' => $this->name,
            'amount' => (float) $this->amount,
            'is_paid' => $this->is_paid,
            'paid_at' => $this->paid_at?->toISOString(),
            'account_id' => $this->account_id,
            'account' => $this->whenLoaded('account', fn () => new AccountResource($this->account)),
            'period' => $this->period,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
