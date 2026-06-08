<?php

use App\Http\Controllers\Finance\AccountController;
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
    });
});

require __DIR__.'/auth.php';
