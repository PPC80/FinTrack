<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccountTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'source_account_id',
        'destination_account_id',
        'amount',
        'commission_amount',
        'transfer_type',
        'description',
        'period',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'transferred_at' => 'datetime',
        ];
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function destinationAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'destination_account_id');
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }
}
