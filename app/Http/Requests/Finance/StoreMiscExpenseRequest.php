<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreMiscExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'is_guilty' => ['boolean'],
            'is_taxi' => ['boolean'],
            'is_bank_transfer' => ['boolean'],
            'is_international' => ['boolean'],
            'account_id' => ['required', 'integer', 'exists:accounts,id'],
        ];
    }
}
