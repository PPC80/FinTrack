import { useForm } from '@inertiajs/react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/Components/ui/alert-dialog';
import { type BasicExpenseTemplate } from '@/types';

interface DeleteTemplateDialogProps {
    template: BasicExpenseTemplate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteTemplateDialog({ template, open, onOpenChange }: DeleteTemplateDialogProps) {
    const form = useForm({});

    function handleDelete() {
        if (!template) return;

        form.delete(route('expenses.templates.destroy', template.id), {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Expense Template</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will remove &quot;{template?.name}&quot; from future months.
                        Historical records will not be affected.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={form.processing}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
