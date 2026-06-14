import { Head, router, usePage } from '@inertiajs/react';
import { Bus, CreditCard, Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { ConfirmPastEditDialog } from '@/Components/Finance/ConfirmPastEditDialog';
import { PastMonthBanner } from '@/Components/Finance/PastMonthBanner';
import { ManageModesDialog } from '@/Components/Finance/Transportation/ManageModesDialog';
import { TransportModeCard } from '@/Components/Finance/Transportation/TransportModeCard';
import { TransportSummaryCards } from '@/Components/Finance/Transportation/TransportSummaryCards';
import { TransportTopUpDialog } from '@/Components/Finance/Transportation/TransportTopUpDialog';
import { TripHistory } from '@/Components/Finance/Transportation/TripHistory';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { usePastEditConfirmation } from '@/hooks/usePastEditConfirmation';
import {
    type Account,
    type MetroTopup,
    type PageProps,
    type TransportationSummary,
    type TransportMode,
    type Trip,
} from '@/types';

interface TransportationPageProps extends PageProps {
    modes: { data: TransportMode[] };
    trips: { data: Trip[] };
    topups: { data: MetroTopup[] };
    summary: TransportationSummary;
    accounts: { data: Account[] };
    metroBalance: number;
    currentPeriod: string;
}

export default function TransportationIndex() {
    const { modes, trips, topups, summary, accounts, metroBalance, currentPeriod, flash } =
        usePage<TransportationPageProps>().props;

    const [showManageModes, setShowManageModes] = useState(false);
    const [showTopUp, setShowTopUp] = useState(false);

    const modeList = modes.data;
    const tripList = trips.data;
    const accountList = accounts.data;

    const {
        isPastMonth,
        confirmDialogOpen,
        handleConfirm,
        handleCancel,
    } = usePastEditConfirmation({ currentPeriod });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    function handlePeriodChange(period: string) {
        router.get(
            route('transportation.index', { period }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Transportation" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Transportation</h2>
                        <p className="text-muted-foreground">
                            Track your trips and metro card balance.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setShowTopUp(true)}>
                            <CreditCard data-icon="inline-start" />
                            Top Up
                        </Button>
                        <Button variant="outline" onClick={() => setShowManageModes(true)}>
                            <Settings data-icon="inline-start" />
                            Modes
                        </Button>
                    </div>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                {isPastMonth && <PastMonthBanner period={currentPeriod} />}

                <TransportSummaryCards summary={summary} metroBalance={metroBalance} />

                {modeList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                        <Bus className="mb-4 size-12 text-muted-foreground" />
                        <p className="mb-2 text-muted-foreground">
                            No transport modes configured yet.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowManageModes(true)}
                        >
                            <Plus data-icon="inline-start" />
                            Add your first mode
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <h3 className="text-lg font-semibold">Quick Log</h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {modeList.map((mode) => (
                                    <TransportModeCard key={mode.id} mode={mode} />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Trip History</h3>
                                <span className="text-sm text-muted-foreground">
                                    {tripList.length} {tripList.length === 1 ? 'trip' : 'trips'}
                                </span>
                            </div>
                            <TripHistory trips={tripList} />
                        </div>
                    </div>
                )}
            </div>

            <ManageModesDialog
                open={showManageModes}
                onOpenChange={setShowManageModes}
                modes={modeList}
                accounts={accountList}
            />

            <TransportTopUpDialog
                open={showTopUp}
                onOpenChange={setShowTopUp}
                accounts={accountList}
            />

            <ConfirmPastEditDialog
                open={confirmDialogOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                period={currentPeriod}
            />
        </AppLayout>
    );
}
