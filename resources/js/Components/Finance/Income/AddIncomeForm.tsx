import { useForm } from '@inertiajs/react';
import { Loader2, Plus } from 'lucide-react';
import { type FormEvent, useRef } from 'react';

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
import { type Account } from '@/types';

interface AddIncomeFormProps {
    accounts: Account[];
    requestConfirmation?: (action: () => void) => void;
}

export function AddIncomeForm({ accounts, requestConfirmation }: AddIncomeFormProps) {
    const sourceRef = useRef<HTMLInputElement>(null);

    const defaultAccount = accounts.find((account) => account.is_default) ?? accounts[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        source: '',
        amount: '',
        account_id: defaultAccount?.id?.toString() ?? '',
        received_at: new Date().toISOString().split('T')[0],
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const doSubmit = () => {
            post(route('income.store'), {
                onSuccess: () => {
                    reset('source', 'amount');
                    sourceRef.current?.focus();
                },
                preserveScroll: true,
            });
        };

        if (requestConfirmation) {
            requestConfirmation(doSubmit);
        } else {
            doSubmit();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_120px_auto_auto_auto]">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="income-source">Source</Label>
                        <Input
                            ref={sourceRef}
                            id="income-source"
                            placeholder='e.g., "Salary", "Freelance"'
                            value={data.source}
                            onChange={(event) => setData('source', event.target.value)}
                            disabled={processing}
                            autoComplete="off"
                        />
                        {errors.source && (
                            <p className="text-xs text-destructive">{errors.source}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="income-amount">Amount</Label>
                        <Input
                            id="income-amount"
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
                        <Label htmlFor="income-account">Deposit To</Label>
                        <Select
                            value={data.account_id}
                            onValueChange={(value) => setData('account_id', value)}
                            disabled={processing}
                        >
                            <SelectTrigger id="income-account" className="w-[140px]">
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

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="income-date">Date</Label>
                        <Input
                            id="income-date"
                            type="date"
                            value={data.received_at}
                            onChange={(event) => setData('received_at', event.target.value)}
                            disabled={processing}
                            className="w-[140px]"
                        />
                        {errors.received_at && (
                            <p className="text-xs text-destructive">{errors.received_at}</p>
                        )}
                    </div>

                    <div className="flex items-end">
                        <Button
                            type="submit"
                            disabled={processing || !data.source || !data.amount}
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
