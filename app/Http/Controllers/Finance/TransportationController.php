<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreMetroTopupRequest;
use App\Http\Requests\Finance\StoreTransportModeRequest;
use App\Http\Requests\Finance\UpdateTransportModeRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\MetroTopupResource;
use App\Http\Resources\TransportModeResource;
use App\Http\Resources\TripResource;
use App\Models\Account;
use App\Models\TransportMode;
use App\Models\Trip;
use App\Services\Finance\TransportationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransportationController extends Controller
{
    public function __construct(
        private readonly TransportationService $transportationService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        $modes = $this->transportationService->getModesWithTripCounts($period);
        $trips = $this->transportationService->getTripsForPeriod($period);
        $topups = $this->transportationService->getTopupsForPeriod($period);
        $summary = $this->transportationService->getSummaryForPeriod($period);
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();
        $metroBalance = (float) Account::where('type', 'metro_card')->value('balance') ?? 0;

        return Inertia::render('Finance/Transportation/Index', [
            'modes' => TransportModeResource::collection($modes),
            'trips' => TripResource::collection($trips),
            'topups' => MetroTopupResource::collection($topups),
            'summary' => $summary,
            'accounts' => AccountResource::collection($accounts),
            'metroBalance' => $metroBalance,
            'currentPeriod' => $period,
        ]);
    }

    public function storeMode(StoreTransportModeRequest $request): RedirectResponse
    {
        $this->transportationService->createMode($request->validated());

        return redirect()->back()
            ->with('success', 'Transport mode created.');
    }

    public function updateMode(UpdateTransportModeRequest $request, TransportMode $transportMode): RedirectResponse
    {
        $this->transportationService->updateMode($transportMode, $request->validated());

        return redirect()->back()
            ->with('success', 'Transport mode updated.');
    }

    public function destroyMode(TransportMode $transportMode): RedirectResponse
    {
        $this->transportationService->deleteMode($transportMode);

        return redirect()->back()
            ->with('success', 'Transport mode removed.');
    }

    public function logTrip(TransportMode $transportMode): RedirectResponse
    {
        $result = $this->transportationService->logTrip($transportMode);

        if ($result['balance_warning']) {
            return redirect()->back()
                ->with('success', 'Trip logged.')
                ->with('warning', 'Metro card balance is insufficient. Consider topping up.');
        }

        return redirect()->back()
            ->with('success', 'Trip logged.');
    }

    public function destroyTrip(Trip $trip): RedirectResponse
    {
        $this->transportationService->deleteTrip($trip);

        return redirect()->back()
            ->with('success', 'Trip removed and balance restored.');
    }

    public function storeTopup(StoreMetroTopupRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $sourceAccount = Account::findOrFail($validated['source_account_id']);

        $this->transportationService->logMetroTopup(
            (float) $validated['amount'],
            $sourceAccount,
        );

        return redirect()->back()
            ->with('success', 'Metro card topped up.');
    }
}
