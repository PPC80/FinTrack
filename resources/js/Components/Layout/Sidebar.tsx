import { usePage } from '@inertiajs/react';
import {
    ChevronsLeft,
    ChevronsRight,
    LayoutDashboard,
    Receipt,
    Utensils,
    Wallet,
} from 'lucide-react';

import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { cn } from '@/lib/utils';

import { SidebarItem } from './SidebarItem';

interface SidebarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
    const { url } = usePage();

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
                    href="/finance"
                    icon={Wallet}
                    label="Accounts"
                    isActive={url.startsWith('/finance')}
                    isCollapsed={isCollapsed}
                />
                <SidebarItem
                    href="/expenses"
                    icon={Receipt}
                    label="Expenses"
                    isActive={url.startsWith('/expenses')}
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
