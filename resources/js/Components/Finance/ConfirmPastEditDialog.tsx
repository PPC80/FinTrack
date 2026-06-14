import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';

interface ConfirmPastEditDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    period: string;
}

export function ConfirmPastEditDialog({
    open,
    onConfirm,
    onCancel,
    period,
}: ConfirmPastEditDialogProps) {
    const periodDisplay = formatPeriodLabel(period);

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Edit past month data?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to modify data for{' '}
                        <strong>{periodDisplay}</strong>. Changes to past months
                        may affect carry-over calculations for subsequent months.
                        Are you sure you want to proceed?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Yes, edit past data
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function formatPeriodLabel(period: string): string {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);

    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
