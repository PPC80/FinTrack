import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect } from 'react';

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
import { formatCurrency } from '@/lib/format';
import { type Account } from '@/types';

interface AdjustBalanceDialogProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AdjustBalanceDialog({ account, open, onOpenChange }: AdjustBalanceDialogProps) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        balance: '0',
        description: '',
    });

    useEffect(() => {
        if (account) {
            setData({
                balance: String(account.balance),
                description: '',
            });
        }
    }, [account]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!account) return;

        patch(route('accounts.adjust-balance', account.id), {
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
                    <DialogTitle>Adjust Balance</DialogTitle>
                    <DialogDescription>
                        {account && (
                            <>
                                Current balance for <strong>{account.name}</strong>:{' '}
                                {formatCurrency(account.balance)}
                            </>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="adjust-balance">New Balance</Label>
                        <Input
                            id="adjust-balance"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.balance}
                            onChange={(event) => setData('balance', event.target.value)}
                            aria-invalid={!!errors.balance}
                        />
                        {errors.balance && (
                            <p className="text-sm text-destructive">{errors.balance}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="adjust-description">Reason (optional)</Label>
                        <Input
                            id="adjust-description"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            placeholder="e.g., Corrected after bank statement"
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
                            {processing ? 'Adjusting...' : 'Adjust Balance'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
