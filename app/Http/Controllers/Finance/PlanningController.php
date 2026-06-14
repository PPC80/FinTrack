<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StorePredictedIncomeRequest;
use App\Http\Requests\Finance\StoreWishlistItemRequest;
use App\Http\Requests\Finance\UpdatePredictedIncomeRequest;
use App\Http\Requests\Finance\UpdateWishlistItemRequest;
use App\Http\Resources\PredictedIncomeResource;
use App\Http\Resources\WishlistItemResource;
use App\Models\PredictedIncome;
use App\Models\WishlistItem;
use App\Services\Finance\PredictedIncomeService;
use App\Services\Finance\WishlistService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function __construct(
        private readonly PredictedIncomeService $predictedIncomeService,
        private readonly WishlistService $wishlistService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Finance/Planning/Index', [
            'predictedIncomes' => PredictedIncomeResource::collection(
                $this->predictedIncomeService->getAll()
            ),
            'wishlistItems' => WishlistItemResource::collection(
                $this->wishlistService->getAll()
            ),
            'summary' => [
                'predicted_income_pending' => $this->predictedIncomeService->getTotalPending(),
                'predicted_income_received' => $this->predictedIncomeService->getTotalReceived(),
                'wishlist_pending' => $this->wishlistService->getTotalPending(),
                'wishlist_purchased' => $this->wishlistService->getTotalPurchased(),
            ],
        ]);
    }

    public function storePredictedIncome(StorePredictedIncomeRequest $request): RedirectResponse
    {
        $this->predictedIncomeService->store($request->validated());

        return redirect()->back()
            ->with('success', 'Predicted income added.');
    }

    public function updatePredictedIncome(UpdatePredictedIncomeRequest $request, PredictedIncome $predictedIncome): RedirectResponse
    {
        $this->predictedIncomeService->update($predictedIncome, $request->validated());

        return redirect()->back()
            ->with('success', 'Predicted income updated.');
    }

    public function togglePredictedIncomeReceived(PredictedIncome $predictedIncome): RedirectResponse
    {
        $result = $this->predictedIncomeService->toggleReceived($predictedIncome);

        $message = $result->is_received
            ? 'Marked as received.'
            : 'Marked as pending.';

        return redirect()->back()
            ->with('success', $message);
    }

    public function destroyPredictedIncome(PredictedIncome $predictedIncome): RedirectResponse
    {
        $this->predictedIncomeService->destroy($predictedIncome);

        return redirect()->back()
            ->with('success', 'Predicted income deleted.');
    }

    public function storeWishlistItem(StoreWishlistItemRequest $request): RedirectResponse
    {
        $this->wishlistService->store($request->validated());

        return redirect()->back()
            ->with('success', 'Wishlist item added.');
    }

    public function updateWishlistItem(UpdateWishlistItemRequest $request, WishlistItem $wishlistItem): RedirectResponse
    {
        $this->wishlistService->update($wishlistItem, $request->validated());

        return redirect()->back()
            ->with('success', 'Wishlist item updated.');
    }

    public function toggleWishlistItemPurchased(WishlistItem $wishlistItem): RedirectResponse
    {
        $result = $this->wishlistService->togglePurchased($wishlistItem);

        $message = $result->is_purchased
            ? 'Marked as purchased.'
            : 'Marked as pending.';

        return redirect()->back()
            ->with('success', $message);
    }

    public function destroyWishlistItem(WishlistItem $wishlistItem): RedirectResponse
    {
        $this->wishlistService->destroy($wishlistItem);

        return redirect()->back()
            ->with('success', 'Wishlist item deleted.');
    }
}
