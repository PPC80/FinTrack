<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonthlySummary extends Model
{
    protected $fillable = [
        'period',
        'total_income',
        'total_spent',
        'leftover',
        'carry_over_from_previous',
    ];

    protected function casts(): array
    {
        return [
            'total_income' => 'decimal:2',
            'total_spent' => 'decimal:2',
            'leftover' => 'decimal:2',
            'carry_over_from_previous' => 'decimal:2',
        ];
    }
}
