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
import { type Account, type IncomeEntry } from '@/types';

interface EditIncomeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    entry: IncomeEntry;
    accounts: Account[];
}

export function EditIncomeDialog({ open, onOpenChange, entry, accounts }: EditIncomeDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        source: entry.source,
        amount: entry.amount.toString(),
        account_id: entry.account_id.toString(),
        received_at: entry.received_at.split('T')[0],
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        put(route('income.update', { incomeEntry: entry.id }), {
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
                    <DialogTitle>Edit Income Entry</DialogTitle>
                    <DialogDescription>
                        Update the details of this income entry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-income-source">Source</Label>
                        <Input
                            id="edit-income-source"
                            value={data.source}
                            onChange={(event) => setData('source', event.target.value)}
                            placeholder='e.g., "Salary", "Freelance"'
                            aria-invalid={!!errors.source}
                        />
                        {errors.source && (
                            <p className="text-sm text-destructive">{errors.source}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-income-amount">Amount</Label>
                        <Input
                            id="edit-income-amount"
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
                        <Label htmlFor="edit-income-account">Deposit Account</Label>
                        <Select
                            value={data.account_id}
                            onValueChange={(value) => setData('account_id', value)}
                        >
                            <SelectTrigger id="edit-income-account">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                        {account.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.account_id && (
                            <p className="text-sm text-destructive">{errors.account_id}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-income-date">Date Received</Label>
                        <Input
                            id="edit-income-date"
                            type="date"
                            value={data.received_at}
                            onChange={(event) => setData('received_at', event.target.value)}
                            aria-invalid={!!errors.received_at}
                        />
                        {errors.received_at && (
                            <p className="text-sm text-destructive">{errors.received_at}</p>
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
