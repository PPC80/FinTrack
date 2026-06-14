<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Purchase extends Model
{
    use HasFactory;

    protected $fillable = [
        'catalog_item_id',
        'category_id',
        'quantity',
        'unit_price',
        'iva_amount',
        'total',
        'account_id',
        'period',
        'is_planned',
        'purchased_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'iva_amount' => 'decimal:2',
            'total' => 'decimal:2',
            'is_planned' => 'boolean',
            'purchased_at' => 'datetime',
        ];
    }

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class, 'catalog_item_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function plannedItem(): HasOne
    {
        return $this->hasOne(PlannedItem::class, 'purchase_id');
    }
}
