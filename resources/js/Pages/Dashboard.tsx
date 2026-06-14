import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    CreditCard,
    DollarSign,
    TrendingDown,
    Wallet,
} from 'lucide-react';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type BudgetSummary, type MonthlySummaryData, type PageProps } from '@/types';

interface DashboardPageProps extends PageProps {
    budgetSummary: BudgetSummary;
    currentPeriod: string;
    monthlySummaries: MonthlySummaryData[];
}

export default function Dashboard() {
    const { balanceSummary, budgetSummary, currentPeriod, monthlySummaries } =
        usePage<DashboardPageProps>().props;

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

                {/* The Big Number — most prominent element */}
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

                {/* Account balances row */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <Wallet className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Balance
                                </p>
                                <p className="text-2xl font-bold">
                                    {balanceSummary
                                        ? formatCurrency(balanceSummary.totalBalance)
                                        : '--'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                                <TrendingDown className="size-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Obligations
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(budgetSummary.total_obligations)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <CreditCard className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Metro Card
                                </p>
                                <p className="text-2xl font-bold">
                                    {balanceSummary
                                        ? formatCurrency(balanceSummary.metroBalance)
                                        : '--'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Income vs Spending */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ArrowUpRight className="size-4 text-success" />
                            <h3 className="font-semibold">Income</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">This month</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.total_income)}
                                </span>
                            </div>
                            {budgetSummary.carry_over > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Carry-over</span>
                                    <span className="font-medium">
                                        {formatCurrency(budgetSummary.carry_over)}
                                    </span>
                                </div>
                            )}
                            <div className="mt-1 border-t border-border pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Effective Income</span>
                                    <span className="text-lg font-bold text-success">
                                        {formatCurrency(budgetSummary.effective_income)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <ArrowDownRight className="size-4 text-destructive" />
                            <h3 className="font-semibold">Spending</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Basic Expenses</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.spending_breakdown.basic_expenses)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Purchases</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.spending_breakdown.purchases)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Misc Expenses</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.spending_breakdown.misc_expenses)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Transportation</span>
                                <span className="font-medium">
                                    {formatCurrency(budgetSummary.spending_breakdown.transportation)}
                                </span>
                            </div>
                            <div className="mt-1 border-t border-border pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Total Spent</span>
                                    <span className="text-lg font-bold text-destructive">
                                        {formatCurrency(budgetSummary.total_spent)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Obligations breakdown */}
                <div className="rounded-xl border border-border bg-card p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <DollarSign className="size-4 text-warning" />
                        <h3 className="font-semibold">Remaining Obligations</h3>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Unpaid Bills</span>
                            <span className="font-medium">
                                {formatCurrency(budgetSummary.obligations_breakdown.unpaid_basic_expenses)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Remaining Category Budgets</span>
                            <span className="font-medium">
                                {formatCurrency(budgetSummary.obligations_breakdown.remaining_category_budgets)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Planned Purchases</span>
                            <span className="font-medium">
                                {formatCurrency(budgetSummary.obligations_breakdown.unpaid_planned_items)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category budget progress */}
                {budgetSummary.category_budgets.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-5">
                        <h3 className="mb-4 font-semibold">Category Budgets</h3>
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
                                            className={`h-full rounded-full transition-all ${
                                                category.percentage_used >= 90
                                                    ? 'bg-destructive'
                                                    : category.percentage_used >= 70
                                                      ? 'bg-warning'
                                                      : 'bg-success'
                                            }`}
                                            style={{ width: `${Math.min(100, category.percentage_used)}%` }}
                                        />
                                    </div>
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
                                    className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted/50 ${
                                        summary.period === currentPeriod
                                            ? 'border-primary/30 bg-primary/5'
                                            : 'border-border'
                                    }`}
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
                                            <span className={`font-medium ${summary.leftover >= 0 ? 'text-success' : 'text-destructive'}`}>
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
                <div className="grid gap-3 sm:grid-cols-2">
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
