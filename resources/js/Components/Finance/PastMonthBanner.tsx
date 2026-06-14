import { Calendar } from 'lucide-react';

interface PastMonthBannerProps {
    period: string;
}

export function PastMonthBanner({ period }: PastMonthBannerProps) {
    const periodDisplay = formatPeriodLabel(period);

    return (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-2.5 text-sm text-warning">
            <Calendar className="size-4 shrink-0" />
            <span>
                Viewing <strong>{periodDisplay}</strong> — edits to past data may
                affect carry-over calculations.
            </span>
        </div>
    );
}

function formatPeriodLabel(period: string): string {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
