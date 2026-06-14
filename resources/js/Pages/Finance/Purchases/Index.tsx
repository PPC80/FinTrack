import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Package, Plus, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { MonthNavigator } from '@/Components/Finance/Expenses/MonthNavigator';
import { ConfirmPastEditDialog } from '@/Components/Finance/ConfirmPastEditDialog';
import { PastMonthBanner } from '@/Components/Finance/PastMonthBanner';
import { LogPurchaseDialog } from '@/Components/Finance/Purchases/LogPurchaseDialog';
import { ManageCatalogDialog } from '@/Components/Finance/Purchases/ManageCatalogDialog';
import { PlannedItemsList } from '@/Components/Finance/Purchases/PlannedItemsList';
import { PurchaseItem } from '@/Components/Finance/Purchases/PurchaseItem';
import { PurchaseSummaryCards } from '@/Components/Finance/Purchases/PurchaseSummaryCards';
import { CategoryBudgetEditor } from '@/Components/Finance/Purchases/CategoryBudgetEditor';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { usePastEditConfirmation } from '@/hooks/usePastEditConfirmation';
import { formatCurrency } from '@/lib/format';
import {
    type Account,
    type CatalogItem,
    type CategoryPurchaseSummary,
    type ExpenseCategory,
    type PageProps,
    type PlannedItem,
    type PlannedSummary,
    type Purchase,
    type PurchaseSummary,
} from '@/types';

interface PurchasesPageProps extends PageProps {
    categories: { data: ExpenseCategory[] };
    catalogItems: { data: CatalogItem[] };
    purchases: { data: Purchase[] };
    plannedItems: { data: PlannedItem[] };
    summary: PurchaseSummary;
    categorySummaries: Record<number, CategoryPurchaseSummary>;
    plannedSummary: PlannedSummary;
    accounts: { data: Account[] };
    currentPeriod: string;
    activeCategoryId: number | null;
    ivaRate: number;
    categoryBudgets: Record<number, number>;
}

export default function PurchasesIndex() {
    const {
        categories,
        catalogItems,
        purchases,
        plannedItems,
        summary,
        categorySummaries,
        plannedSummary,
        accounts,
        currentPeriod,
        activeCategoryId,
        ivaRate,
        categoryBudgets,
        flash,
    } = usePage<PurchasesPageProps>().props;

    const [showLogPurchaseDialog, setShowLogPurchaseDialog] = useState(false);
    const [showCatalogDialog, setShowCatalogDialog] = useState(false);

    const categoryList = categories.data;
    const catalogItemList = catalogItems.data;
    const purchaseList = purchases.data;
    const plannedItemList = plannedItems.data;
    const accountList = accounts.data;

    const {
        isPastMonth,
        confirmDialogOpen,
        requestConfirmation,
        handleConfirm,
        handleCancel,
    } = usePastEditConfirmation({ currentPeriod });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    function handlePeriodChange(period: string) {
        router.get(
            route('purchases.index', {
                period,
                category: activeCategoryId,
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    function handleCategoryChange(categoryId: string) {
        router.get(
            route('purchases.index', {
                period: currentPeriod,
                category: categoryId,
            }),
            {},
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AppLayout>
            <Head title="Purchases" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Purchases</h2>
                        <p className="text-muted-foreground">
                            Track item purchases across your categories.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowCatalogDialog(true)}
                        >
                            <Package data-icon="inline-start" />
                            Catalog
                        </Button>
                        <Button onClick={() => setShowLogPurchaseDialog(true)}>
                            <Plus data-icon="inline-start" />
                            Log Purchase
                        </Button>
                    </div>
                </div>

                <MonthNavigator
                    currentPeriod={currentPeriod}
                    onPeriodChange={handlePeriodChange}
                />

                {isPastMonth && <PastMonthBanner period={currentPeriod} />}

                {categoryList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12">
                        <ShoppingCart className="mb-4 size-12 text-muted-foreground" />
                        <p className="text-muted-foreground">
                            No item-based categories found. Create categories with type &quot;Item Based&quot; in the Expenses page.
                        </p>
                    </div>
                ) : (
                    <Tabs
                        value={activeCategoryId ? String(activeCategoryId) : undefined}
                        onValueChange={handleCategoryChange}
                    >
                        <TabsList className="w-full justify-start">
                            {categoryList.map((category) => {
                                const categorySummary = categorySummaries[category.id];
                                return (
                                    <TabsTrigger key={category.id} value={String(category.id)}>
                                        {category.name}
                                        {categorySummary && categorySummary.purchase_count > 0 && (
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                ({formatCurrency(categorySummary.total_spent)})
                                            </span>
                                        )}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {categoryList.map((category) => (
                            <TabsContent key={category.id} value={String(category.id)}>
                                <div className="flex flex-col gap-6">
                                    <PurchaseSummaryCards summary={summary} />

                                    <CategoryBudgetEditor
                                        categoryId={category.id}
                                        categoryName={category.name}
                                        currentBudget={categoryBudgets[category.id] ?? 0}
                                        spent={categorySummaries[category.id]?.total_spent ?? 0}
                                        period={currentPeriod}
                                    />

                                    <PlannedItemsList
                                        plannedItems={plannedItemList}
                                        plannedSummary={plannedSummary}
                                        catalogItems={catalogItemList}
                                        accounts={accountList}
                                        categories={categoryList}
                                        activeCategoryId={activeCategoryId}
                                        currentPeriod={currentPeriod}
                                        ivaRate={ivaRate}
                                    />

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Purchases</h3>
                                            <span className="text-sm text-muted-foreground">
                                                {purchaseList.length} {purchaseList.length === 1 ? 'purchase' : 'purchases'}
                                            </span>
                                        </div>

                                        {purchaseList.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8">
                                                <ShoppingCart className="mb-2 size-8 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">
                                                    No purchases this month.
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mt-2"
                                                    onClick={() => setShowLogPurchaseDialog(true)}
                                                >
                                                    Log your first purchase
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {purchaseList.map((purchase) => (
                                                    <PurchaseItem
                                                        key={purchase.id}
                                                        purchase={purchase}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
            </div>

            <LogPurchaseDialog
                open={showLogPurchaseDialog}
                onOpenChange={setShowLogPurchaseDialog}
                catalogItems={catalogItemList}
                accounts={accountList}
                categories={categoryList}
                activeCategoryId={activeCategoryId}
                currentPeriod={currentPeriod}
                ivaRate={ivaRate}
            />

            <ManageCatalogDialog
                open={showCatalogDialog}
                onOpenChange={setShowCatalogDialog}
                catalogItems={catalogItemList}
                categories={categoryList}
                activeCategoryId={activeCategoryId}
                ivaRate={ivaRate}
            />

            <ConfirmPastEditDialog
                open={confirmDialogOpen}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                period={currentPeriod}
            />
        </AppLayout>
    );
}
