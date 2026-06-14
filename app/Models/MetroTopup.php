<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetroTopup extends Model
{
    use HasFactory;

    protected $table = 'metro_topups';

    public $timestamps = false;

    protected $fillable = [
        'amount',
        'source_account_id',
        'period',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function sourceAccount(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'source_account_id');
    }

    public function scopeForPeriod($query, string $period)
    {
        return $query->where('period', $period);
    }
}
