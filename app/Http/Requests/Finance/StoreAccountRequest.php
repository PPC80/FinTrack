<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'initial_balance' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
            'is_default' => ['boolean'],
        ];
    }
}
