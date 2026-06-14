import { Head, usePage } from '@inertiajs/react';
import { DollarSign, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { AddPredictedIncomeForm } from '@/Components/Finance/Planning/AddPredictedIncomeForm';
import { AddWishlistItemForm } from '@/Components/Finance/Planning/AddWishlistItemForm';
import { PredictedIncomeItem } from '@/Components/Finance/Planning/PredictedIncomeItem';
import { WishlistItemRow } from '@/Components/Finance/Planning/WishlistItemRow';
import { AppLayout } from '@/Components/Layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { formatCurrency } from '@/lib/format';
import {
    type PageProps,
    type PlanningSummary,
    type PredictedIncome,
    type WishlistItem,
} from '@/types';

interface PlanningPageProps extends PageProps {
    predictedIncomes: { data: PredictedIncome[] };
    wishlistItems: { data: WishlistItem[] };
    summary: PlanningSummary;
}

export default function PlanningIndex() {
    const { predictedIncomes, wishlistItems, summary, flash } =
        usePage<PlanningPageProps>().props;

    const incomeList = predictedIncomes.data;
    const wishlistList = wishlistItems.data;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
    }, [flash]);

    return (
        <AppLayout>
            <Head title="Planning" />

            <div className="flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Planning</h2>
                    <p className="text-muted-foreground">
                        Track expected income and wishlist items. This data is purely
                        informational and does not affect your budget.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <DollarSign className="size-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Expected Income
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(summary.predicted_income_pending)}
                                </p>
                                {summary.predicted_income_received > 0 && (
                                    <p className="text-xs text-success">
                                        {formatCurrency(summary.predicted_income_received)} received
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
                                <ShoppingBag className="size-5 text-warning" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Wishlist Total
                                </p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(summary.wishlist_pending)}
                                </p>
                                {summary.wishlist_purchased > 0 && (
                                    <p className="text-xs text-success">
                                        {formatCurrency(summary.wishlist_purchased)} purchased
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="predicted-income">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="predicted-income" className="flex-1 sm:flex-none">
                            Predicted Income
                            {incomeList.length > 0 && (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                    ({incomeList.length})
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="wishlist" className="flex-1 sm:flex-none">
                            Wishlist
                            {wishlistList.length > 0 && (
                                <span className="ml-1.5 text-xs text-muted-foreground">
                                    ({wishlistList.length})
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="predicted-income" className="flex flex-col gap-4 mt-4">
                        <AddPredictedIncomeForm />

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Entries</h3>
                                <span className="text-sm text-muted-foreground">
                                    Pending: {formatCurrency(summary.predicted_income_pending)}
                                </span>
                            </div>

                            {incomeList.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                    <p className="text-muted-foreground">
                                        No predicted income entries yet. Add one above.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {incomeList.map((income) => (
                                        <PredictedIncomeItem
                                            key={income.id}
                                            predictedIncome={income}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="wishlist" className="flex flex-col gap-4 mt-4">
                        <AddWishlistItemForm />

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Items</h3>
                                <span className="text-sm text-muted-foreground">
                                    Pending: {formatCurrency(summary.wishlist_pending)}
                                </span>
                            </div>

                            {wishlistList.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                                    <p className="text-muted-foreground">
                                        No wishlist items yet. Add one above.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {wishlistList.map((item) => (
                                        <WishlistItemRow
                                            key={item.id}
                                            wishlistItem={item}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
