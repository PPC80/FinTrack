import { CheckCircle2, CircleDollarSign, Clock } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { type ExpenseSummary } from '@/types';

interface ExpenseSummaryCardsProps {
    summary: ExpenseSummary;
}

export function ExpenseSummaryCards({ summary }: ExpenseSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <CircleDollarSign className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Obligations</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary.total)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <CheckCircle2 className="size-5 text-success" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Paid ({summary.paid_count}/{summary.count})
                        </p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary.paid)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Clock className="size-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary.remaining)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
