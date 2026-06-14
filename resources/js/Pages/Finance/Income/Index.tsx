import { Head, router, usePage } from '@inertiajs/react';
import { DollarSign } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { ConfirmPastEditDialog } from '@/Components/Finance/ConfirmPastEditDialog';
import { PastMonthBanner } from '@/Components/Finance/PastMonthBanner';
import { AddIncomeForm } from '@/Components/Finance/Income/AddIncomeForm';
import { BudgetSummaryCards } from '@/Components/Finance/Income/BudgetSummaryCards';
import { IncomeEntryItem } from '@/Components/Finance/Income/IncomeEntryItem';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { usePastEditConfirmation } from '@/hooks/usePastEditConfirmation';
import { formatCurrency } from '@/lib/format';
import {
    type Account,
    type BudgetSummary,
    type IncomeEntry,
    type PageProps,
} from '@/types';

interface IncomePageProps extends PageProps {
    entries: { data: IncomeEntry[] };
    accounts: { data: Account[] };
    budgetSummary: BudgetSummary;
    currentPeriod: string;
}

export default function IncomeIndex() {
    const { entries, accounts, budgetSummary, currentPeriod, flash } =
        usePage<IncomePageProps>().props;

    const entryList = entries.data;
    const accountList = accounts.data;

    const {
        isPastMonth,
        confirmDialogOpen,
        requestConfirmation,
        handleConfirm,
        handleCancel,
    } = usePastEditConfirmation({ currentPeriod });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    function handlePeriodChange(period: string) {
        router.get(
            route('income.index', { period }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    const totalIncome = entryList.reduce((sum, entry) => sum + entry.amount, 0);

    return (
        <AppLayout>
            <Head title="Income" />

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Income</h2>
                    <p className="text-muted-foreground">
                        Manage your monthly income and track your budget.
                    </p>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                {isPastMonth && <PastMonthBanner period={currentPeriod} />}

                <BudgetSummaryCards summary={budgetSummary} />

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold">Add Income</h3>
                    <AddIncomeForm
                        accounts={accountList}
                        requestConfirmation={isPastMonth ? requestConfirmation : undefined}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Income Entries</h3>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Total: {formatCurrency(totalIncome)}
                        </span>
                    </div>

                    {entryList.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border p-8 text-center">
                            <p className="text-muted-foreground">
                                No income entries for this month. Add your first income above.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {entryList.map((entry) => (
                                <IncomeEntryItem
                                    key={entry.id}
                                    entry={entry}
                                    accounts={accountList}
                                    requestConfirmation={isPastMonth ? requestConfirmation : undefined}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmPastEditDialog
                open={confirmDialogOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                period={currentPeriod}
            />
        </AppLayout>
    );
}
