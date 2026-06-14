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
        service_payment_fee: '',
        cross_bank_transfer_fee: '',
        withdrawal_atm_fee: '',
        withdrawal_store_fee: '',
        international_iva_rate: '',
        isd_rate: '',
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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

                    <div className="border-t border-border pt-4">
                        <p className="mb-3 text-sm font-medium">Commission Fees</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-service-fee" className="text-xs">Service Payment ($)</Label>
                                <Input
                                    id="create-service-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.service_payment_fee}
                                    onChange={(event) => setData('service_payment_fee', event.target.value)}
                                    placeholder="0.35"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-transfer-fee" className="text-xs">Cross-bank Transfer ($)</Label>
                                <Input
                                    id="create-transfer-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.cross_bank_transfer_fee}
                                    onChange={(event) => setData('cross_bank_transfer_fee', event.target.value)}
                                    placeholder="0.50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-atm-fee" className="text-xs">ATM Withdrawal ($)</Label>
                                <Input
                                    id="create-atm-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.withdrawal_atm_fee}
                                    onChange={(event) => setData('withdrawal_atm_fee', event.target.value)}
                                    placeholder="0.50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-store-fee" className="text-xs">Store Withdrawal ($)</Label>
                                <Input
                                    id="create-store-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.withdrawal_store_fee}
                                    onChange={(event) => setData('withdrawal_store_fee', event.target.value)}
                                    placeholder="0.25"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-intl-iva" className="text-xs">International IVA (%)</Label>
                                <Input
                                    id="create-intl-iva"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.international_iva_rate}
                                    onChange={(event) => setData('international_iva_rate', event.target.value)}
                                    placeholder="15"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="create-isd" className="text-xs">ISD (%)</Label>
                                <Input
                                    id="create-isd"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={data.isd_rate}
                                    onChange={(event) => setData('isd_rate', event.target.value)}
                                    placeholder="5"
                                />
                            </div>
                        </div>
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
