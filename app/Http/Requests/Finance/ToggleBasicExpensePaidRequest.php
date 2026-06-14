<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class ToggleBasicExpensePaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => ['required_if:is_paid,true', 'nullable', 'integer', 'exists:accounts,id'],
            'is_paid' => ['required', 'boolean'],
            'payment_method' => ['nullable', 'string', 'in:direct,service_payment,bank_transfer,international'],
        ];
    }
}
