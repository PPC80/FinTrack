import { Head } from '@inertiajs/react';
import { TrendingUp, Wallet } from 'lucide-react';

import { AppLayout } from '@/Components/Layout/AppLayout';

export default function Dashboard() {
    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-6">
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
                                <p className="text-2xl font-bold">--</p>
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
                                <p className="text-2xl font-bold">--</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                    <p className="text-center text-muted-foreground">
                        Finance module will be built in upcoming phases.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
