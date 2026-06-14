import { AlertTriangle, Car, DollarSign, Flame } from 'lucide-react';

import { Card, CardContent } from '@/Components/ui/card';
import { type ShameSummary } from '@/types';

interface ShameCounterProps {
    summary: ShameSummary;
}

function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

export function ShameCounter({ summary }: ShameCounterProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardContent className="flex items-center gap-3 pt-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <DollarSign className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Misc</p>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_spent)}</p>
                        <p className="text-xs text-muted-foreground">
                            {summary.expense_count} {summary.expense_count === 1 ? 'expense' : 'expenses'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className={summary.guilty_total > 0 ? 'border-destructive/50' : ''}>
                <CardContent className="flex items-center gap-3 pt-6">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${
                        summary.guilty_total > 0 ? 'bg-destructive/10' : 'bg-muted'
                    }`}>
                        <Flame className={`size-5 ${
                            summary.guilty_total > 0 ? 'text-destructive' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Counter of Shame</p>
                        <p className={`text-2xl font-bold ${
                            summary.guilty_total > 0 ? 'text-destructive' : ''
                        }`}>
                            {formatCurrency(summary.guilty_total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {summary.guilty_count} guilty {summary.guilty_count === 1 ? 'expense' : 'expenses'}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className={summary.taxi_total > 0 ? 'border-orange-500/50' : ''}>
                <CardContent className="flex items-center gap-3 pt-6">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${
                        summary.taxi_total > 0 ? 'bg-orange-500/10' : 'bg-muted'
                    }`}>
                        <Car className={`size-5 ${
                            summary.taxi_total > 0 ? 'text-orange-500' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Taxi Shame</p>
                        <p className={`text-2xl font-bold ${
                            summary.taxi_total > 0 ? 'text-orange-500' : ''
                        }`}>
                            {formatCurrency(summary.taxi_total)}
                        </p>
                        <p className="text-xs text-muted-foreground">from trip logs</p>
                    </div>
                </CardContent>
            </Card>

            <Card className={summary.guilty_total + summary.taxi_total > 0 ? 'border-yellow-500/50' : ''}>
                <CardContent className="flex items-center gap-3 pt-6">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${
                        summary.guilty_total + summary.taxi_total > 0 ? 'bg-yellow-500/10' : 'bg-muted'
                    }`}>
                        <AlertTriangle className={`size-5 ${
                            summary.guilty_total + summary.taxi_total > 0 ? 'text-yellow-500' : 'text-muted-foreground'
                        }`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Combined Shame</p>
                        <p className={`text-2xl font-bold ${
                            summary.guilty_total + summary.taxi_total > 0 ? 'text-yellow-500' : ''
                        }`}>
                            {formatCurrency(summary.guilty_total + summary.taxi_total)}
                        </p>
                        <p className="text-xs text-muted-foreground">guilty + taxi</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
