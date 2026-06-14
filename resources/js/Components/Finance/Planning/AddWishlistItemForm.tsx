import { useForm } from '@inertiajs/react';
import { Loader2, Plus } from 'lucide-react';
import { type FormEvent, useRef } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export function AddWishlistItemForm() {
    const nameRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        price: '',
        url: '',
        priority: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('planning.wishlist.store'), {
            onSuccess: () => {
                reset();
                nameRef.current?.focus();
            },
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_100px_1fr_80px_auto]">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="wishlist-name">Name</Label>
                        <Input
                            ref={nameRef}
                            id="wishlist-name"
                            placeholder='e.g., "New headphones"'
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            disabled={processing}
                            autoComplete="off"
                        />
                        {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="wishlist-price">Price</Label>
                        <Input
                            id="wishlist-price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={data.price}
                            onChange={(event) => setData('price', event.target.value)}
                            disabled={processing}
                        />
                        {errors.price && (
                            <p className="text-xs text-destructive">{errors.price}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="wishlist-url">URL (optional)</Label>
                        <Input
                            id="wishlist-url"
                            type="url"
                            placeholder="https://..."
                            value={data.url}
                            onChange={(event) => setData('url', event.target.value)}
                            disabled={processing}
                        />
                        {errors.url && (
                            <p className="text-xs text-destructive">{errors.url}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="wishlist-priority">Priority</Label>
                        <Input
                            id="wishlist-priority"
                            type="number"
                            min="1"
                            max="999"
                            placeholder="#"
                            value={data.priority}
                            onChange={(event) => setData('priority', event.target.value)}
                            disabled={processing}
                        />
                        {errors.priority && (
                            <p className="text-xs text-destructive">{errors.priority}</p>
                        )}
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={processing || !data.name || !data.price}
                            className="w-full sm:w-auto"
                        >
                            {processing ? (
                                <Loader2 className="animate-spin" data-icon="inline-start" />
                            ) : (
                                <Plus data-icon="inline-start" />
                            )}
                            Add
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
