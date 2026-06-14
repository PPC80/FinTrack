import { useForm } from '@inertiajs/react';
import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { type Account, type BasicExpense } from '@/types';

interface BasicExpenseItemProps {
    expense: BasicExpense;
    accounts: Account[];
    defaultAccountId: number | null;
    requestConfirmation?: (action: () => void) => void;
}

export function BasicExpenseItem({ expense, accounts, defaultAccountId, requestConfirmation }: BasicExpenseItemProps) {
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [selectedAccountId, setSelectedAccountId] = useState<string>(
        String(expense.account_id ?? defaultAccountId ?? ''),
    );

    const toggleForm = useForm({
        is_paid: !expense.is_paid,
        account_id: expense.account_id ?? defaultAccountId ?? null,
    });

    const amountForm = useForm({
        amount: String(expense.amount),
    });

    function handleTogglePaid() {
        const willBePaid = !expense.is_paid;
        const accountId = willBePaid ? parseInt(selectedAccountId) : null;

        if (willBePaid && !selectedAccountId) {
            return;
        }

        const doToggle = () => {
            toggleForm.transform(() => ({
                is_paid: willBePaid,
                account_id: accountId,
            }));

            toggleForm.patch(route('expenses.toggle-paid', expense.id), {
                preserveScroll: true,
            });
        };

        if (requestConfirmation) {
            requestConfirmation(doToggle);
        } else {
            doToggle();
        }
    }

    function handleSaveAmount() {
        const doSave = () => {
            amountForm.patch(route('expenses.update-amount', expense.id), {
                preserveScroll: true,
                onSuccess: () => setIsEditingAmount(false),
            });
        };

        if (requestConfirmation) {
            requestConfirmation(doSave);
        } else {
            doSave();
        }
    }

    function handleCancelEditAmount() {
        amountForm.setData('amount', String(expense.amount));
        setIsEditingAmount(false);
    }

    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
            <Switch
                checked={expense.is_paid}
                onCheckedChange={handleTogglePaid}
                disabled={toggleForm.processing}
                aria-label={`Mark ${expense.name} as ${expense.is_paid ? 'unpaid' : 'paid'}`}
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className={expense.is_paid ? 'line-through text-muted-foreground' : 'font-medium'}>
                        {expense.name}
                    </span>
                    {expense.is_paid && (
                        <Badge variant="outline" className="text-success border-success/30">
                            Paid
                        </Badge>
                    )}
                </div>

                {expense.is_paid && expense.account && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                        via {expense.account.name}
                    </p>
                )}
            </div>

            {!expense.is_paid && !isEditingAmount && (
                <Select
                    value={selectedAccountId}
                    onValueChange={setSelectedAccountId}
                >
                    <SelectTrigger className="w-[140px]" aria-label="Payment source">
                        <SelectValue placeholder="Account" />
                    </SelectTrigger>
                    <SelectContent>
                        {accounts.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                                {account.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            {isEditingAmount ? (
                <div className="flex items-center gap-1">
                    <Input
                        type="number"
                        value={amountForm.data.amount}
                        onChange={(event) => amountForm.setData('amount', event.target.value)}
                        className="w-[100px] text-right"
                        step="0.01"
                        min="0.01"
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') handleSaveAmount();
                            if (event.key === 'Escape') handleCancelEditAmount();
                        }}
                        autoFocus
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSaveAmount}
                        disabled={amountForm.processing}
                        className="size-8"
                        aria-label="Save amount"
                    >
                        <Check className="size-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEditAmount}
                        className="size-8"
                        aria-label="Cancel editing"
                    >
                        <X className="size-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-1">
                    <span className={`text-right font-semibold tabular-nums ${expense.is_paid ? 'text-muted-foreground' : ''}`}>
                        {formatCurrency(expense.amount)}
                    </span>
                    {!expense.is_paid && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditingAmount(true)}
                            className="size-8"
                            aria-label="Edit amount"
                        >
                            <Pencil className="size-3" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
