<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'catalog_item_id' => ['required', 'integer', 'exists:catalog_items,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
            'is_bank_transfer' => ['boolean'],
            'is_international' => ['boolean'],
        ];
    }
}
