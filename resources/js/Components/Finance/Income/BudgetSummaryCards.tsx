import { ArrowDownRight, ArrowUpRight, DollarSign, TrendingDown } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { type BudgetSummary } from '@/types';

interface BudgetSummaryCardsProps {
    summary: BudgetSummary;
}

export function BudgetSummaryCards({ summary }: BudgetSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-success/10">
                        <ArrowUpRight className="size-4 text-success" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Income</p>
                        <p className="text-lg font-bold">
                            {formatCurrency(summary.effective_income)}
                        </p>
                        {summary.carry_over > 0 && (
                            <p className="text-xs text-muted-foreground">
                                +{formatCurrency(summary.carry_over)} carry-over
                            </p>
                        )}
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
                            {formatCurrency(summary.total_spent)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-warning/10">
                        <TrendingDown className="size-4 text-warning" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Obligations</p>
                        <p className="text-lg font-bold">
                            {formatCurrency(summary.total_obligations)}
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
                        <p className="text-lg font-bold">
                            {formatCurrency(summary.monthly_leftover)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
