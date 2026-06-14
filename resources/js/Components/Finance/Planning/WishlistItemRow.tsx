import { router } from '@inertiajs/react';
import { Check, ExternalLink, Pencil, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { type WishlistItem } from '@/types';

import { EditWishlistItemDialog } from './EditWishlistItemDialog';

interface WishlistItemRowProps {
    wishlistItem: WishlistItem;
}

export function WishlistItemRow({ wishlistItem }: WishlistItemRowProps) {
    const [showEdit, setShowEdit] = useState(false);

    function handleTogglePurchased() {
        router.patch(
            route('planning.wishlist.toggle', { wishlistItem: wishlistItem.id }),
            {},
            { preserveScroll: true },
        );
    }

    function handleDelete() {
        if (!confirm(`Delete wishlist item "${wishlistItem.name}"?`)) {
            return;
        }

        router.delete(
            route('planning.wishlist.destroy', { wishlistItem: wishlistItem.id }),
            { preserveScroll: true },
        );
    }

    return (
        <>
            <div className={cn(
                'flex items-center justify-between rounded-lg border border-border bg-card p-3',
                wishlistItem.is_purchased && 'opacity-60',
            )}>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleTogglePurchased}
                        aria-label={wishlistItem.is_purchased ? `Mark "${wishlistItem.name}" as pending` : `Mark "${wishlistItem.name}" as purchased`}
                        className={cn(
                            'size-8 shrink-0 rounded-full border',
                            wishlistItem.is_purchased
                                ? 'border-success bg-success/10 text-success'
                                : 'border-border',
                        )}
                    >
                        {wishlistItem.is_purchased ? (
                            <Check className="size-3.5" />
                        ) : null}
                    </Button>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                'font-medium',
                                wishlistItem.is_purchased && 'line-through',
                            )}>
                                {wishlistItem.name}
                            </span>
                            {wishlistItem.url && (
                                <a
                                    href={wishlistItem.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-primary"
                                    aria-label={`Open link for "${wishlistItem.name}"`}
                                >
                                    <ExternalLink className="size-3.5" />
                                </a>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {wishlistItem.priority !== null && (
                                <span>Priority #{wishlistItem.priority}</span>
                            )}
                            {wishlistItem.is_purchased && (
                                <Badge variant="outline" className="border-success/30 text-success text-[10px] px-1.5 py-0">
                                    Purchased
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={cn(
                        'text-lg font-semibold',
                        wishlistItem.is_purchased ? 'text-success' : 'text-foreground',
                    )}>
                        {formatCurrency(wishlistItem.price)}
                    </span>

                    {wishlistItem.is_purchased ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleTogglePurchased}
                            aria-label={`Undo purchased for "${wishlistItem.name}"`}
                            className="size-8"
                        >
                            <Undo2 className="size-3.5" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowEdit(true)}
                            aria-label={`Edit "${wishlistItem.name}"`}
                            className="size-8"
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        aria-label={`Delete "${wishlistItem.name}"`}
                        className="size-8 text-destructive hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>
            </div>

            <EditWishlistItemDialog
                open={showEdit}
                onOpenChange={setShowEdit}
                wishlistItem={wishlistItem}
            />
        </>
    );
}
