import { useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { type Account, type ExpenseCategory, type ExpenseCategoryType } from '@/types';

type DialogView = 'list' | 'create' | 'edit';

interface ManageCategoriesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: ExpenseCategory[];
    accounts: Account[];
}

const CATEGORY_TYPE_LABELS: Record<ExpenseCategoryType, string> = {
    fixed: 'Fixed',
    item_based: 'Item-based',
    trip_based: 'Trip-based',
    misc: 'Misc',
};

function CategoryForm({
    category,
    accounts,
    onCancel,
    onSuccess,
}: {
    category?: ExpenseCategory;
    accounts: Account[];
    onCancel: () => void;
    onSuccess: () => void;
}) {
    const isEditing = !!category;

    const form = useForm({
        name: category?.name ?? '',
        type: category?.type ?? 'fixed',
        default_account_id: category?.default_account_id ? String(category.default_account_id) : '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const transformedData = {
            name: form.data.name,
            type: form.data.type,
            default_account_id: form.data.default_account_id ? parseInt(form.data.default_account_id) : null,
        };

        if (isEditing) {
            form.transform(() => transformedData);
            form.put(route('expense-categories.update', category.id), {
                preserveScroll: true,
                onSuccess,
            });
        } else {
            form.transform(() => transformedData);
            form.post(route('expense-categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    form.reset();
                    onSuccess();
                },
            });
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                    id="category-name"
                    value={form.data.name}
                    onChange={(event) => form.setData('name', event.target.value)}
                    placeholder="Category name"
                    autoFocus
                />
                {form.errors.name && (
                    <p className="text-sm text-destructive">{form.errors.name}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="category-type">Type</Label>
                <Select
                    value={form.data.type}
                    onValueChange={(value) => form.setData('type', value as ExpenseCategoryType)}
                >
                    <SelectTrigger id="category-type">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="item_based">Item-based</SelectItem>
                        <SelectItem value="trip_based">Trip-based</SelectItem>
                        <SelectItem value="misc">Misc</SelectItem>
                    </SelectContent>
                </Select>
                {form.errors.type && (
                    <p className="text-sm text-destructive">{form.errors.type}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="category-account">Default Payment Source</Label>
                <Select
                    value={form.data.default_account_id}
                    onValueChange={(value) => form.setData('default_account_id', value)}
                >
                    <SelectTrigger id="category-account">
                        <SelectValue placeholder="None (select per expense)" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                                {account.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.errors.default_account_id && (
                    <p className="text-sm text-destructive">{form.errors.default_account_id}</p>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={form.processing}>
                    {isEditing ? 'Save Changes' : 'Create Category'}
                </Button>
            </div>
        </form>
    );
}

export function ManageCategoriesDialog({ open, onOpenChange, categories, accounts }: ManageCategoriesDialogProps) {
    const [view, setView] = useState<DialogView>('list');
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

    const deleteForm = useForm({});

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            setView('list');
            setEditingCategory(null);
        }
        onOpenChange(isOpen);
    }

    function handleEdit(category: ExpenseCategory) {
        setEditingCategory(category);
        setView('edit');
    }

    function handleDelete(category: ExpenseCategory) {
        if (!confirm(`Delete category "${category.name}"? Expenses in this category will also be removed.`)) {
            return;
        }

        deleteForm.delete(route('expense-categories.destroy', category.id), {
            preserveScroll: true,
        });
    }

    function handleFormSuccess() {
        setView('list');
        setEditingCategory(null);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {view === 'list' && 'Manage Categories'}
                        {view === 'create' && 'Create Category'}
                        {view === 'edit' && 'Edit Category'}
                    </DialogTitle>
                    <DialogDescription>
                        {view === 'list' && 'Organize your expenses into categories with optional default payment sources.'}
                        {view === 'create' && 'Add a new expense category.'}
                        {view === 'edit' && `Editing "${editingCategory?.name}".`}
                    </DialogDescription>
                </DialogHeader>

                {view === 'list' && (
                    <div className="space-y-3">
                        <div className="space-y-2 max-h-[320px] overflow-y-auto">
                            {categories.map((category) => (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg border border-border p-3"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{category.name}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {CATEGORY_TYPE_LABELS[category.type]}
                                            </Badge>
                                        </div>
                                        {category.default_account && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Default: {category.default_account.name}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => handleEdit(category)}
                                            aria-label={`Edit ${category.name}`}
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(category)}
                                            aria-label={`Delete ${category.name}`}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <p className="py-6 text-center text-muted-foreground">
                                    No categories yet. Create one to get started.
                                </p>
                            )}
                        </div>

                        <Separator />

                        <Button
                            onClick={() => setView('create')}
                            variant="outline"
                            className="w-full"
                        >
                            <Plus data-icon="inline-start" />
                            Add Category
                        </Button>
                    </div>
                )}

                {view === 'create' && (
                    <CategoryForm
                        accounts={accounts}
                        onCancel={() => setView('list')}
                        onSuccess={handleFormSuccess}
                    />
                )}

                {view === 'edit' && editingCategory && (
                    <CategoryForm
                        category={editingCategory}
                        accounts={accounts}
                        onCancel={() => setView('list')}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
