<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExpenseCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'default_account_id',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function defaultAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'default_account_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(BasicExpenseTemplate::class, 'category_id');
    }

    public function basicExpenses(): HasMany
    {
        return $this->hasMany(BasicExpense::class, 'category_id');
    }

    public function catalogItems(): HasMany
    {
        return $this->hasMany(CatalogItem::class, 'category_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class, 'category_id');
    }

    public function isFixed(): bool
    {
        return $this->type === 'fixed';
    }

    public function isItemBased(): bool
    {
        return $this->type === 'item_based';
    }
}
