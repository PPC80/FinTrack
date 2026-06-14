import { router } from '@inertiajs/react';
import { Check, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type PredictedIncome } from '@/types';

import { EditPredictedIncomeDialog } from './EditPredictedIncomeDialog';

interface PredictedIncomeItemProps {
    predictedIncome: PredictedIncome;
}

export function PredictedIncomeItem({ predictedIncome }: PredictedIncomeItemProps) {
    const [showEdit, setShowEdit] = useState(false);

    function handleToggleReceived() {
        router.patch(
            route('planning.predicted-income.toggle', { predictedIncome: predictedIncome.id }),
            {},
            { preserveScroll: true },
        );
    }

    function handleDelete() {
        if (!confirm(`Delete predicted income "${predictedIncome.description}"?`)) {
            return;
        }

        router.delete(
            route('planning.predicted-income.destroy', { predictedIncome: predictedIncome.id }),
            { preserveScroll: true },
        );
    }

    const expectedDate = predictedIncome.expected_date
        ? new Date(predictedIncome.expected_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : null;

    return (
        <>
            <div className={cn(
                'flex items-center justify-between rounded-lg border border-border bg-card p-3',
                predictedIncome.is_received && 'opacity-60',
            )}>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleReceived}
                        aria-label={predictedIncome.is_received ? `Mark "${predictedIncome.description}" as pending` : `Mark "${predictedIncome.description}" as received`}
                        className={cn(
                            'size-8 shrink-0 rounded-full border',
                            predictedIncome.is_received
                                ? 'border-success bg-success/10 text-success'
                                : 'border-border',
                        )}
                    >
                        {predictedIncome.is_received ? (
                            <Check className="size-3.5" />
                        ) : null}
                    </Button>

                    <div className="flex flex-col gap-0.5">
                        <span className={cn(
                            'font-medium',
                            predictedIncome.is_received && 'line-through',
                        )}>
                            {predictedIncome.description}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {expectedDate && <span>{expectedDate}</span>}
                            {predictedIncome.is_received && (
                                <Badge variant="outline" className="border-success/30 text-success text-[10px] px-1.5 py-0">
                                    Received
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={cn(
                        'text-lg font-semibold',
                        predictedIncome.is_received ? 'text-success' : 'text-foreground',
                    )}>
                        {formatCurrency(predictedIncome.amount)}
                    </span>

                    {predictedIncome.is_received ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleToggleReceived}
                            aria-label={`Undo received for "${predictedIncome.description}"`}
                            className="size-8"
                        >
                            <Undo2 className="size-3.5" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowEdit(true)}
                            aria-label={`Edit "${predictedIncome.description}"`}
                            className="size-8"
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        aria-label={`Delete "${predictedIncome.description}"`}
                        className="size-8 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <EditPredictedIncomeDialog
                open={showEdit}
                onOpenChange={setShowEdit}
                predictedIncome={predictedIncome}
            />
        </>
    );
}
