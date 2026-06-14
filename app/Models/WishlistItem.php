<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    protected $fillable = [
        'name',
        'price',
        'url',
        'priority',
        'is_purchased',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'priority' => 'integer',
            'is_purchased' => 'boolean',
        ];
    }

    public function scopePending($query)
    {
        return $query->where('is_purchased', false);
    }

    public function scopePurchased($query)
    {
        return $query->where('is_purchased', true);
    }
}
