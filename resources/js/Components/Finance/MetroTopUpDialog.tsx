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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { type Account } from '@/types';

interface MetroTopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    paymentSources: Account[];
}

export function MetroTopUpDialog({ open, onOpenChange, paymentSources }: MetroTopUpDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        payment_source_id: '',
        description: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('metro-card.top-up'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
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
                    <DialogTitle>Top Up Metro Card</DialogTitle>
                    <DialogDescription>
                        Add balance to your metro card from another account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="topup-amount">Amount</Label>
                        <Input
                            id="topup-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.amount}
                            onChange={(event) => setData('amount', event.target.value)}
                            placeholder="0.00"
                            aria-invalid={!!errors.amount}
                        />
                        {errors.amount && (
                            <p className="text-sm text-destructive">{errors.amount}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="topup-source">Payment Source</Label>
                        <Select
                            value={data.payment_source_id}
                            onValueChange={(value) => setData('payment_source_id', value)}
                        >
                            <SelectTrigger id="topup-source" aria-invalid={!!errors.payment_source_id}>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentSources.map((source) => (
                                    <SelectItem key={source.id} value={String(source.id)}>
                                        {source.name} (${source.balance.toFixed(2)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.payment_source_id && (
                            <p className="text-sm text-destructive">{errors.payment_source_id}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="topup-description">Description (optional)</Label>
                        <Input
                            id="topup-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder="e.g., Weekly recarga"
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Processing...' : 'Top Up'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
