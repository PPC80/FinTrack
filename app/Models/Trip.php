<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Trip extends Model
{
    use HasFactory;

    protected $table = 'trips';

    public $timestamps = false;

    protected $fillable = [
        'transport_mode_id',
        'fare_at_time',
        'account_id',
        'period',
        'taken_at',
    ];

    protected function casts(): array
    {
        return [
            'fare_at_time' => 'decimal:2',
            'taken_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function transportMode(): BelongsTo
    {
        return $this->belongsTo(TransportMode::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }
}
