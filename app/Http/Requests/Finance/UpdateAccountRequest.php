<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'is_default' => ['boolean'],
            'service_payment_fee' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'cross_bank_transfer_fee' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'withdrawal_atm_fee' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'withdrawal_store_fee' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'international_iva_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'isd_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
