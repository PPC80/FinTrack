import { DollarSign, Receipt, ShoppingCart } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { type PurchaseSummary } from '@/types';

interface PurchaseSummaryCardsProps {
    summary: PurchaseSummary;
}

export function PurchaseSummaryCards({ summary }: PurchaseSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                        <DollarSign className="size-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary.total_spent)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                        <ShoppingCart className="size-5 text-success" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Purchases</p>
                        <p className="text-2xl font-bold">{summary.purchase_count}</p>
                        <p className="text-xs text-muted-foreground">
                            {summary.planned_count} planned · {summary.unplanned_count} unplanned
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                        <Receipt className="size-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">IVA Paid</p>
                        <p className="text-2xl font-bold">
                            {formatCurrency(summary.total_iva)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
