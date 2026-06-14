import { Bus, CreditCard, DollarSign, TrendingUp } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { type TransportationSummary } from '@/types';

interface TransportSummaryCardsProps {
    summary: TransportationSummary;
    metroBalance: number;
}

export function TransportSummaryCards({ summary, metroBalance }: TransportSummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <Bus className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Trips</p>
                        <p className="text-2xl font-bold">{summary.total_trips}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                        <DollarSign className="size-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_cost)}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <TrendingUp className="size-5 text-success" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Top-ups</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_topups)}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <CreditCard className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Metro Balance</p>
                        <p className="text-2xl font-bold">{formatCurrency(metroBalance)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
