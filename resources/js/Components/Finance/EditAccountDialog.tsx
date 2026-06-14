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
        service_payment_fee: '',
        cross_bank_transfer_fee: '',
        withdrawal_atm_fee: '',
        withdrawal_store_fee: '',
        international_iva_rate: '',
        isd_rate: '',
    });

    useEffect(() => {
        if (account) {
            setData({
                name: account.name,
                is_default: account.is_default,
                service_payment_fee: account.service_payment_fee?.toString() ?? '',
                cross_bank_transfer_fee: account.cross_bank_transfer_fee?.toString() ?? '',
                withdrawal_atm_fee: account.withdrawal_atm_fee?.toString() ?? '',
                withdrawal_store_fee: account.withdrawal_store_fee?.toString() ?? '',
                international_iva_rate: account.international_iva_rate?.toString() ?? '',
                isd_rate: account.isd_rate?.toString() ?? '',
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
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Account</DialogTitle>
                    <DialogDescription>
                        Update account details and commission fees.
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

                    <div className="border-t border-border pt-4">
                        <p className="mb-3 text-sm font-medium">Commission Fees</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="edit-service-fee" className="text-xs">Service Payment ($)</Label>
                                <Input
                                    id="edit-service-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.service_payment_fee}
                                    onChange={(event) => setData('service_payment_fee', event.target.value)}
                                    placeholder="0.35"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="edit-transfer-fee" className="text-xs">Cross-bank Transfer ($)</Label>
                                <Input
                                    id="edit-transfer-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.cross_bank_transfer_fee}
                                    onChange={(event) => setData('cross_bank_transfer_fee', event.target.value)}
                                    placeholder="0.50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="edit-atm-fee" className="text-xs">ATM Withdrawal ($)</Label>
                                <Input
                                    id="edit-atm-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.withdrawal_atm_fee}
                                    onChange={(event) => setData('withdrawal_atm_fee', event.target.value)}
                                    placeholder="0.50"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="edit-store-fee" className="text-xs">Store Withdrawal ($)</Label>
                                <Input
                                    id="edit-store-fee"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.withdrawal_store_fee}
                                    onChange={(event) => setData('withdrawal_store_fee', event.target.value)}
                                    placeholder="0.25"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="edit-intl-iva" className="text-xs">International IVA (%)</Label>
                                <Input
                                    id="edit-intl-iva"
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
                                <Label htmlFor="edit-isd" className="text-xs">ISD (%)</Label>
                                <Input
                                    id="edit-isd"
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
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
