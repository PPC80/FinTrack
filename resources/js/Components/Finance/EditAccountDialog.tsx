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
import { type Account } from '@/types';

interface EditAccountDialogProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({ account, open, onOpenChange }: EditAccountDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        is_default: false,
    });

    useEffect(() => {
        if (account) {
            setData({
                name: account.name,
                is_default: account.is_default,
            });
        }
    }, [account]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!account) return;

        put(route('accounts.update', account.id), {
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
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update account details.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-name">Account Name</Label>
                        <Input
                            id="edit-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder="Account name"
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="edit-default"
                            type="checkbox"
                            checked={data.is_default}
                            onChange={(event) => setData('is_default', event.target.checked)}
                            className="size-4 rounded border-border"
                        />
                        <Label htmlFor="edit-default" className="text-sm font-normal">
                            Set as default payment source
                        </Label>
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
