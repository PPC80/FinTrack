<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlannedItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'catalog_item_id',
        'period',
        'quantity',
        'is_purchased',
        'purchase_id',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'is_purchased' => 'boolean',
        ];
    }

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class, 'catalog_item_id');
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }
}
