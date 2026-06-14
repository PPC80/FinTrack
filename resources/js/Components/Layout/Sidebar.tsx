import { usePage } from '@inertiajs/react';
import {
    Bus,
    ChevronsLeft,
    ChevronsRight,
    DollarSign,
    Flame,
    LayoutDashboard,
    Lightbulb,
    Receipt,
    ShoppingCart,
    Utensils,
    Wallet,
} from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import { type PageProps } from '@/types';

import { SidebarItem } from './SidebarItem';

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
    const { url, props } = usePage<PageProps>();
    const { balanceSummary } = props;

    return (
        <aside
            className={cn(
                'hidden h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 md:flex',
                isCollapsed ? 'w-16' : 'w-64',
            )}
        >
            <div
                className={cn(
                    'flex h-14 items-center border-b border-sidebar-border px-4',
                    isCollapsed && 'justify-center px-2',
                )}
            >
                {!isCollapsed && (
                    <h1 className="text-lg font-bold text-primary">FinTrack</h1>
                )}
                {isCollapsed && (
                    <span className="text-lg font-bold text-primary">F</span>
                )}
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-2">
                <SidebarItem
                    href="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isActive={url === '/dashboard'}
                    isCollapsed={isCollapsed}
                />

                <Separator className="my-3" />

                <div className={cn(!isCollapsed && 'px-3 py-1')}>
                    {!isCollapsed && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Finance
                        </span>
                    )}
                </div>

                <SidebarItem
                    href="/finance/income"
                    icon={DollarSign}
                    label="Income"
                    isActive={url.startsWith('/finance/income')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/accounts"
                    icon={Wallet}
                    label="Accounts"
                    isActive={url.startsWith('/finance/accounts')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/expenses"
                    icon={Receipt}
                    label="Expenses"
                    isActive={url.startsWith('/finance/expenses')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/purchases"
                    icon={ShoppingCart}
                    label="Purchases"
                    isActive={url.startsWith('/finance/purchases')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/misc-expenses"
                    icon={Flame}
                    label="Misc Expenses"
                    isActive={url.startsWith('/finance/misc-expenses')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/transportation"
                    icon={Bus}
                    label="Transportation"
                    isActive={url.startsWith('/finance/transportation')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/finance/planning"
                    icon={Lightbulb}
                    label="Planning"
                    isActive={url.startsWith('/finance/planning')}
                    isCollapsed={isCollapsed}
                />

                <Separator className="my-3" />

                <div className={cn(!isCollapsed && 'px-3 py-1')}>
                    {!isCollapsed && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Nutrition
                        </span>
                    )}
                </div>

                <SidebarItem
                    href="/nutrition"
                    icon={Utensils}
                    label="Meals"
                    isActive={url.startsWith('/nutrition')}
                    isCollapsed={isCollapsed}
                />
            </nav>

            {balanceSummary && (
                <div className={cn(
                    'border-t border-sidebar-border p-3',
                    isCollapsed && 'px-2',
                )}>
                    {!isCollapsed ? (
                        <div className="rounded-lg bg-primary/5 p-2.5 text-center">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Available
                            </p>
                            <p className="text-sm font-bold text-primary">
                                {formatCurrency(balanceSummary.theBigNumber)}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg bg-primary/5 p-1.5 text-center" title="Available to spend">
                            <p className="text-[9px] font-bold text-primary">
                                ${Math.round(balanceSummary.theBigNumber)}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="border-t border-sidebar-border p-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleCollapse}
                    className="w-full"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ChevronsRight className="size-5" />
                    ) : (
                        <ChevronsLeft className="size-5" />
                    )}
                </Button>
            </div>
        </aside>
    );
}
