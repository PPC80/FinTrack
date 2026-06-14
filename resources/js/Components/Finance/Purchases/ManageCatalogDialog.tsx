import { useForm } from '@inertiajs/react';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { Switch } from '@/Components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { type CatalogItem, type ExpenseCategory } from '@/types';

type DialogView = 'list' | 'create' | 'edit';

interface ManageCatalogDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalogItems: CatalogItem[];
    categories: ExpenseCategory[];
    activeCategoryId: number | null;
    ivaRate: number;
}

function CatalogItemForm({
    item,
    categories,
    activeCategoryId,
    ivaRate,
    onCancel,
    onSuccess,
}: {
    item?: CatalogItem;
    categories: ExpenseCategory[];
    activeCategoryId: number | null;
    ivaRate: number;
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const isEditing = !!item;

    const form = useForm({
        category_id: item ? String(item.category_id) : (activeCategoryId ? String(activeCategoryId) : ''),
        name: item?.name ?? '',
        price: item ? String(item.price) : '',
        has_iva: item?.has_iva ?? false,
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            category_id: parseInt(data.category_id),
            price: parseFloat(data.price),
        }));

        if (isEditing && item) {
            form.put(route('catalog-items.update', item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        } else {
            form.post(route('catalog-items.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        }
    }

    const previewPrice = parseFloat(form.data.price) || 0;
    const previewIva = form.data.has_iva ? previewPrice * ivaRate : 0;
    const previewTotal = previewPrice + previewIva;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isEditing && (
                <div className="flex flex-col gap-2">
                    <Label htmlFor="catalog-category">Category</Label>
                    <Select
                        value={form.data.category_id}
                        onValueChange={(value) => form.setData('category_id', value)}
                    >
                        <SelectTrigger id="catalog-category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={String(category.id)}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {form.errors.category_id && (
                        <p className="text-sm text-destructive">{form.errors.category_id}</p>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-2">
                <Label htmlFor="catalog-name">Item Name</Label>
                <Input
                    id="catalog-name"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    placeholder='e.g., "Atún", "Pasta de dientes"'
                />
                {form.errors.name && (
                    <p className="text-sm text-destructive">{form.errors.name}</p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="catalog-price">Base Price</Label>
                <Input
                    id="catalog-price"
                    type="number"
                    value={form.data.price}
                    onChange={(event) => form.setData('price', event.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                />
                {form.errors.price && (
                    <p className="text-sm text-destructive">{form.errors.price}</p>
                )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                    <Label htmlFor="catalog-iva" className="text-sm font-medium">
                        Gravan IVA ({(ivaRate * 100).toFixed(0)}%)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        {form.data.has_iva ? 'Tax will be added to price' : 'Item is tax-exempt'}
                    </p>
                </div>
                <Switch
                    id="catalog-iva"
                    checked={form.data.has_iva}
                    onCheckedChange={(checked) => form.setData('has_iva', checked === true)}
                />
            </div>

            {previewPrice > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Base price:</span>
                        <span>{formatCurrency(previewPrice)}</span>
                    </div>
                    {form.data.has_iva && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                            <span>{formatCurrency(previewIva)}</span>
                        </div>
                    )}
                    <div className="mt-1 flex justify-between border-t border-border pt-1 font-medium">
                        <span>Total:</span>
                        <span>{formatCurrency(previewTotal)}</span>
                    </div>
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {isEditing ? 'Save Changes' : 'Add Item'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function ManageCatalogDialog({
    open,
    onOpenChange,
    catalogItems,
    categories,
    activeCategoryId,
    ivaRate,
}: ManageCatalogDialogProps) {
    const [view, setView] = useState<DialogView>('list');
    const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

    const deleteForm = useForm({});

    const filteredItems = activeCategoryId
        ? catalogItems.filter((item) => item.category_id === activeCategoryId)
        : catalogItems;

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            setView('list');
            setEditingItem(null);
        }
        onOpenChange(isOpen);
    }

    function handleDelete(item: CatalogItem) {
        deleteForm.delete(route('catalog-items.destroy', item.id), {
            preserveScroll: true,
        });
    }

    function handleEdit(item: CatalogItem) {
        setEditingItem(item);
        setView('edit');
    }

    const dialogTitle = view === 'list'
        ? 'Manage Catalog'
        : view === 'create'
            ? 'Add Catalog Item'
            : 'Edit Catalog Item';

    const dialogDescription = view === 'list'
        ? 'Manage items in your catalog. Prices can be updated at any time.'
        : view === 'create'
            ? 'Add a new item to your catalog with a base price and IVA status.'
            : 'Edit the item details. Changes won\'t affect past purchases.';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                {view === 'list' && (
                    <div className="flex flex-col gap-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setView('create')}
                        >
                            <Plus data-icon="inline-start" />
                            Add New Item
                        </Button>

                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
                                <Package className="mb-2 size-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    No items in catalog yet.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-lg border border-border p-3"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-medium">
                                                    {item.name}
                                                </p>
                                                {item.has_iva && (
                                                    <Badge variant="secondary" className="shrink-0 text-xs">
                                                        IVA
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {formatCurrency(item.price)}
                                                {item.has_iva && (
                                                    <span className="ml-1">
                                                        (total: {formatCurrency(item.price * (1 + ivaRate))})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(item)}
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item)}
                                                disabled={deleteForm.processing}
                                                aria-label={`Remove ${item.name}`}
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {view === 'create' && (
                    <CatalogItemForm
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        ivaRate={ivaRate}
                        onCancel={() => setView('list')}
                        onSuccess={() => setView('list')}
                    />
                )}

                {view === 'edit' && editingItem && (
                    <CatalogItemForm
                        item={editingItem}
                        categories={categories}
                        activeCategoryId={activeCategoryId}
                        ivaRate={ivaRate}
                        onCancel={() => {
                            setEditingItem(null);
                            setView('list');
                        }}
                        onSuccess={() => {
                            setEditingItem(null);
                            setView('list');
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
