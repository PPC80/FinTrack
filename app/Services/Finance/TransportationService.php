<?php

namespace App\Services\Finance;

use App\Models\Account;
use App\Models\AccountTransaction;
use App\Models\MetroTopup;
use App\Models\TransportMode;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;

class TransportationService
{
    public function createMode(array $data): TransportMode
    {
        $maxSort = TransportMode::max('sort_order') ?? 0;

        return TransportMode::create([
            'name' => $data['name'],
            'fare' => $data['fare'],
            'deducts_from_metro' => $data['deducts_from_metro'] ?? false,
            'default_account_id' => $data['default_account_id'] ?? null,
            'sort_order' => $data['sort_order'] ?? $maxSort + 1,
            'is_active' => true,
        ]);
    }

    public function updateMode(TransportMode $mode, array $data): TransportMode
    {
        $mode->update([
            'name' => $data['name'],
            'fare' => $data['fare'],
            'deducts_from_metro' => $data['deducts_from_metro'] ?? $mode->deducts_from_metro,
            'default_account_id' => $data['default_account_id'] ?? $mode->default_account_id,
            'sort_order' => $data['sort_order'] ?? $mode->sort_order,
        ]);

        return $mode->fresh();
    }

    public function deleteMode(TransportMode $mode): void
    {
        $mode->update(['is_active' => false]);
    }

    /**
     * @return array{trip: Trip, balance_warning: bool}
     */
    public function logTrip(TransportMode $mode): array
    {
        return DB::transaction(function () use ($mode) {
            $balanceWarning = false;
            $period = now()->format('Y-m');

            if ($mode->deducts_from_metro) {
                $account = Account::where('type', 'metro_card')->firstOrFail();

                if ((float) $account->balance < (float) $mode->fare) {
                    $balanceWarning = true;
                }
            } else {
                $account = $mode->defaultAccount
                    ?? Account::where('is_default', true)->firstOrFail();
            }

            $trip = Trip::create([
                'transport_mode_id' => $mode->id,
                'fare_at_time' => $mode->fare,
                'account_id' => $account->id,
                'period' => $period,
                'taken_at' => now(),
            ]);

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => -$mode->fare,
                'description' => "Trip: {$mode->name}",
                'type' => 'expense',
                'period' => $period,
            ]);

            $account->decrement('balance', $mode->fare);

            return [
                'trip' => $trip,
                'balance_warning' => $balanceWarning,
            ];
        });
    }

    public function deleteTrip(Trip $trip): void
    {
        DB::transaction(function () use ($trip) {
            $account = $trip->account;

            AccountTransaction::create([
                'account_id' => $account->id,
                'amount' => $trip->fare_at_time,
                'description' => "Trip reversal: {$trip->transportMode->name}",
                'type' => 'adjustment',
                'period' => $trip->period,
            ]);

            $account->increment('balance', $trip->fare_at_time);

            $trip->delete();
        });
    }

    public function logMetroTopup(float $amount, Account $sourceAccount): MetroTopup
    {
        return DB::transaction(function () use ($amount, $sourceAccount) {
            $metroCard = Account::where('type', 'metro_card')->firstOrFail();
            $period = now()->format('Y-m');

            $topup = MetroTopup::create([
                'amount' => $amount,
                'source_account_id' => $sourceAccount->id,
                'period' => $period,
            ]);

            AccountTransaction::create([
                'account_id' => $metroCard->id,
                'amount' => $amount,
                'description' => 'Metro card top-up',
                'type' => 'top_up',
                'period' => $period,
            ]);

            $metroCard->increment('balance', $amount);

            AccountTransaction::create([
                'account_id' => $sourceAccount->id,
                'amount' => -$amount,
                'description' => 'Metro card top-up',
                'type' => 'expense',
                'period' => $period,
            ]);

            $sourceAccount->decrement('balance', $amount);

            return $topup;
        });
    }

    public function getModesWithTripCounts(string $period): \Illuminate\Database\Eloquent\Collection
    {
        return TransportMode::active()
            ->ordered()
            ->with('defaultAccount')
            ->withCount(['trips' => fn ($query) => $query->forPeriod($period)])
            ->get();
    }

    public function getTripsForPeriod(string $period): \Illuminate\Database\Eloquent\Collection
    {
        return Trip::forPeriod($period)
            ->with(['transportMode', 'account'])
            ->orderByDesc('taken_at')
            ->get();
    }

    public function getTopupsForPeriod(string $period): \Illuminate\Database\Eloquent\Collection
    {
        return MetroTopup::forPeriod($period)
            ->with('sourceAccount')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getSummaryForPeriod(string $period): array
    {
        $trips = Trip::forPeriod($period)->get();

        $totalTrips = $trips->count();
        $totalCost = (float) $trips->sum('fare_at_time');

        $modeCounts = $trips->groupBy('transport_mode_id')->map(fn ($group) => [
            'count' => $group->count(),
            'cost' => (float) $group->sum('fare_at_time'),
        ]);

        $metroTopups = MetroTopup::forPeriod($period)->sum('amount');

        return [
            'total_trips' => $totalTrips,
            'total_cost' => $totalCost,
            'total_topups' => (float) $metroTopups,
            'mode_breakdown' => $modeCounts->toArray(),
        ];
    }
}
