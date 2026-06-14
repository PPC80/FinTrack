<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreWishlistItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:9999999999.99'],
            'url' => ['nullable', 'url', 'max:2048'],
            'priority' => ['nullable', 'integer', 'min:1', 'max:999'],
        ];
    }
}
