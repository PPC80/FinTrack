import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type Trip } from '@/types';

interface TripHistoryProps {
    trips: Trip[];
}

export function TripHistory({ trips }: TripHistoryProps) {
    function handleDelete(trip: Trip) {
        router.delete(route('transportation.trips.destroy', trip.id), {
            preserveScroll: true,
        });
    }

    if (trips.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
                <p className="text-sm text-muted-foreground">
                    No trips logged this month.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {trips.map((trip) => (
                <div
                    key={trip.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                            {trip.transport_mode.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {new Date(trip.taken_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                            {' · '}
                            {trip.account.name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                            {formatCurrency(trip.fare_at_time)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(trip)}
                            aria-label="Delete trip"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
