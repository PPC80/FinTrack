import { useForm } from '@inertiajs/react';
import { Loader2, Plus } from 'lucide-react';
import { type FormEvent, useRef } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

export function AddPredictedIncomeForm() {
    const descriptionRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        amount: '',
        expected_date: '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('planning.predicted-income.store'), {
            onSuccess: () => {
                reset();
                descriptionRef.current?.focus();
            },
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px_auto]">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="predicted-description">Description</Label>
                        <Input
                            ref={descriptionRef}
                            id="predicted-description"
                            placeholder='e.g., "Ingreso freelance"'
                            value={data.description}
                            onChange={(event) => setData('description', event.target.value)}
                            disabled={processing}
                            autoComplete="off"
                        />
                        {errors.description && (
                            <p className="text-xs text-destructive">{errors.description}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="predicted-amount">Amount</Label>
                        <Input
                            id="predicted-amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            value={data.amount}
                            onChange={(event) => setData('amount', event.target.value)}
                            disabled={processing}
                        />
                        {errors.amount && (
                            <p className="text-xs text-destructive">{errors.amount}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="predicted-date">Expected Date</Label>
                        <Input
                            id="predicted-date"
                            type="date"
                            value={data.expected_date}
                            onChange={(event) => setData('expected_date', event.target.value)}
                            disabled={processing}
                        />
                        {errors.expected_date && (
                            <p className="text-xs text-destructive">{errors.expected_date}</p>
                        )}
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={processing || !data.description || !data.amount}
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
