<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class AdjustBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'balance' => ['required', 'numeric', 'min:0', 'max:999999999999.99'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
