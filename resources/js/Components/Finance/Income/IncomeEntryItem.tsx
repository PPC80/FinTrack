import { router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type IncomeEntry } from '@/types';

import { EditIncomeDialog } from './EditIncomeDialog';
import { type Account } from '@/types';

interface IncomeEntryItemProps {
    entry: IncomeEntry;
    accounts: Account[];
    requestConfirmation?: (action: () => void) => void;
}

export function IncomeEntryItem({ entry, accounts, requestConfirmation }: IncomeEntryItemProps) {
    const [showEdit, setShowEdit] = useState(false);

    function handleDelete() {
        const doDelete = () => {
            if (!confirm(`Delete income "${entry.source}"?`)) {
                return;
            }

            router.delete(route('income.destroy', { incomeEntry: entry.id }), {
                preserveScroll: true,
            });
        };

        if (requestConfirmation) {
            requestConfirmation(doDelete);
        } else {
            doDelete();
        }
    }

    function handleEdit() {
        if (requestConfirmation) {
            requestConfirmation(() => setShowEdit(true));
        } else {
            setShowEdit(true);
        }
    }

    const receivedDate = new Date(entry.received_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{entry.source}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.account?.name}</span>
                        <span>&middot;</span>
                        <span>{receivedDate}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-success">
                        +{formatCurrency(entry.amount)}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleEdit}
                        aria-label={`Edit ${entry.source}`}
                        className="size-8"
                    >
                        <Pencil className="size-3.5" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        aria-label={`Delete ${entry.source}`}
                        className="size-8 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <EditIncomeDialog
                open={showEdit}
                onOpenChange={setShowEdit}
                entry={entry}
                accounts={accounts}
            />
        </>
    );
}
