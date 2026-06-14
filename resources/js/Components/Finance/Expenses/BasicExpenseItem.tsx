import { useForm } from '@inertiajs/react';
import { Check, Pencil, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { formatCurrency } from '@/lib/format';
import { type Account, type BasicExpense, type BasicExpensePaymentMethod } from '@/types';

function getOrdinalSuffix(day: number): string {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

const PAYMENT_METHOD_LABELS: Record<BasicExpensePaymentMethod, string> = {
    direct: 'Direct (no fee)',
    service_payment: 'Service Payment',
    bank_transfer: 'Bank Transfer',
    international: 'International',
};

function calculateCommissionPreview(account: Account | undefined, amount: number, paymentMethod: BasicExpensePaymentMethod): number {
    if (!account) return 0;

    switch (paymentMethod) {
        case 'service_payment':
            return account.service_payment_fee ?? 0;
        case 'bank_transfer':
            return account.cross_bank_transfer_fee ?? 0;
        case 'international': {
            const ivaRate = account.international_iva_rate ?? 0;
            const isdRate = account.isd_rate ?? 0;
            return Math.round((amount * (ivaRate / 100) + amount * (isdRate / 100)) * 100) / 100;
        }
        default:
            return 0;
    }
}

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
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<BasicExpensePaymentMethod>('direct');

    const toggleForm = useForm({
        is_paid: !expense.is_paid,
        account_id: expense.account_id ?? defaultAccountId ?? null,
        payment_method: null as BasicExpensePaymentMethod | null,
    });

    const amountForm = useForm({
        amount: String(expense.amount),
    });

    const selectedAccount = useMemo(
        () => accounts.find((account) => String(account.id) === selectedAccountId),
        [accounts, selectedAccountId],
    );

    const commissionPreview = useMemo(
        () => calculateCommissionPreview(selectedAccount, expense.amount, selectedPaymentMethod),
        [selectedAccount, expense.amount, selectedPaymentMethod],
    );

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
                payment_method: willBePaid ? selectedPaymentMethod : null,
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
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
            <div className="flex items-center gap-3">
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
                        {expense.is_paid && expense.payment_method && expense.payment_method !== 'direct' && (
                            <Badge variant="secondary" className="text-xs">
                                {PAYMENT_METHOD_LABELS[expense.payment_method]}
                            </Badge>
                        )}
                    </div>

                    {expense.due_day_of_month && !expense.is_paid && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Due on the {expense.due_day_of_month}{getOrdinalSuffix(expense.due_day_of_month)}
                        </p>
                    )}
                    {expense.is_paid && expense.account && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            via {expense.account.name}
                            {expense.commission_amount > 0 && (
                                <span className="text-warning"> (+{formatCurrency(expense.commission_amount)} fee)</span>
                            )}
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

            {!expense.is_paid && !isEditingAmount && (
                <div className="flex items-center gap-3 pl-12">
                    <Select
                        value={selectedPaymentMethod}
                        onValueChange={(value) => setSelectedPaymentMethod(value as BasicExpensePaymentMethod)}
                    >
                        <SelectTrigger className="w-[180px] h-8 text-xs" aria-label="Payment method">
                            <SelectValue placeholder="Payment method" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.entries(PAYMENT_METHOD_LABELS) as [BasicExpensePaymentMethod, string][]).map(
                                ([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                    {commissionPreview > 0 && (
                        <span className="text-xs text-muted-foreground">
                            Fee: <span className="text-warning font-medium">{formatCurrency(commissionPreview)}</span>
                            {' '}· Total: {formatCurrency(expense.amount + commissionPreview)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
