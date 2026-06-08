import { usePage } from '@inertiajs/react';
import { Wallet } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import { type PageProps } from '@/types';

export function BalanceWidget() {
    const { balanceSummary } = usePage<PageProps>().props;

    if (!balanceSummary) return null;

    return (
        <div className="hidden items-center gap-2 md:flex">
            <Wallet className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
                {formatCurrency(balanceSummary.totalBalance)}
            </span>
        </div>
    );
}
