<?php

use App\Http\Controllers\Finance\AccountController;
use App\Http\Controllers\Finance\BasicExpenseController;
use App\Http\Controllers\Finance\ExpenseCategoryController;
use App\Http\Controllers\Finance\PurchaseController;
use App\Http\Controllers\Finance\MiscExpenseController;
use App\Http\Controllers\Finance\TransportationController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('finance')->group(function () {
        Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
        Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
        Route::put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
        Route::patch('/accounts/{account}/balance', [AccountController::class, 'adjustBalance'])->name('accounts.adjust-balance');
        Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');
        Route::post('/metro-card/top-up', [AccountController::class, 'metroTopUp'])->name('metro-card.top-up');

        Route::get('/expenses', [BasicExpenseController::class, 'index'])->name('expenses.index');
        Route::post('/expenses/templates', [BasicExpenseController::class, 'storeTemplate'])->name('expenses.templates.store');
        Route::put('/expenses/templates/{template}', [BasicExpenseController::class, 'updateTemplate'])->name('expenses.templates.update');
        Route::delete('/expenses/templates/{template}', [BasicExpenseController::class, 'destroyTemplate'])->name('expenses.templates.destroy');
        Route::patch('/expenses/{expense}/toggle-paid', [BasicExpenseController::class, 'togglePaid'])->name('expenses.toggle-paid');
        Route::patch('/expenses/{expense}/amount', [BasicExpenseController::class, 'updateAmount'])->name('expenses.update-amount');

        Route::post('/expense-categories', [ExpenseCategoryController::class, 'store'])->name('expense-categories.store');
        Route::put('/expense-categories/{category}', [ExpenseCategoryController::class, 'update'])->name('expense-categories.update');
        Route::delete('/expense-categories/{category}', [ExpenseCategoryController::class, 'destroy'])->name('expense-categories.destroy');

        Route::get('/purchases', [PurchaseController::class, 'index'])->name('purchases.index');

        Route::post('/catalog-items', [PurchaseController::class, 'storeCatalogItem'])->name('catalog-items.store');
        Route::put('/catalog-items/{catalogItem}', [PurchaseController::class, 'updateCatalogItem'])->name('catalog-items.update');
        Route::delete('/catalog-items/{catalogItem}', [PurchaseController::class, 'destroyCatalogItem'])->name('catalog-items.destroy');

        Route::post('/purchases/log', [PurchaseController::class, 'storePurchase'])->name('purchases.store');
        Route::delete('/purchases/{purchase}', [PurchaseController::class, 'destroyPurchase'])->name('purchases.destroy');

        Route::post('/planned-items', [PurchaseController::class, 'storePlannedItem'])->name('planned-items.store');
        Route::put('/planned-items/{plannedItem}', [PurchaseController::class, 'updatePlannedItem'])->name('planned-items.update');
        Route::delete('/planned-items/{plannedItem}', [PurchaseController::class, 'destroyPlannedItem'])->name('planned-items.destroy');
        Route::post('/planned-items/{plannedItem}/purchase', [PurchaseController::class, 'purchasePlannedItem'])->name('planned-items.purchase');

        Route::get('/misc-expenses', [MiscExpenseController::class, 'index'])->name('misc-expenses.index');
        Route::post('/misc-expenses', [MiscExpenseController::class, 'store'])->name('misc-expenses.store');
        Route::delete('/misc-expenses/{miscExpense}', [MiscExpenseController::class, 'destroy'])->name('misc-expenses.destroy');

        Route::get('/transportation', [TransportationController::class, 'index'])->name('transportation.index');
        Route::post('/transportation/modes', [TransportationController::class, 'storeMode'])->name('transportation.modes.store');
        Route::put('/transportation/modes/{transportMode}', [TransportationController::class, 'updateMode'])->name('transportation.modes.update');
        Route::delete('/transportation/modes/{transportMode}', [TransportationController::class, 'destroyMode'])->name('transportation.modes.destroy');
        Route::post('/transportation/modes/{transportMode}/trip', [TransportationController::class, 'logTrip'])->name('transportation.trips.store');
        Route::delete('/transportation/trips/{trip}', [TransportationController::class, 'destroyTrip'])->name('transportation.trips.destroy');
        Route::post('/transportation/topups', [TransportationController::class, 'storeTopup'])->name('transportation.topups.store');
    });
});

require __DIR__.'/auth.php';
