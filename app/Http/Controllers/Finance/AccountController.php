<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\AdjustBalanceRequest;
use App\Http\Requests\Finance\MetroTopUpRequest;
use App\Http\Requests\Finance\StoreAccountRequest;
use App\Http\Requests\Finance\UpdateAccountRequest;
use App\Http\Resources\AccountResource;
use App\Models\Account;
use App\Services\Finance\AccountService;
use App\Services\Finance\MetroCardService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(
        private readonly AccountService $accountService,
        private readonly MetroCardService $metroCardService,
    ) {}

    public function index(): Response
    {
        $accounts = Account::orderByRaw("
            CASE type
                WHEN 'cash' THEN 1
                WHEN 'bank' THEN 2
                WHEN 'metro_card' THEN 3
            END
        ")->get();

        $totalBalance = $this->accountService->getTotalBalance();
        $metroBalance = $this->accountService->getMetroBalance();

        return Inertia::render('Finance/Accounts/Index', [
            'accounts' => AccountResource::collection($accounts),
            'totalBalance' => $totalBalance,
            'metroBalance' => $metroBalance,
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $this->accountService->createAccount(
            name: $request->validated('name'),
            initialBalance: (float) $request->validated('initial_balance'),
            isDefault: (bool) $request->validated('is_default', false),
        );

        return redirect()->route('accounts.index')
            ->with('success', 'Account created successfully.');
    }

    public function update(UpdateAccountRequest $request, Account $account): RedirectResponse
    {
        $this->accountService->updateAccount(
            account: $account,
            name: $request->validated('name'),
            isDefault: (bool) $request->validated('is_default', false),
        );

        return redirect()->route('accounts.index')
            ->with('success', 'Account updated successfully.');
    }

    public function adjustBalance(AdjustBalanceRequest $request, Account $account): RedirectResponse
    {
        $this->accountService->adjustBalance(
            account: $account,
            newBalance: (float) $request->validated('balance'),
            description: $request->validated('description'),
        );

        return redirect()->route('accounts.index')
            ->with('success', 'Balance adjusted successfully.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        if (! $account->isDeletable()) {
            return redirect()->route('accounts.index')
                ->with('error', 'This account cannot be deleted.');
        }

        $this->accountService->deleteAccount($account);

        return redirect()->route('accounts.index')
            ->with('success', 'Account deleted successfully.');
    }

    public function metroTopUp(MetroTopUpRequest $request): RedirectResponse
    {
        $paymentSource = Account::findOrFail($request->validated('payment_source_id'));

        $this->metroCardService->topUp(
            amount: (float) $request->validated('amount'),
            paymentSource: $paymentSource,
            description: $request->validated('description'),
        );

        return redirect()->route('accounts.index')
            ->with('success', 'Metro card topped up successfully.');
    }
}
