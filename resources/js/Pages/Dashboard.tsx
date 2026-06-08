import { Head, Link, usePage } from '@inertiajs/react';
import { CreditCard, TrendingUp, Wallet } from 'lucide-react';

import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type PageProps } from '@/types';

export default function Dashboard() {
    const { balanceSummary } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        Dashboard
                    </h2>
                    <p className="text-muted-foreground">
                        Your financial overview at a glance.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-6">
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

                    <div className="rounded-xl border border-border bg-card p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                                <TrendingUp className="size-5 text-success" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Available Money
                                </p>
                                <p className="text-2xl font-bold">
                                    {balanceSummary
                                        ? formatCurrency(balanceSummary.totalBalance)
                                        : '--'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
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

                <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-muted-foreground">
                            Manage your accounts to start tracking finances.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/finance/accounts">Go to Accounts</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
