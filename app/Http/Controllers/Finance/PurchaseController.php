<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\PurchasePlannedItemRequest;
use App\Http\Requests\Finance\StoreCatalogItemRequest;
use App\Http\Requests\Finance\StorePlannedItemRequest;
use App\Http\Requests\Finance\StorePurchaseRequest;
use App\Http\Requests\Finance\UpdateCatalogItemRequest;
use App\Http\Requests\Finance\UpdatePlannedItemRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\CatalogItemResource;
use App\Http\Resources\ExpenseCategoryResource;
use App\Http\Resources\PlannedItemResource;
use App\Http\Resources\PurchaseResource;
use App\Models\Account;
use App\Models\CatalogItem;
use App\Models\CategoryPeriodBudget;
use App\Models\ExpenseCategory;
use App\Models\PlannedItem;
use App\Models\Purchase;
use App\Services\Finance\CatalogItemService;
use App\Services\Finance\ExpenseCategoryService;
use App\Services\Finance\PlannedItemService;
use App\Services\Finance\PurchaseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseController extends Controller
{
    public function __construct(
        private readonly CatalogItemService $catalogItemService,
        private readonly PurchaseService $purchaseService,
        private readonly PlannedItemService $plannedItemService,
        private readonly ExpenseCategoryService $categoryService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));
        $activeCategoryId = $request->query('category') ? (int) $request->query('category') : null;

        $itemBasedCategories = ExpenseCategory::where('type', 'item_based')
            ->orderBy('sort_order')
            ->with('defaultAccount')
            ->get();

        $categoryIds = $itemBasedCategories->pluck('id')->toArray();

        if ($activeCategoryId === null && count($categoryIds) > 0) {
            $activeCategoryId = $categoryIds[0];
        }

        $catalogItems = $this->catalogItemService->getActiveItemsForCategories($categoryIds);
        $purchases = $this->purchaseService->getPurchasesForPeriod($period, $activeCategoryId);
        $plannedItems = $this->plannedItemService->getPlannedItemsForPeriod($period, $activeCategoryId);
        $summary = $this->purchaseService->getSummaryForPeriod($period, $activeCategoryId);
        $categorySummaries = $this->purchaseService->getCategorySummaries($period, $categoryIds);
        $plannedSummary = $this->plannedItemService->getPlannedSummary($period, $activeCategoryId);
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();

        $this->ensureBudgetsCopied($period, $categoryIds);

        $categoryBudgets = CategoryPeriodBudget::where('period', $period)
            ->whereIn('category_id', $categoryIds)
            ->get()
            ->keyBy('category_id')
            ->map(fn ($budget) => (float) $budget->amount)
            ->toArray();

        return Inertia::render('Finance/Purchases/Index', [
            'categories' => ExpenseCategoryResource::collection($itemBasedCategories),
            'catalogItems' => CatalogItemResource::collection($catalogItems),
            'purchases' => PurchaseResource::collection($purchases),
            'plannedItems' => PlannedItemResource::collection($plannedItems),
            'summary' => $summary,
            'categorySummaries' => $categorySummaries,
            'plannedSummary' => $plannedSummary,
            'accounts' => AccountResource::collection($accounts),
            'currentPeriod' => $period,
            'activeCategoryId' => $activeCategoryId,
            'ivaRate' => (float) config('fintrack.iva_rate'),
            'categoryBudgets' => $categoryBudgets,
        ]);
    }

    public function storeCatalogItem(StoreCatalogItemRequest $request): RedirectResponse
    {
        $this->catalogItemService->create($request->validated());

        return redirect()->back()
            ->with('success', 'Item added to catalog.');
    }

    public function updateCatalogItem(UpdateCatalogItemRequest $request, CatalogItem $catalogItem): RedirectResponse
    {
        $this->catalogItemService->update($catalogItem, $request->validated());

        return redirect()->back()
            ->with('success', 'Item updated.');
    }

    public function destroyCatalogItem(CatalogItem $catalogItem): RedirectResponse
    {
        $this->catalogItemService->deactivate($catalogItem);

        return redirect()->back()
            ->with('success', 'Item removed from catalog.');
    }

    public function storePurchase(StorePurchaseRequest $request): RedirectResponse
    {
        $period = $request->query('period', now()->format('Y-m'));

        $this->purchaseService->logPurchase([
            ...$request->validated(),
            'period' => $period,
        ]);

        return redirect()->back()
            ->with('success', 'Purchase logged.');
    }

    public function destroyPurchase(Purchase $purchase): RedirectResponse
    {
        $this->purchaseService->deletePurchase($purchase);

        return redirect()->back()
            ->with('success', 'Purchase removed and balance restored.');
    }

    public function storePlannedItem(StorePlannedItemRequest $request): RedirectResponse
    {
        $period = $request->query('period', now()->format('Y-m'));

        try {
            $this->plannedItemService->addPlannedItem([
                ...$request->validated(),
                'period' => $period,
            ]);
        } catch (\Illuminate\Database\QueryException $exception) {
            return redirect()->back()
                ->with('error', 'This item is already on the planned list for this period.');
        }

        return redirect()->back()
            ->with('success', 'Item added to planned list.');
    }

    public function updatePlannedItem(UpdatePlannedItemRequest $request, PlannedItem $plannedItem): RedirectResponse
    {
        try {
            $this->plannedItemService->updatePlannedItem($plannedItem, $request->validated());
        } catch (\InvalidArgumentException $exception) {
            return redirect()->back()
                ->with('error', $exception->getMessage());
        }

        return redirect()->back()
            ->with('success', 'Planned item updated.');
    }

    public function destroyPlannedItem(PlannedItem $plannedItem): RedirectResponse
    {
        try {
            $this->plannedItemService->removePlannedItem($plannedItem);
        } catch (\InvalidArgumentException $exception) {
            return redirect()->back()
                ->with('error', $exception->getMessage());
        }

        return redirect()->back()
            ->with('success', 'Item removed from planned list.');
    }

    public function purchasePlannedItem(PurchasePlannedItemRequest $request, PlannedItem $plannedItem): RedirectResponse
    {
        try {
            $this->purchaseService->logPurchaseFromPlannedItem(
                $plannedItem,
                (int) $request->validated('account_id'),
                (bool) $request->validated('is_bank_transfer', false),
                (bool) $request->validated('is_international', false),
            );
        } catch (\InvalidArgumentException $exception) {
            return redirect()->back()
                ->with('error', $exception->getMessage());
        }

        return redirect()->back()
            ->with('success', 'Planned item marked as bought.');
    }

    private function ensureBudgetsCopied(string $period, array $categoryIds): void
    {
        $existingBudgets = CategoryPeriodBudget::where('period', $period)
            ->whereIn('category_id', $categoryIds)
            ->pluck('category_id')
            ->toArray();

        $missingCategoryIds = array_diff($categoryIds, $existingBudgets);

        if (empty($missingCategoryIds)) {
            return;
        }

        $previousPeriod = $this->getPreviousPeriod($period);
        $previousBudgets = CategoryPeriodBudget::where('period', $previousPeriod)
            ->whereIn('category_id', $missingCategoryIds)
            ->get();

        foreach ($previousBudgets as $budget) {
            CategoryPeriodBudget::create([
                'category_id' => $budget->category_id,
                'period' => $period,
                'amount' => $budget->amount,
            ]);
        }
    }

    private function getPreviousPeriod(string $period): string
    {
        $year = (int) substr($period, 0, 4);
        $month = (int) substr($period, 5, 2);

        if ($month === 1) {
            return ($year - 1).'-12';
        }

        return $year.'-'.str_pad($month - 1, 2, '0', STR_PAD_LEFT);
    }
}
