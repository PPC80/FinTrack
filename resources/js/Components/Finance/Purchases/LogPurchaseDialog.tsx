import { useForm } from '@inertiajs/react';
import { type FormEvent, useMemo } from 'react';

import { Badge } from '@/Components/ui/badge';
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
import { formatCurrency } from '@/lib/format';
import { type Account, type CatalogItem, type ExpenseCategory } from '@/types';

interface LogPurchaseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogItems: CatalogItem[];
    accounts: Account[];
    categories: ExpenseCategory[];
    activeCategoryId: number | null;
    currentPeriod: string;
    ivaRate: number;
}

export function LogPurchaseDialog({
    open,
    onOpenChange,
    catalogItems,
    accounts,
    categories,
    activeCategoryId,
    currentPeriod,
    ivaRate,
}: LogPurchaseDialogProps) {
    const form = useForm({
        catalog_item_id: '',
        quantity: '1',
        account_id: '',
    });

    const filteredItems = activeCategoryId
        ? catalogItems.filter((item) => item.category_id === activeCategoryId)
        : catalogItems;

    const activeCategory = categories.find((category) => category.id === activeCategoryId);
    const defaultAccountId = activeCategory?.default_account_id;

    const selectedItem = useMemo(() => {
        if (!form.data.catalog_item_id) return null;
        return catalogItems.find((item) => item.id === parseInt(form.data.catalog_item_id)) ?? null;
    }, [form.data.catalog_item_id, catalogItems]);

    const quantity = parseInt(form.data.quantity) || 1;

    const preview = useMemo(() => {
        if (!selectedItem) return null;

        const subtotal = selectedItem.price * quantity;
        const ivaAmount = selectedItem.has_iva ? subtotal * ivaRate : 0;
        const total = subtotal + ivaAmount;

        return { subtotal, ivaAmount, total };
    }, [selectedItem, quantity, ivaRate]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            catalog_item_id: parseInt(data.catalog_item_id),
            quantity: parseInt(data.quantity),
            account_id: parseInt(data.account_id || String(defaultAccountId || 0)),
        }));

        form.post(route('purchases.store', { period: currentPeriod }), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            form.reset();
        }
        onOpenChange(isOpen);
    }

    const effectiveAccountId = form.data.account_id || (defaultAccountId ? String(defaultAccountId) : '');

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log Purchase</DialogTitle>
                    <DialogDescription>
                        Record a purchase from your catalog.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="purchase-item">Item</Label>
                        <Select
                            value={form.data.catalog_item_id}
                            onValueChange={(value) => form.setData('catalog_item_id', value)}
                        >
                            <SelectTrigger id="purchase-item">
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredItems.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        <span className="flex items-center gap-2">
                                            {item.name}
                                            <span className="text-muted-foreground">
                                                {formatCurrency(item.price)}
                                            </span>
                                            {item.has_iva && (
                                                <Badge variant="secondary" className="text-xs">IVA</Badge>
                                            )}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.catalog_item_id && (
                            <p className="text-sm text-destructive">{form.errors.catalog_item_id}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="purchase-quantity">Quantity</Label>
                        <Input
                            id="purchase-quantity"
                            type="number"
                            value={form.data.quantity}
                            onChange={(event) => form.setData('quantity', event.target.value)}
                            min="1"
                            step="1"
                        />
                        {form.errors.quantity && (
                            <p className="text-sm text-destructive">{form.errors.quantity}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="purchase-account">Payment Source</Label>
                        <Select
                            value={effectiveAccountId}
                            onValueChange={(value) => form.setData('account_id', value)}
                        >
                            <SelectTrigger id="purchase-account">
                                <SelectValue placeholder="Select payment source" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={String(account.id)}>
                                        {account.name} ({formatCurrency(account.balance)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.account_id && (
                            <p className="text-sm text-destructive">{form.errors.account_id}</p>
                        )}
                    </div>

                    {preview && (
                        <div className="rounded-lg bg-muted/50 p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                    {selectedItem?.name} × {quantity}:
                                </span>
                                <span>{formatCurrency(preview.subtotal)}</span>
                            </div>
                            {preview.ivaAmount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        IVA ({(ivaRate * 100).toFixed(0)}%):
                                    </span>
                                    <span>{formatCurrency(preview.ivaAmount)}</span>
                                </div>
                            )}
                            <div className="mt-1 flex justify-between border-t border-border pt-1 font-medium">
                                <span>Total:</span>
                                <span>{formatCurrency(preview.total)}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Log Purchase
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
