<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MiscExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'amount',
        'is_guilty',
        'is_taxi',
        'is_bank_transfer',
        'is_international',
        'commission_amount',
        'account_id',
        'period',
        'spent_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'is_guilty' => 'boolean',
            'is_taxi' => 'boolean',
            'is_bank_transfer' => 'boolean',
            'is_international' => 'boolean',
            'spent_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }

    public function scopeGuilty($query)
    {
        return $query->where('is_guilty', true);
    }
}
