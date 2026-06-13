<?php

use App\Http\Controllers\Finance\AccountController;
use App\Http\Controllers\Finance\BasicExpenseController;
use App\Http\Controllers\Finance\ExpenseCategoryController;
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
    });
});

require __DIR__.'/auth.php';
