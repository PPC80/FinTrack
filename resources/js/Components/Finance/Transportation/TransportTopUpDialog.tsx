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

interface TransportTopUpDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
}

export function TransportTopUpDialog({ open, onOpenChange, accounts }: TransportTopUpDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        source_account_id: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('transportation.topups.store'), {
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
                        <Label htmlFor="transport-topup-amount">Amount</Label>
                        <Input
                            id="transport-topup-amount"
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
                        <Label htmlFor="transport-topup-source">Payment Source</Label>
                        <Select
                            value={data.source_account_id}
                            onValueChange={(value) => setData('source_account_id', value)}
                        >
                            <SelectTrigger id="transport-topup-source" aria-invalid={!!errors.source_account_id}>
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={String(account.id)}>
                                        {account.name} (${account.balance.toFixed(2)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.source_account_id && (
                            <p className="text-sm text-destructive">{errors.source_account_id}</p>
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
