import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { AppLayout } from '@/Components/Layout/AppLayout';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { formatCurrency } from '@/lib/format';
import {
    type Account,
    type AccountTransfer,
    type PageProps,
    type TransferType,
} from '@/types';

interface TransfersPageProps extends PageProps {
    transfers: { data: AccountTransfer[] };
    accounts: { data: Account[] };
    currentPeriod: string;
}

const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
    cross_bank_transfer: 'Cross-bank Transfer',
    same_bank_atm: 'Same Bank ATM (no fee)',
    other_bank_atm: 'Other Bank ATM',
    store_withdrawal: 'Store Withdrawal',
};

export default function TransfersIndex() {
    const { transfers, accounts, currentPeriod, flash } = usePage<TransfersPageProps>().props;

    const transferList = transfers.data;
    const accountList = accounts.data;
    const bankAccounts = accountList.filter((account) => account.type === 'bank');
    const cashAccount = accountList.find((account) => account.type === 'cash');
    const [deletingTransfer, setDeletingTransfer] = useState<AccountTransfer | null>(null);

    const defaultSource = bankAccounts.find((account) => account.is_default) ?? bankAccounts[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        source_account_id: defaultSource?.id?.toString() ?? '',
        destination_account_id: cashAccount?.id?.toString() ?? '',
        amount: '',
        transfer_type: 'cross_bank_transfer' as TransferType,
        description: '',
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    function handlePeriodChange(period: string) {
        router.get(
            route('transfers.index', { period }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('transfers.store'), {
            onSuccess: () => reset('amount', 'description'),
            preserveScroll: true,
        });
    }

    function handleDelete() {
        if (!deletingTransfer) return;
        router.delete(route('transfers.destroy', deletingTransfer.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingTransfer(null),
        });
    }

    const selectedSource = accountList.find((account) => account.id.toString() === data.source_account_id);
    const estimatedCommission = selectedSource
        ? getCommissionPreview(selectedSource, data.transfer_type)
        : 0;

    return (
        <AppLayout>
            <Head title="Transfers" />

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Transfers & Withdrawals</h2>
                    <p className="text-muted-foreground">
                        Move money between accounts or make cash withdrawals.
                    </p>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="source">From</Label>
                                <Select
                                    value={data.source_account_id}
                                    onValueChange={(value) => setData('source_account_id', value)}
                                >
                                    <SelectTrigger id="source">
                                        <SelectValue placeholder="Source account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bankAccounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.source_account_id && (
                                    <p className="text-xs text-destructive">{errors.source_account_id}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="destination">To</Label>
                                <Select
                                    value={data.destination_account_id}
                                    onValueChange={(value) => setData('destination_account_id', value)}
                                >
                                    <SelectTrigger id="destination">
                                        <SelectValue placeholder="Destination account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accountList
                                            .filter((account) => account.id.toString() !== data.source_account_id)
                                            .map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.destination_account_id && (
                                    <p className="text-xs text-destructive">{errors.destination_account_id}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={data.amount}
                                    onChange={(event) => setData('amount', event.target.value)}
                                    disabled={processing}
                                />
                                {errors.amount && (
                                    <p className="text-xs text-destructive">{errors.amount}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="type">Type</Label>
                                <Select
                                    value={data.transfer_type}
                                    onValueChange={(value) => setData('transfer_type', value as TransferType)}
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(TRANSFER_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Note (optional)</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(event) => setData('description', event.target.value)}
                                    placeholder="Optional note"
                                    disabled={processing}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            {estimatedCommission > 0 && (
                                <p className="text-sm text-warning">
                                    Commission: {formatCurrency(estimatedCommission)}
                                </p>
                            )}
                            {estimatedCommission === 0 && (
                                <p className="text-sm text-muted-foreground">No commission</p>
                            )}
                            <Button
                                type="submit"
                                disabled={processing || !data.amount || !data.source_account_id || !data.destination_account_id}
                            >
                                {processing ? (
                                    <Loader2 className="animate-spin" data-icon="inline-start" />
                                ) : (
                                    <Plus data-icon="inline-start" />
                                )}
                                Transfer
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold">History</h3>
                    {transferList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                            <p className="text-muted-foreground">No transfers this month.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transferList.map((transfer) => (
                                <div
                                    key={transfer.id}
                                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <span>{transfer.source_account.name}</span>
                                                <ArrowRight className="size-3 text-muted-foreground" />
                                                <span>{transfer.destination_account.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{TRANSFER_TYPE_LABELS[transfer.transfer_type]}</span>
                                                {transfer.commission_amount > 0 && (
                                                    <>
                                                        <span>&middot;</span>
                                                        <span className="text-warning">fee: {formatCurrency(transfer.commission_amount)}</span>
                                                    </>
                                                )}
                                                {transfer.description && (
                                                    <>
                                                        <span>&middot;</span>
                                                        <span>{transfer.description}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-semibold tabular-nums">
                                            {formatCurrency(transfer.amount)}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => setDeletingTransfer(transfer)}
                                            aria-label="Reverse transfer"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog
                open={deletingTransfer !== null}
                onOpenChange={(open) => { if (!open) setDeletingTransfer(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reverse this transfer?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move {formatCurrency(deletingTransfer?.amount ?? 0)} back
                            from {deletingTransfer?.destination_account.name} to {deletingTransfer?.source_account.name}
                            and restore any commission charged.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Reverse</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

function getCommissionPreview(account: Account, transferType: TransferType): number {
    switch (transferType) {
        case 'cross_bank_transfer':
            return account.cross_bank_transfer_fee ?? 0;
        case 'other_bank_atm':
            return account.withdrawal_atm_fee ?? 0;
        case 'store_withdrawal':
            return account.withdrawal_store_fee ?? 0;
        case 'same_bank_atm':
            return 0;
        default:
            return 0;
    }
}
