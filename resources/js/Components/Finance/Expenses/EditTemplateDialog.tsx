import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect } from 'react';

import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { type BasicExpenseTemplate } from '@/types';

interface EditTemplateDialogProps {
    template: BasicExpenseTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditTemplateDialog({ template, open, onOpenChange }: EditTemplateDialogProps) {
    const form = useForm({
        name: '',
        default_amount: '',
    });

    useEffect(() => {
        if (template) {
            form.setData({
                name: template.name,
                default_amount: String(template.default_amount),
            });
        }
    }, [template]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        if (!template) return;

        form.transform((data) => ({
            ...data,
            default_amount: parseFloat(data.default_amount),
        }));

        form.put(route('expenses.templates.update', template.id), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Expense Template</DialogTitle>
                    <DialogDescription>
                        Changes to the template will apply to future months.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-template-name">Name</Label>
                        <Input
                            id="edit-template-name"
                            value={form.data.name}
                            onChange={(event) => form.setData('name', event.target.value)}
                        />
                        {form.errors.name && (
                            <p className="text-sm text-destructive">{form.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-template-amount">Default Amount</Label>
                        <Input
                            id="edit-template-amount"
                            type="number"
                            value={form.data.default_amount}
                            onChange={(event) => form.setData('default_amount', event.target.value)}
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
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
