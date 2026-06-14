import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { type PredictedIncome } from '@/types';

interface EditPredictedIncomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    predictedIncome: PredictedIncome;
}

export function EditPredictedIncomeDialog({ open, onOpenChange, predictedIncome }: EditPredictedIncomeDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        description: predictedIncome.description,
        amount: predictedIncome.amount.toString(),
        expected_date: predictedIncome.expected_date ?? '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        put(route('planning.predicted-income.update', { predictedIncome: predictedIncome.id }), {
            onSuccess: () => {
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Predicted Income</DialogTitle>
                    <DialogDescription>
                        Update the details of this predicted income entry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-predicted-description">Description</Label>
                        <Input
                            id="edit-predicted-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder='e.g., "Ingreso juicio"'
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-predicted-amount">Estimated Amount</Label>
                        <Input
                            id="edit-predicted-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(event) => setData('amount', event.target.value)}
                            aria-invalid={!!errors.amount}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-predicted-date">Expected Date</Label>
                        <Input
                            id="edit-predicted-date"
                            type="date"
                            value={data.expected_date}
                            onChange={(event) => setData('expected_date', event.target.value)}
                            aria-invalid={!!errors.expected_date}
                        />
                        {errors.expected_date && (
                            <p className="text-sm text-destructive">{errors.expected_date}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
