<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreAccountTransferRequest;
use App\Http\Resources\AccountResource;
use App\Http\Resources\AccountTransferResource;
use App\Models\Account;
use App\Models\AccountTransfer;
use App\Services\Finance\AccountTransferService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountTransferController extends Controller
{
    public function __construct(
        private readonly AccountTransferService $transferService,
    ) {}

    public function index(Request $request): Response
    {
        $period = $request->query('period', now()->format('Y-m'));

        $transfers = $this->transferService->getTransfersForPeriod($period);
        $accounts = Account::whereIn('type', ['bank', 'cash'])->orderBy('name')->get();

        return Inertia::render('Finance/Transfers/Index', [
            'transfers' => AccountTransferResource::collection($transfers),
            'accounts' => AccountResource::collection($accounts),
            'currentPeriod' => $period,
        ]);
    }

    public function store(StoreAccountTransferRequest $request): RedirectResponse
    {
        $sourceAccount = Account::findOrFail($request->validated('source_account_id'));
        $destinationAccount = Account::findOrFail($request->validated('destination_account_id'));

        $this->transferService->createTransfer(
            sourceAccount: $sourceAccount,
            destinationAccount: $destinationAccount,
            amount: (float) $request->validated('amount'),
            transferType: $request->validated('transfer_type'),
            description: $request->validated('description'),
        );

        return redirect()->back()
            ->with('success', 'Transfer completed successfully.');
    }

    public function destroy(AccountTransfer $accountTransfer): RedirectResponse
    {
        $this->transferService->deleteTransfer($accountTransfer);

        return redirect()->back()
            ->with('success', 'Transfer reversed and balances restored.');
    }
}
