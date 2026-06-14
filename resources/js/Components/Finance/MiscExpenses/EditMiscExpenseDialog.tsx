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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { type Account, type MiscExpense } from '@/types';

interface EditMiscExpenseDialogProps {
    expense: MiscExpense | null;
    accounts: Account[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditMiscExpenseDialog({ expense, accounts, open, onOpenChange }: EditMiscExpenseDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        description: '',
        amount: '',
        is_guilty: false,
        is_taxi: false,
        is_bank_transfer: false,
        is_international: false,
        account_id: '',
    });

    useEffect(() => {
        if (expense) {
            setData({
                description: expense.description,
                amount: expense.amount.toString(),
                is_guilty: expense.is_guilty,
                is_taxi: expense.is_taxi,
                is_bank_transfer: expense.is_bank_transfer,
                is_international: expense.is_international,
                account_id: expense.account_id.toString(),
            });
        }
    }, [expense]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!expense) return;

        put(route('misc-expenses.update', expense.id), {
            onSuccess: () => {
                reset();
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
                    <DialogTitle>Edit Misc Expense</DialogTitle>
                    <DialogDescription>
                        Update this expense. Balance will be recalculated.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-misc-desc">Description</Label>
                        <Input
                            id="edit-misc-desc"
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            aria-invalid={!!errors.description}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-misc-amount">Amount</Label>
                        <Input
                            id="edit-misc-amount"
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
                        <Label htmlFor="edit-misc-account">Payment Source</Label>
                        <Select
                            value={data.account_id}
                            onValueChange={(value) => setData('account_id', value)}
                        >
                            <SelectTrigger id="edit-misc-account">
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                        {account.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="edit-misc-guilty" className="text-sm">Guilty?</Label>
                            <Switch
                                id="edit-misc-guilty"
                                checked={data.is_guilty}
                                onCheckedChange={(checked) => setData('is_guilty', checked)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-3">
                        <div className="flex items-center gap-2">
                            <input
                                id="edit-misc-taxi"
                                type="checkbox"
                                checked={data.is_taxi}
                                onChange={(event) => setData('is_taxi', event.target.checked)}
                                className="size-4 rounded border-border"
                            />
                            <Label htmlFor="edit-misc-taxi" className="text-xs font-normal">Taxi</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="edit-misc-transfer"
                                type="checkbox"
                                checked={data.is_bank_transfer}
                                onChange={(event) => setData('is_bank_transfer', event.target.checked)}
                                className="size-4 rounded border-border"
                            />
                            <Label htmlFor="edit-misc-transfer" className="text-xs font-normal">Bank Transfer</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                id="edit-misc-intl"
                                type="checkbox"
                                checked={data.is_international}
                                onChange={(event) => setData('is_international', event.target.checked)}
                                className="size-4 rounded border-border"
                            />
                            <Label htmlFor="edit-misc-intl" className="text-xs font-normal">International</Label>
                        </div>
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
