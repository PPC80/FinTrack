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
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'is_default' => 'boolean',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(AccountTransaction::class);
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
