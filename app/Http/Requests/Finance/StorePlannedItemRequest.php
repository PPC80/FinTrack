<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StorePlannedItemRequest extends FormRequest
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
        ];
    }
}
