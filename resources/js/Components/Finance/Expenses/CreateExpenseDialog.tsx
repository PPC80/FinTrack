import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { type ExpenseCategory } from '@/types';

interface CreateExpenseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: ExpenseCategory[];
    currentPeriod: string;
}

export function CreateExpenseDialog({ open, onOpenChange, categories, currentPeriod }: CreateExpenseDialogProps) {
    const form = useForm({
        category_id: '',
        name: '',
        default_amount: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            category_id: parseInt(data.category_id),
            default_amount: parseFloat(data.default_amount),
        }));

        form.post(route('expenses.templates.store', { period: currentPeriod }), {
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
                    <DialogTitle>Add Expense</DialogTitle>
                    <DialogDescription>
                        Add a recurring expense. It will appear every month going forward.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="expense-category">Category</Label>
                        <Select
                            value={form.data.category_id}
                            onValueChange={(value) => form.setData('category_id', value)}
                        >
                            <SelectTrigger id="expense-category">
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

                    <div className="space-y-2">
                        <Label htmlFor="expense-name">Name</Label>
                        <Input
                            id="expense-name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                            placeholder="e.g., Rent, Internet, Electricity"
                        />
                        {form.errors.name && (
                            <p className="text-sm text-destructive">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expense-amount">Monthly Amount</Label>
                        <Input
                            id="expense-amount"
                            type="number"
                            value={form.data.default_amount}
                            onChange={(event) => form.setData('default_amount', event.target.value)}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                        />
                        {form.errors.default_amount && (
                            <p className="text-sm text-destructive">{form.errors.default_amount}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Add Expense
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
