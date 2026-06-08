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

interface CreateAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAccountDialog({ open, onOpenChange }: CreateAccountDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        initial_balance: '0',
        is_default: false,
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('accounts.store'), {
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
                    <DialogTitle>Add Bank Account</DialogTitle>
                    <DialogDescription>
                        Add a new bank account to track your finances.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-name">Account Name</Label>
                        <Input
                            id="create-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="e.g., Banco Bolivariano"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="create-balance">Initial Balance</Label>
                        <Input
                            id="create-balance"
                            type="number"
                            step="0.01"
                            min="0"
                            value={data.initial_balance}
                            onChange={(event) => setData('initial_balance', event.target.value)}
                            aria-invalid={!!errors.initial_balance}
                        />
                        {errors.initial_balance && (
                            <p className="text-sm text-destructive">{errors.initial_balance}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="create-default"
                            type="checkbox"
                            checked={data.is_default}
                            onChange={(event) => setData('is_default', event.target.checked)}
                            className="size-4 rounded border-border"
                        />
                        <Label htmlFor="create-default" className="text-sm font-normal">
                            Set as default payment source
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Account'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
