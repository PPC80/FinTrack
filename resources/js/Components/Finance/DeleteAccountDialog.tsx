import { useForm } from '@inertiajs/react';

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
import { formatCurrency } from '@/lib/format';
import { type Account } from '@/types';

interface DeleteAccountDialogProps {
    account: Account | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({ account, open, onOpenChange }: DeleteAccountDialogProps) {
    const { delete: destroy, processing } = useForm({});

    function handleConfirm() {
        if (!account) return;

        destroy(route('accounts.destroy', account.id), {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                        {account && (
                            <>
                                Are you sure you want to delete <strong>{account.name}</strong> with a
                                balance of {formatCurrency(account.balance)}? This action cannot be undone
                                and all transaction history for this account will be lost.
                            </>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={processing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {processing ? 'Deleting...' : 'Delete Account'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
