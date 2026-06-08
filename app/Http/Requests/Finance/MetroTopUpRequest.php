<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class MetroTopUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
            'payment_source_id' => ['required', 'exists:accounts,id'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
