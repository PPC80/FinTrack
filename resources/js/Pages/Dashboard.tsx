import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    Calendar,
    Car,
    CreditCard,
    DollarSign,
    Flame,
    Receipt,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
    type BasicExpensesProgress,
    type BudgetSummary,
    type DashboardAccount,
    type DashboardShameSummary,
    type MonthComparison,
    type MonthlySummaryData,
    type PageProps,
    type RecentActivityItem,
} from '@/types';

interface DashboardPageProps extends PageProps {
    budgetSummary: BudgetSummary;
    accounts: DashboardAccount[];
    basicExpensesProgress: BasicExpensesProgress;
    shameSummary: DashboardShameSummary;
    recentActivity: RecentActivityItem[];
    monthComparison: MonthComparison;
    currentPeriod: string;
    monthlySummaries: MonthlySummaryData[];
}

export default function Dashboard() {
    const {
        balanceSummary,
        budgetSummary,
        accounts,
        basicExpensesProgress,
        shameSummary,
        recentActivity,
        monthComparison,
        currentPeriod,
        monthlySummaries,
    } = usePage<DashboardPageProps>().props;

    const periodDisplay = formatPeriodDisplay(currentPeriod);
    const isViewingCurrentMonth = isCurrentMonth(currentPeriod);

    function handlePeriodChange(period: string) {
        router.get(
            route('dashboard', { period }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Dashboard
                        </h2>
                        <p className="text-muted-foreground">
                            Your financial overview for {periodDisplay}.
                        </p>
                    </div>
                    <MonthNavigator
                        currentPeriod={currentPeriod}
                        onPeriodChange={handlePeriodChange}
                    />
                </div>

                {!isViewingCurrentMonth && (
                    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-sm text-warning">
                        <Calendar className="size-4 shrink-0" />
                        <span>
                            You are viewing data for <strong>{periodDisplay}</strong>.
                            The Big Number always reflects your current real-time balance.
                        </span>
                    </div>
                )}

                {/* The Big Number */}
                <div className="rounded-xl border-2 border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 p-6">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            Available to Spend
                        </p>
                        <p className="text-4xl font-bold tracking-tight md:text-5xl">
                            {balanceSummary
                                ? formatCurrency(balanceSummary.theBigNumber)
                                : '--'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Account balances minus all remaining obligations
                        </p>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-success/10">
                                <ArrowUpRight className="size-4 text-success" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Income</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(budgetSummary.total_income)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
                                <ArrowDownRight className="size-4 text-destructive" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Total Spent</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(budgetSummary.total_spent)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                                <DollarSign className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Monthly Leftover</p>
                                <p className={cn(
                                    'text-lg font-bold',
                                    budgetSummary.monthly_leftover >= 0 ? 'text-success' : 'text-destructive',
                                )}>
                                    {formatCurrency(budgetSummary.monthly_leftover)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                                <Wallet className="size-4 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Carry-over</p>
                                <p className="text-lg font-bold">
                                    {formatCurrency(budgetSummary.carry_over)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Month-over-month comparison callout */}
                {monthComparison.previous_spent > 0 && (
                    <div className={cn(
                        'flex items-center gap-3 rounded-xl border p-4',
                        monthComparison.direction === 'less'
                            ? 'border-success/30 bg-success/5'
                            : 'border-warning/30 bg-warning/5',
                    )}>
                        {monthComparison.direction === 'less' ? (
                            <TrendingDown className="size-5 shrink-0 text-success" />
                        ) : (
                            <TrendingUp className="size-5 shrink-0 text-warning" />
                        )}
                        <p className="text-sm">
                            {monthComparison.direction === 'less' ? (
                                <>
                                    You've spent <strong className="text-success">{formatCurrency(monthComparison.difference)} less</strong> than
                                    last month ({formatCurrency(monthComparison.previous_spent)}).
                                </>
                            ) : (
                                <>
                                    You've spent <strong className="text-warning">{formatCurrency(monthComparison.difference)} more</strong> than
                                    last month ({formatCurrency(monthComparison.previous_spent)}).
                                </>
                            )}
                        </p>
                    </div>
                )}

                {/* Account Balances */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wallet className="size-4 text-muted-foreground" />
                            <h3 className="font-semibold">Account Balances</h3>
                        </div>
                        <span className="text-sm font-medium">
                            Total: {balanceSummary
                                ? formatCurrency(balanceSummary.totalBalance + balanceSummary.metroBalance)
                                : '--'}
                        </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center gap-3 rounded-lg border border-border p-3"
                            >
                                <div className={cn(
                                    'flex size-8 items-center justify-center rounded-lg',
                                    account.type === 'bank' && 'bg-primary/10',
                                    account.type === 'cash' && 'bg-success/10',
                                    account.type === 'metro_card' && 'bg-warning/10',
                                )}>
                                    {account.type === 'bank' && <CreditCard className="size-4 text-primary" />}
                                    {account.type === 'cash' && <Banknote className="size-4 text-success" />}
                                    {account.type === 'metro_card' && <CreditCard className="size-4 text-warning" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm text-muted-foreground">
                                        {account.name}
                                    </p>
                                    <p className="text-lg font-bold">
                                        {formatCurrency(account.balance)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Basic Expenses Progress */}
                {basicExpensesProgress.total_count > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="size-4 text-muted-foreground" />
                                <h3 className="font-semibold">Basic Expenses</h3>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {basicExpensesProgress.paid_count}/{basicExpensesProgress.total_count} paid
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {formatCurrency(basicExpensesProgress.paid_amount)} paid
                                </span>
                                <span className="font-medium">
                                    {formatCurrency(basicExpensesProgress.total_amount)} total
                                </span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-muted">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all',
                                        basicExpensesProgress.percentage >= 100
                                            ? 'bg-success'
                                            : basicExpensesProgress.percentage >= 50
                                                ? 'bg-primary'
                                                : 'bg-warning',
                                    )}
                                    style={{ width: `${Math.min(100, basicExpensesProgress.percentage)}%` }}
                                />
                            </div>
                            {basicExpensesProgress.paid_count < basicExpensesProgress.total_count && (
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(basicExpensesProgress.total_amount - basicExpensesProgress.paid_amount)} remaining
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Category Budget Progress */}
                {budgetSummary.category_budgets.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ShoppingCart className="size-4 text-muted-foreground" />
                            <h3 className="font-semibold">Category Budgets</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {budgetSummary.category_budgets.map((category) => (
                                <div key={category.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>{category.name}</span>
                                        <span className="text-muted-foreground">
                                            {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                            className={cn(
                                                'h-full rounded-full transition-all',
                                                category.percentage_used >= 90
                                                    ? 'bg-destructive'
                                                    : category.percentage_used >= 70
                                                        ? 'bg-warning'
                                                        : 'bg-success',
                                            )}
                                            style={{ width: `${Math.min(100, category.percentage_used)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Counter of Shame */}
                {(shameSummary.guilty_total > 0 || shameSummary.taxi_total > 0) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className={cn(
                            'rounded-xl border bg-card p-5',
                            shameSummary.guilty_total > 0 ? 'border-destructive/30' : 'border-border',
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex size-10 items-center justify-center rounded-lg',
                                    shameSummary.guilty_total > 0 ? 'bg-destructive/10' : 'bg-muted',
                                )}>
                                    <Flame className={cn(
                                        'size-5',
                                        shameSummary.guilty_total > 0 ? 'text-destructive' : 'text-muted-foreground',
                                    )} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Counter of Shame</p>
                                    <p className={cn(
                                        'text-2xl font-bold',
                                        shameSummary.guilty_total > 0 && 'text-destructive',
                                    )}>
                                        {formatCurrency(shameSummary.guilty_total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {shameSummary.guilty_count} guilty {shameSummary.guilty_count === 1 ? 'expense' : 'expenses'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={cn(
                            'rounded-xl border bg-card p-5',
                            shameSummary.taxi_total > 0 ? 'border-orange-500/30' : 'border-border',
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'flex size-10 items-center justify-center rounded-lg',
                                    shameSummary.taxi_total > 0 ? 'bg-orange-500/10' : 'bg-muted',
                                )}>
                                    <Car className={cn(
                                        'size-5',
                                        shameSummary.taxi_total > 0 ? 'text-orange-500' : 'text-muted-foreground',
                                    )} />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Taxi Shame</p>
                                    <p className={cn(
                                        'text-2xl font-bold',
                                        shameSummary.taxi_total > 0 && 'text-orange-500',
                                    )}>
                                        {formatCurrency(shameSummary.taxi_total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">from trip logs</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {recentActivity.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <h3 className="font-semibold">Recent Activity</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'flex size-8 items-center justify-center rounded-full',
                                            activity.type === 'income' && 'bg-success/10',
                                            activity.type === 'basic_expense' && 'bg-primary/10',
                                            activity.type === 'purchase' && 'bg-warning/10',
                                            activity.type === 'misc_expense' && 'bg-destructive/10',
                                            activity.type === 'trip' && 'bg-muted',
                                        )}>
                                            {activity.type === 'income' && <ArrowUpRight className="size-3.5 text-success" />}
                                            {activity.type === 'basic_expense' && <Receipt className="size-3.5 text-primary" />}
                                            {activity.type === 'purchase' && <ShoppingCart className="size-3.5 text-warning" />}
                                            {activity.type === 'misc_expense' && <DollarSign className="size-3.5 text-destructive" />}
                                            {activity.type === 'trip' && <Car className="size-3.5 text-muted-foreground" />}
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-medium">
                                                {activity.description}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatActivityDate(activity.date)}
                                                {activity.account_name && ` · ${activity.account_name}`}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        'text-sm font-semibold',
                                        activity.type === 'income' ? 'text-success' : 'text-foreground',
                                    )}>
                                        {activity.type === 'income' ? '+' : '-'}{formatCurrency(activity.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monthly History */}
                {monthlySummaries.length > 1 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <h3 className="font-semibold">Monthly History</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            {monthlySummaries.map((summary) => (
                                <button
                                    key={summary.period}
                                    type="button"
                                    onClick={() => handlePeriodChange(summary.period)}
                                    className={cn(
                                        'flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                                        summary.period === currentPeriod
                                            ? 'border-primary/30 bg-primary/5'
                                            : 'border-border',
                                    )}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-sm font-medium">
                                            {formatPeriodDisplay(summary.period)}
                                        </span>
                                        {isCurrentMonth(summary.period) && (
                                            <span className="text-xs text-primary">Current month</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-right text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Income</span>
                                            <span className="font-medium text-success">
                                                {formatCurrency(summary.total_income)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Spent</span>
                                            <span className="font-medium text-destructive">
                                                {formatCurrency(summary.total_spent)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-muted-foreground">Leftover</span>
                                            <span className={cn(
                                                'font-medium',
                                                summary.leftover >= 0 ? 'text-success' : 'text-destructive',
                                            )}>
                                                {formatCurrency(summary.leftover)}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick links */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Button asChild variant="outline" className="justify-start gap-2">
                        <Link href="/finance/income">
                            <DollarSign className="size-4" />
                            Manage Income
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start gap-2">
                        <Link href="/finance/accounts">
                            <Wallet className="size-4" />
                            Manage Accounts
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start gap-2">
                        <Link href="/finance/expenses">
                            <Receipt className="size-4" />
                            Manage Expenses
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="justify-start gap-2">
                        <Link href="/finance/misc-expenses">
                            <Flame className="size-4" />
                            Misc Expenses
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

function formatPeriodDisplay(period: string): string {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function isCurrentMonth(period: string): boolean {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return period === current;
}

function formatActivityDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}
