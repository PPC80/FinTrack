<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreTransportModeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'fare' => ['required', 'numeric', 'min:0.01', 'max:99999'],
            'deducts_from_metro' => ['boolean'],
            'default_account_id' => ['nullable', 'exists:accounts,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
