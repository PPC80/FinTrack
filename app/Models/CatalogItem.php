<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CatalogItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'price',
        'has_iva',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'has_iva' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class, 'catalog_item_id');
    }

    public function plannedItems(): HasMany
    {
        return $this->hasMany(PlannedItem::class, 'catalog_item_id');
    }

    public function calculateTotal(int $quantity = 1): array
    {
        $ivaRate = (float) config('fintrack.iva_rate');
        $subtotal = (float) $this->price * $quantity;
        $ivaAmount = $this->has_iva ? round($subtotal * $ivaRate, 2) : 0;
        $total = round($subtotal + $ivaAmount, 2);

        return [
            'unit_price' => (float) $this->price,
            'quantity' => $quantity,
            'iva_amount' => $ivaAmount,
            'total' => $total,
        ];
    }
}
