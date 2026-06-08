import { Head, usePage } from '@inertiajs/react';
import { CreditCard, Plus, TrendingUp, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AccountCard } from '@/Components/Finance/AccountCard';
import { AdjustBalanceDialog } from '@/Components/Finance/AdjustBalanceDialog';
import { CreateAccountDialog } from '@/Components/Finance/CreateAccountDialog';
import { DeleteAccountDialog } from '@/Components/Finance/DeleteAccountDialog';
import { EditAccountDialog } from '@/Components/Finance/EditAccountDialog';
import { MetroTopUpDialog } from '@/Components/Finance/MetroTopUpDialog';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type Account, type PageProps } from '@/types';

interface AccountsPageProps extends PageProps {
    accounts: { data: Account[] };
    totalBalance: number;
    metroBalance: number;
}

export default function AccountsIndex() {
    const { accounts, totalBalance, metroBalance, flash } = usePage<AccountsPageProps>().props;

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [adjustingAccount, setAdjustingAccount] = useState<Account | null>(null);
    const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
    const [showMetroTopUp, setShowMetroTopUp] = useState(false);

    const accountList = accounts.data;
    const paymentSources = accountList.filter(
        (account) => account.type !== 'metro_card',
    );

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    function handleEdit(account: Account) {
        setEditingAccount(account);
    }

    function handleAdjustBalance(account: Account) {
        setAdjustingAccount(account);
    }

    function handleDelete(account: Account) {
        setDeletingAccount(account);
    }

    return (
        <AppLayout>
            <Head title="Accounts" />

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Accounts</h2>
                        <p className="text-muted-foreground">
                            Manage your bank accounts and balances.
                        </p>
                    </div>
                    <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus data-icon="inline-start" />
                        Add Account
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <Wallet className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Balance</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(totalBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                                <TrendingUp className="size-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Available Money</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(totalBalance)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <CreditCard className="size-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Metro Card</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(metroBalance)}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowMetroTopUp(true)}
                            >
                                Top Up
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {accountList.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onEdit={handleEdit}
                            onAdjustBalance={handleAdjustBalance}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>

            <CreateAccountDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <EditAccountDialog
                account={editingAccount}
                open={!!editingAccount}
                onOpenChange={(open) => !open && setEditingAccount(null)}
            />

            <AdjustBalanceDialog
                account={adjustingAccount}
                open={!!adjustingAccount}
                onOpenChange={(open) => !open && setAdjustingAccount(null)}
            />

            <DeleteAccountDialog
                account={deletingAccount}
                open={!!deletingAccount}
                onOpenChange={(open) => !open && setDeletingAccount(null)}
            />

            <MetroTopUpDialog
                open={showMetroTopUp}
                onOpenChange={setShowMetroTopUp}
                paymentSources={paymentSources}
            />
        </AppLayout>
    );
}
