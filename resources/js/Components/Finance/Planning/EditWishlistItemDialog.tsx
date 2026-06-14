import { useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

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
import { type WishlistItem } from '@/types';

interface EditWishlistItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wishlistItem: WishlistItem;
}

export function EditWishlistItemDialog({ open, onOpenChange, wishlistItem }: EditWishlistItemDialogProps) {
    const { data, setData, put, processing, errors, reset } = useForm({
        name: wishlistItem.name,
        price: wishlistItem.price.toString(),
        url: wishlistItem.url ?? '',
        priority: wishlistItem.priority?.toString() ?? '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        put(route('planning.wishlist.update', { wishlistItem: wishlistItem.id }), {
            onSuccess: () => {
                onOpenChange(false);
            },
            preserveScroll: true,
        });
    }

    function handleClose(isOpen: boolean) {
        if (!isOpen) {
            reset();
        }
        onOpenChange(isOpen);
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Wishlist Item</DialogTitle>
                    <DialogDescription>
                        Update the details of this wishlist item.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-wishlist-name">Name</Label>
                        <Input
                            id="edit-wishlist-name"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            placeholder='e.g., "New headphones"'
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && (
                            <p className="text-sm text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-wishlist-price">Price</Label>
                        <Input
                            id="edit-wishlist-price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={data.price}
                            onChange={(event) => setData('price', event.target.value)}
                            aria-invalid={!!errors.price}
                        />
                        {errors.price && (
                            <p className="text-sm text-destructive">{errors.price}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-wishlist-url">URL (optional)</Label>
                        <Input
                            id="edit-wishlist-url"
                            type="url"
                            value={data.url}
                            onChange={(event) => setData('url', event.target.value)}
                            placeholder="https://..."
                            aria-invalid={!!errors.url}
                        />
                        {errors.url && (
                            <p className="text-sm text-destructive">{errors.url}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="edit-wishlist-priority">Priority (optional)</Label>
                        <Input
                            id="edit-wishlist-priority"
                            type="number"
                            min="1"
                            max="999"
                            value={data.priority}
                            onChange={(event) => setData('priority', event.target.value)}
                            placeholder="1 = highest"
                            aria-invalid={!!errors.priority}
                        />
                        {errors.priority && (
                            <p className="text-sm text-destructive">{errors.priority}</p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
