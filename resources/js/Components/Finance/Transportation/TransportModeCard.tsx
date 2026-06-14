import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type TransportMode } from '@/types';

interface TransportModeCardProps {
    mode: TransportMode;
}

export function TransportModeCard({ mode }: TransportModeCardProps) {
    function handleLogTrip() {
        router.post(route('transportation.trips.store', mode.id), {}, {
            preserveScroll: true,
        });
    }

    return (
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-1">
                <span className="font-medium">{mode.name}</span>
                <span className="text-sm text-muted-foreground">
                    {formatCurrency(mode.fare)} per trip
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">{mode.trip_count}</span>
                    <span className="text-xs text-muted-foreground">trips</span>
                </div>

                <Button
                    size="icon"
                    variant="default"
                    onClick={handleLogTrip}
                    aria-label={`Log ${mode.name} trip`}
                >
                    <Plus className="size-5" />
                </Button>
            </div>
        </div>
    );
}
