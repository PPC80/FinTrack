<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'balance',
        'is_default',
        'service_payment_fee',
        'cross_bank_transfer_fee',
        'withdrawal_atm_fee',
        'withdrawal_store_fee',
        'international_iva_rate',
        'isd_rate',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'is_default' => 'boolean',
            'service_payment_fee' => 'decimal:2',
            'cross_bank_transfer_fee' => 'decimal:2',
            'withdrawal_atm_fee' => 'decimal:2',
            'withdrawal_store_fee' => 'decimal:2',
            'international_iva_rate' => 'decimal:2',
            'isd_rate' => 'decimal:2',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(AccountTransaction::class);
    }

    public function incomeEntries(): HasMany
    {
        return $this->hasMany(IncomeEntry::class);
    }

    public function isBank(): bool
    {
        return $this->type === 'bank';
    }

    public function isCash(): bool
    {
        return $this->type === 'cash';
    }

    public function isMetroCard(): bool
    {
        return $this->type === 'metro_card';
    }

    public function isDeletable(): bool
    {
        return $this->isBank();
    }
}
