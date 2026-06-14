<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountTransferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_account_id' => ['required', 'integer', 'exists:accounts,id'],
            'destination_account_id' => ['required', 'integer', 'exists:accounts,id', 'different:source_account_id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'transfer_type' => ['required', 'string', 'in:cross_bank_transfer,same_bank_atm,other_bank_atm,store_withdrawal'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
