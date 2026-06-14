<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransportMode extends Model
{
    use HasFactory;

    protected $table = 'transport_modes';

    protected $fillable = [
        'name',
        'fare',
        'deducts_from_metro',
        'default_account_id',
        'sort_order',
        'is_active',
        'is_taxi',
    ];

    protected function casts(): array
    {
        return [
            'fare' => 'decimal:2',
            'deducts_from_metro' => 'boolean',
            'is_active' => 'boolean',
            'is_taxi' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function defaultAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'default_account_id');
    }

    public function trips(): HasMany
    {
        return $this->hasMany(Trip::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }
}
