import { useForm } from '@inertiajs/react';
import { Loader2, Plus } from 'lucide-react';
import { type FormEvent, useEffect, useRef } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { type Account } from '@/types';

interface QuickAddFormProps {
    accounts: Account[];
}

export function QuickAddForm({ accounts }: QuickAddFormProps) {
    const descriptionRef = useRef<HTMLInputElement>(null);

    const defaultAccount = accounts.find((account) => account.is_default) ?? accounts[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        description: '',
        amount: '',
        is_guilty: false,
        account_id: defaultAccount?.id?.toString() ?? '',
    });

    useEffect(() => {
        if (defaultAccount) {
            setData('account_id', defaultAccount.id.toString());
        }
    }, [defaultAccount?.id]);

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        post(route('misc-expenses.store'), {
            onSuccess: () => {
                reset('description', 'amount', 'is_guilty');
                descriptionRef.current?.focus();
            },
            preserveScroll: true,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px_auto_auto_auto]">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            ref={descriptionRef}
                            id="description"
                            placeholder='e.g., "McDonalds", "Coffee"'
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
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
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
                        <Label htmlFor="account">Source</Label>
                        <Select
                            value={data.account_id}
                            onValueChange={(value) => setData('account_id', value)}
                            disabled={processing}
                        >
                            <SelectTrigger id="account" className="w-[140px]">
                                <SelectValue placeholder="Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id.toString()}>
                                        {account.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.account_id && (
                            <p className="text-xs text-destructive">{errors.account_id}</p>
                        )}
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                        <Label htmlFor="guilty">Guilty?</Label>
                        <Switch
                            id="guilty"
                            checked={data.is_guilty}
                            onCheckedChange={(checked) => setData('is_guilty', checked)}
                            disabled={processing}
                            className="mt-1"
                        />
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
                            Log
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
