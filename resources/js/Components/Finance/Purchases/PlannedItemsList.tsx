import { useForm } from '@inertiajs/react';
import { Check, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

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
import {
    type Account,
    type CatalogItem,
    type ExpenseCategory,
    type PlannedItem,
    type PlannedSummary,
} from '@/types';

interface PlannedItemsListProps {
    plannedItems: PlannedItem[];
    plannedSummary: PlannedSummary;
    catalogItems: CatalogItem[];
    accounts: Account[];
    categories: ExpenseCategory[];
    activeCategoryId: number | null;
    currentPeriod: string;
    ivaRate: number;
}

export function PlannedItemsList({
    plannedItems,
    plannedSummary,
    catalogItems,
    accounts,
    categories,
    activeCategoryId,
    currentPeriod,
    ivaRate,
}: PlannedItemsListProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [buyingItem, setBuyingItem] = useState<PlannedItem | null>(null);

    const activeCategory = categories.find((category) => category.id === activeCategoryId);
    const defaultAccountId = activeCategory?.default_account_id;

    const filteredCatalogItems = activeCategoryId
        ? catalogItems.filter((item) => item.category_id === activeCategoryId)
        : catalogItems;

    const existingItemIds = new Set(plannedItems.map((planned) => planned.catalog_item_id));
    const availableCatalogItems = filteredCatalogItems.filter((item) => !existingItemIds.has(item.id));

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Planned List</h3>
                    <Badge variant="secondary">
                        {plannedSummary.purchased_count}/{plannedSummary.total_items} bought
                    </Badge>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                    disabled={availableCatalogItems.length === 0}
                >
                    <Plus data-icon="inline-start" />
                    Add to List
                </Button>
            </div>

            {plannedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
                    <ClipboardList className="mb-2 size-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        No planned items this month.
                    </p>
                    {availableCatalogItems.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowAddDialog(true)}
                        >
                            Add items to your list
                        </Button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {plannedItems.map((plannedItem) => (
                        <PlannedItemRow
                            key={plannedItem.id}
                            plannedItem={plannedItem}
                            accounts={accounts}
                            defaultAccountId={defaultAccountId ?? null}
                            ivaRate={ivaRate}
                            onBuy={() => setBuyingItem(plannedItem)}
                        />
                    ))}
                </div>
            )}

            <AddPlannedItemDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                availableItems={availableCatalogItems}
                currentPeriod={currentPeriod}
            />

            <BuyPlannedItemDialog
                plannedItem={buyingItem}
                open={!!buyingItem}
                onOpenChange={(isOpen) => !isOpen && setBuyingItem(null)}
                accounts={accounts}
                defaultAccountId={defaultAccountId ?? null}
                ivaRate={ivaRate}
            />
        </div>
    );
}

function PlannedItemRow({
    plannedItem,
    ivaRate,
    onBuy,
}: {
    plannedItem: PlannedItem;
    accounts: Account[];
    defaultAccountId: number | null;
    ivaRate: number;
    onBuy: () => void;
}) {
    const deleteForm = useForm({});

    const item = plannedItem.catalog_item;
    const subtotal = item.price * plannedItem.quantity;
    const ivaAmount = item.has_iva ? subtotal * ivaRate : 0;
    const estimatedTotal = subtotal + ivaAmount;

    function handleDelete() {
        deleteForm.delete(route('planned-items.destroy', plannedItem.id), {
            preserveScroll: true,
        });
    }

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${plannedItem.is_purchased ? 'line-through text-muted-foreground' : ''}`}>
                            {item.name}
                        </p>
                        {plannedItem.is_purchased && (
                            <Badge variant="default" className="text-xs">
                                <Check data-icon="inline-start" />
                                Bought
                            </Badge>
                        )}
                        {item.has_iva && !plannedItem.is_purchased && (
                            <Badge variant="secondary" className="text-xs">IVA</Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {plannedItem.quantity > 1 && `${plannedItem.quantity}× `}
                        {formatCurrency(item.price)}
                        {' · '}
                        Est. {formatCurrency(estimatedTotal)}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {!plannedItem.is_purchased && (
                    <>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={onBuy}
                        >
                            Buy
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDelete}
                            disabled={deleteForm.processing}
                            aria-label={`Remove ${item.name} from list`}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

function AddPlannedItemDialog({
    open,
    onOpenChange,
    availableItems,
    currentPeriod,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableItems: CatalogItem[];
    currentPeriod: string;
}) {
    const form = useForm({
        catalog_item_id: '',
        quantity: '1',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            catalog_item_id: parseInt(data.catalog_item_id),
            quantity: parseInt(data.quantity),
        }));

        form.post(route('planned-items.store', { period: currentPeriod }), {
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

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add to Planned List</DialogTitle>
                    <DialogDescription>
                        Select an item from your catalog to add to this month&apos;s planned list.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="planned-item">Item</Label>
                        <Select
                            value={form.data.catalog_item_id}
                            onValueChange={(value) => form.setData('catalog_item_id', value)}
                        >
                            <SelectTrigger id="planned-item">
                                <SelectValue placeholder="Select an item" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableItems.map((item) => (
                                    <SelectItem key={item.id} value={String(item.id)}>
                                        {item.name} — {formatCurrency(item.price)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.errors.catalog_item_id && (
                            <p className="text-sm text-destructive">{form.errors.catalog_item_id}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="planned-quantity">Quantity</Label>
                        <Input
                            id="planned-quantity"
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Add to List
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function BuyPlannedItemDialog({
    plannedItem,
    open,
    onOpenChange,
    accounts,
    defaultAccountId,
    ivaRate,
}: {
    plannedItem: PlannedItem | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    accounts: Account[];
    defaultAccountId: number | null;
    ivaRate: number;
}) {
    const form = useForm({
        account_id: defaultAccountId ? String(defaultAccountId) : '',
    });

    if (!plannedItem) return null;

    const item = plannedItem.catalog_item;
    const subtotal = item.price * plannedItem.quantity;
    const ivaAmount = item.has_iva ? subtotal * ivaRate : 0;
    const total = subtotal + ivaAmount;

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            account_id: parseInt(data.account_id),
        }));

        form.post(route('planned-items.purchase', plannedItem!.id), {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onOpenChange(false);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Buy {item.name}</DialogTitle>
                    <DialogDescription>
                        Confirm the purchase and select a payment source.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                {item.name} × {plannedItem.quantity}:
                            </span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        {ivaAmount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                                <span>{formatCurrency(ivaAmount)}</span>
                            </div>
                        )}
                        <div className="mt-1 flex justify-between border-t border-border pt-1 font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="buy-account">Payment Source</Label>
                        <Select
                            value={form.data.account_id}
                            onValueChange={(value) => form.setData('account_id', value)}
                        >
                            <SelectTrigger id="buy-account">
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Confirm Purchase
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
