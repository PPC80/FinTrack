import { useState, useCallback, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    Bus,
    DollarSign,
    Flame,
    LayoutDashboard,
    Lightbulb,
    Receipt,
    ShoppingCart,
    Utensils,
    Wallet,
} from 'lucide-react';

import { cn } from '@/lib/utils';

type Category = 'finance' | 'nutrition' | null;

interface SubNavItem {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

const financeItems: SubNavItem[] = [
    { href: '/finance/income', icon: DollarSign, label: 'Income' },
    { href: '/finance/accounts', icon: Wallet, label: 'Accounts' },
    { href: '/finance/transfers', icon: ArrowLeftRight, label: 'Transfers' },
    { href: '/finance/expenses', icon: Receipt, label: 'Expenses' },
    { href: '/finance/purchases', icon: ShoppingCart, label: 'Purchases' },
    { href: '/finance/misc-expenses', icon: Flame, label: 'Misc' },
    { href: '/finance/transportation', icon: Bus, label: 'Transport' },
    { href: '/finance/planning', icon: Lightbulb, label: 'Planning' },
];

const nutritionItems: SubNavItem[] = [
    { href: '/nutrition', icon: Utensils, label: 'Meals' },
];

export function BottomNav() {
    const { url } = usePage();
    const [expandedCategory, setExpandedCategory] = useState<Category>(null);

    const isFinanceActive = url.startsWith('/finance');
    const isNutritionActive = url.startsWith('/nutrition');

    const handleCategoryTap = useCallback((category: Category) => {
        setExpandedCategory((current) => (current === category ? null : category));
    }, []);

    const dismissTray = useCallback(() => {
        setExpandedCategory(null);
    }, []);

    useEffect(() => {
        setExpandedCategory(null);
    }, [url]);

    const activeItems = expandedCategory === 'finance'
        ? financeItems
        : expandedCategory === 'nutrition'
            ? nutritionItems
            : [];

    return (
        <>
            {expandedCategory && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
                    onClick={dismissTray}
                    aria-hidden="true"
                />
            )}

            <div
                className={cn(
                    'fixed inset-x-0 bottom-14 z-50 overflow-hidden transition-all duration-300 ease-out md:hidden',
                    expandedCategory
                        ? 'max-h-60 opacity-100'
                        : 'max-h-0 opacity-0',
                )}
            >
                <div className="border-t border-border bg-background/98 px-4 pb-2 pt-3 backdrop-blur-lg">
                    <div className="grid grid-cols-4 gap-2">
                        {activeItems.map((item) => {
                            const isActive = url.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex flex-col items-center gap-1.5 rounded-xl p-2.5 transition-colors',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground active:bg-muted',
                                    )}
                                >
                                    <item.icon className="size-5" />
                                    <span className="text-[11px] font-medium leading-tight">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center border-t border-border bg-background md:hidden">
                <Link
                    href="/dashboard"
                    className={cn(
                        'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                        url === '/dashboard'
                            ? 'text-primary'
                            : 'text-muted-foreground',
                    )}
                >
                    <LayoutDashboard className="size-5" />
                    <span>Home</span>
                </Link>

                <button
                    type="button"
                    onClick={() => handleCategoryTap('finance')}
                    className={cn(
                        'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                        isFinanceActive || expandedCategory === 'finance'
                            ? 'text-primary'
                            : 'text-muted-foreground',
                    )}
                    aria-label="Finance menu"
                    aria-expanded={expandedCategory === 'finance'}
                >
                    <Wallet className="size-5" />
                    <span>Finance</span>
                </button>

                <button
                    type="button"
                    onClick={() => handleCategoryTap('nutrition')}
                    className={cn(
                        'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                        isNutritionActive || expandedCategory === 'nutrition'
                            ? 'text-primary'
                            : 'text-muted-foreground',
                    )}
                    aria-label="Nutrition menu"
                    aria-expanded={expandedCategory === 'nutrition'}
                >
                    <Utensils className="size-5" />
                    <span>Nutrition</span>
                </button>
            </nav>
        </>
    );
}
