import { router } from '@inertiajs/react';
import { Car, Flame, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { type Account, type MiscExpense } from '@/types';

interface MiscExpenseListProps {
    expenses: MiscExpense[];
    accounts?: Account[];
    onEdit?: (expense: MiscExpense) => void;
    requestConfirmation?: (action: () => void) => void;
}

function formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function MiscExpenseList({ expenses, accounts, onEdit, requestConfirmation }: MiscExpenseListProps) {
    const [deletingExpense, setDeletingExpense] = useState<MiscExpense | null>(null);

    function handleRequestDelete(expense: MiscExpense) {
        if (requestConfirmation) {
            requestConfirmation(() => setDeletingExpense(expense));
        } else {
            setDeletingExpense(expense);
        }
    }

    function handleDelete() {
        if (!deletingExpense) return;

        router.delete(route('misc-expenses.destroy', deletingExpense.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingExpense(null),
        });
    }

    if (expenses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                <p className="text-muted-foreground">No misc expenses logged this month.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {expenses.map((expense) => (
                    <div
                        key={expense.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-3">
                            {expense.is_guilty && (
                                <Flame className="size-4 shrink-0 text-destructive" />
                            )}
                            {expense.is_taxi && (
                                <Car className="size-4 shrink-0 text-warning" />
                            )}
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{expense.description}</span>
                                    {expense.is_guilty && (
                                        <Badge variant="destructive" className="text-xs">
                                            guilty
                                        </Badge>
                                    )}
                                    {expense.is_taxi && (
                                        <Badge variant="outline" className="text-xs">
                                            taxi
                                        </Badge>
                                    )}
                                    {expense.is_bank_transfer && (
                                        <Badge variant="secondary" className="text-xs">
                                            transfer
                                        </Badge>
                                    )}
                                    {expense.is_international && (
                                        <Badge variant="secondary" className="text-xs">
                                            intl
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{formatDateTime(expense.spent_at)}</span>
                                    <span>&middot;</span>
                                    <span>{expense.account.name}</span>
                                    {expense.commission_amount > 0 && (
                                        <>
                                            <span>&middot;</span>
                                            <span className="text-warning">fee: {formatCurrency(expense.commission_amount)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold tabular-nums">
                                {formatCurrency(expense.amount)}
                            </span>
                            {onEdit && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 text-muted-foreground hover:text-primary"
                                    onClick={() => onEdit(expense)}
                                    aria-label={`Edit ${expense.description}`}
                                >
                                    <Pencil className="size-4" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRequestDelete(expense)}
                                aria-label={`Delete ${expense.description}`}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog
                open={deletingExpense !== null}
                onOpenChange={(open) => { if (!open) setDeletingExpense(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete misc expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove &quot;{deletingExpense?.description}&quot; ({formatCurrency(deletingExpense?.amount ?? 0)})
                            and restore the amount to {deletingExpense?.account.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
