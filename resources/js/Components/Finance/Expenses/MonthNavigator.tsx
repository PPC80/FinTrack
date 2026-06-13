import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/Components/ui/button';

interface MonthNavigatorProps {
    currentPeriod: string;
    onPeriodChange: (period: string) => void;
}

function formatPeriodDisplay(period: string): string {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getAdjacentPeriod(period: string, direction: 'prev' | 'next'): string {
    const [year, month] = period.split('-').map(Number);
    const date = new Date(year, month - 1);

    if (direction === 'prev') {
        date.setMonth(date.getMonth() - 1);
    } else {
        date.setMonth(date.getMonth() + 1);
    }

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');

    return `${newYear}-${newMonth}`;
}

function isCurrentMonth(period: string): boolean {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return period === current;
}

export function MonthNavigator({ currentPeriod, onPeriodChange }: MonthNavigatorProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPeriodChange(getAdjacentPeriod(currentPeriod, 'prev'))}
                aria-label="Previous month"
            >
                <ChevronLeft className="size-4" />
            </Button>

            <span className="min-w-[160px] text-center text-lg font-semibold">
                {formatPeriodDisplay(currentPeriod)}
            </span>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPeriodChange(getAdjacentPeriod(currentPeriod, 'next'))}
                aria-label="Next month"
            >
                <ChevronRight className="size-4" />
            </Button>

            {!isCurrentMonth(currentPeriod) && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        const now = new Date();
                        const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                        onPeriodChange(current);
                    }}
                >
                    Today
                </Button>
            )}
        </div>
    );
}
