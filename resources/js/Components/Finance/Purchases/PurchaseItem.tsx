import { useForm } from '@inertiajs/react';
import { ShoppingBag, Trash2 } from 'lucide-react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { type Purchase } from '@/types';

interface PurchaseItemProps {
    purchase: Purchase;
}

export function PurchaseItem({ purchase }: PurchaseItemProps) {
    const deleteForm = useForm({});

    function handleDelete() {
        deleteForm.delete(route('purchases.destroy', purchase.id), {
            preserveScroll: true,
        });
    }

    const purchaseDate = new Date(purchase.purchased_at);
    const formattedDate = purchaseDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = purchaseDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <ShoppingBag className="size-4 text-primary" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{purchase.catalog_item?.name ?? 'Unknown Item'}</p>
                        {purchase.is_planned && (
                            <Badge variant="secondary" className="text-xs">Planned</Badge>
                        )}
                        {purchase.iva_amount > 0 && (
                            <Badge variant="outline" className="text-xs">
                                IVA: {formatCurrency(purchase.iva_amount)}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {purchase.quantity > 1 && `${purchase.quantity}× ${formatCurrency(purchase.unit_price)} · `}
                        {purchase.account?.name} · {formattedDate} {formattedTime}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{formatCurrency(purchase.total)}</p>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete purchase of ${purchase.catalog_item?.name}`}
                        >
                            <Trash2 className="size-4 text-destructive" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remove Purchase</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will remove the purchase of {purchase.catalog_item?.name} and
                                restore {formatCurrency(purchase.total)} to {purchase.account?.name}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteForm.processing}
                            >
                                Remove
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
