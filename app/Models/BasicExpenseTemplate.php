<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BasicExpenseTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'default_amount',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'default_amount' => 'decimal:2',
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function basicExpenses(): HasMany
    {
        return $this->hasMany(BasicExpense::class, 'template_id');
    }
}
