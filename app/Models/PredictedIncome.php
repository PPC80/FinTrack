<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PredictedIncome extends Model
{
    protected $fillable = [
        'description',
        'amount',
        'expected_date',
        'is_received',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expected_date' => 'date',
            'is_received' => 'boolean',
        ];
    }

    public function scopePending($query)
    {
        return $query->where('is_received', false);
    }

    public function scopeReceived($query)
    {
        return $query->where('is_received', true);
    }
}
