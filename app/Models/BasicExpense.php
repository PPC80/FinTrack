<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BasicExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'template_id',
        'name',
        'amount',
        'is_paid',
        'paid_at',
        'account_id',
        'period',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_paid' => 'boolean',
            'paid_at' => 'datetime',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(BasicExpenseTemplate::class, 'template_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function getEffectiveAccountId(): ?int
    {
        return $this->account_id ?? $this->category?->default_account_id;
    }
}
