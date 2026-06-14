import { Head, router, usePage } from '@inertiajs/react';
import { Flame } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { MiscExpenseList } from '@/Components/Finance/MiscExpenses/MiscExpenseList';
import { QuickAddForm } from '@/Components/Finance/MiscExpenses/QuickAddForm';
import { ShameCounter } from '@/Components/Finance/MiscExpenses/ShameCounter';
import { AppLayout } from '@/Components/Layout/AppLayout';
import {
    type Account,
    type MiscExpense,
    type PageProps,
    type ShameSummary,
} from '@/types';

interface MiscExpensesPageProps extends PageProps {
    expenses: { data: MiscExpense[] };
    shameSummary: ShameSummary;
    accounts: { data: Account[] };
    currentPeriod: string;
}

export default function MiscExpensesIndex() {
    const { expenses, shameSummary, accounts, currentPeriod, flash } =
        usePage<MiscExpensesPageProps>().props;

    const expenseList = expenses.data;
    const accountList = accounts.data;

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
            route('misc-expenses.index', { period }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Misc Expenses" />

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Misc Expenses</h2>
                    <p className="text-muted-foreground">
                        Log unplanned spending and track your guilty habits.
                    </p>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                <ShameCounter summary={shameSummary} />

                <div className="flex flex-col gap-3">
                    <h3 className="text-lg font-semibold">Quick Log</h3>
                    <QuickAddForm accounts={accountList} />
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Expenses</h3>
                            <Flame className="size-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {expenseList.length} {expenseList.length === 1 ? 'expense' : 'expenses'}
                        </span>
                    </div>
                    <MiscExpenseList expenses={expenseList} />
                </div>
            </div>
        </AppLayout>
    );
}
