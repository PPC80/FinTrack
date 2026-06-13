<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreBasicExpenseTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:expense_categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'default_amount' => ['required', 'numeric', 'min:0.01', 'max:999999999999.99'],
        ];
    }
}
