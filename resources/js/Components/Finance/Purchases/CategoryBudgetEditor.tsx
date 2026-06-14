import { useForm } from '@inertiajs/react';
import { Check, Pencil } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { formatCurrency } from '@/lib/format';

interface CategoryBudgetEditorProps {
    categoryId: number;
    categoryName: string;
    currentBudget: number;
    spent: number;
    period: string;
}

export function CategoryBudgetEditor({ categoryId, categoryName, currentBudget, spent, period }: CategoryBudgetEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const remaining = Math.max(0, currentBudget - spent);
    const percentage = currentBudget > 0 ? Math.min(100, Math.round((spent / currentBudget) * 100)) : 0;

    const { data, setData, post, processing } = useForm({
        category_id: categoryId.toString(),
        period: period,
        amount: currentBudget > 0 ? currentBudget.toString() : '',
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        post(route('category-budgets.store'), {
            preserveScroll: true,
            onSuccess: () => setIsEditing(false),
        });
    }

    if (currentBudget === 0 && !isEditing) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3">
                <span className="text-sm text-muted-foreground">No budget set for {categoryName}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                >
                    <Pencil className="size-3" data-icon="inline-start" />
                    Set Budget
                </Button>
            </div>
        );
    }

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <span className="text-sm font-medium">{categoryName} Budget:</span>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.amount}
                    onChange={(event) => setData('amount', event.target.value)}
                    className="w-32"
                    placeholder="0.00"
                />
                <Button type="submit" size="sm" disabled={processing}>
                    <Check className="size-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                </Button>
            </form>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{categoryName} Budget</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit budget"
                    >
                        <Pencil className="size-3" />
                    </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                    {formatCurrency(spent)} / {formatCurrency(currentBudget)}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                    className={`h-full rounded-full transition-all ${
                        percentage >= 90 ? 'bg-destructive' : percentage >= 70 ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrency(remaining)} remaining
            </p>
        </div>
    );
}
