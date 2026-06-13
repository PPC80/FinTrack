import { Head, router, usePage } from '@inertiajs/react';
import { Plus, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { BasicExpenseItem } from '@/Components/Finance/Expenses/BasicExpenseItem';
import { CreateExpenseDialog } from '@/Components/Finance/Expenses/CreateExpenseDialog';
import { DeleteTemplateDialog } from '@/Components/Finance/Expenses/DeleteTemplateDialog';
import { EditTemplateDialog } from '@/Components/Finance/Expenses/EditTemplateDialog';
import { ExpenseSummaryCards } from '@/Components/Finance/Expenses/ExpenseSummaryCards';
import { ManageCategoriesDialog } from '@/Components/Finance/Expenses/ManageCategoriesDialog';
import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import {
    type Account,
    type BasicExpense,
    type BasicExpenseTemplate,
    type ExpenseCategory,
    type ExpenseSummary,
    type PageProps,
} from '@/types';

interface ExpensesPageProps extends PageProps {
    expenses: { data: BasicExpense[] };
    summary: ExpenseSummary;
    categories: { data: ExpenseCategory[] };
    templates: { data: BasicExpenseTemplate[] };
    accounts: { data: Account[] };
    currentPeriod: string;
}

export default function ExpensesIndex() {
    const { expenses, summary, categories, templates, accounts, currentPeriod, flash } =
        usePage<ExpensesPageProps>().props;

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<BasicExpenseTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<BasicExpenseTemplate | null>(null);

    const expenseList = expenses.data;
    const categoryList = categories.data;
    const accountList = accounts.data;
    const templateList = templates.data;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    function handlePeriodChange(period: string) {
        router.get(route('expenses.index', { period }), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }

    const expensesByCategory = categoryList
        .map((category) => ({
            category,
            expenses: expenseList.filter((expense) => expense.category_id === category.id),
        }))
        .filter((group) => group.expenses.length > 0);

    const ungroupedExpenses = expenseList.filter(
        (expense) => !categoryList.some((category) => category.id === expense.category_id),
    );

    return (
        <AppLayout>
            <Head title="Expenses" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
                        <p className="text-muted-foreground">
                            Track and manage your monthly expenses.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowCategoriesDialog(true)}
                            aria-label="Manage categories"
                        >
                            <Settings className="size-4" />
                        </Button>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus data-icon="inline-start" />
                            Add Expense
                        </Button>
                    </div>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                <ExpenseSummaryCards summary={summary} />

                <div className="space-y-6">
                    {expensesByCategory.map(({ category, expenses: categoryExpenses }) => (
                        <div key={category.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{category.name}</h3>
                                <span className="text-sm text-muted-foreground">
                                    {categoryExpenses.filter((expense) => expense.is_paid).length}/{categoryExpenses.length} paid
                                </span>
                            </div>
                            <div className="space-y-2">
                                {categoryExpenses.map((expense) => (
                                    <BasicExpenseItem
                                        key={expense.id}
                                        expense={expense}
                                        accounts={accountList}
                                        defaultAccountId={category.default_account_id}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    {ungroupedExpenses.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold">Other</h3>
                            <div className="space-y-2">
                                {ungroupedExpenses.map((expense) => (
                                    <BasicExpenseItem
                                        key={expense.id}
                                        expense={expense}
                                        accounts={accountList}
                                        defaultAccountId={null}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {expenseList.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                            <p className="text-muted-foreground mb-4">
                                No expenses for this month yet.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus data-icon="inline-start" />
                                Add Your First Expense
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <CreateExpenseDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                categories={categoryList}
                currentPeriod={currentPeriod}
            />

            <EditTemplateDialog
                template={editingTemplate}
                open={!!editingTemplate}
                onOpenChange={(open) => !open && setEditingTemplate(null)}
            />

            <DeleteTemplateDialog
                template={deletingTemplate}
                open={!!deletingTemplate}
                onOpenChange={(open) => !open && setDeletingTemplate(null)}
            />

            <ManageCategoriesDialog
                open={showCategoriesDialog}
                onOpenChange={setShowCategoriesDialog}
                categories={categoryList}
                accounts={accountList}
            />
        </AppLayout>
    );
}
