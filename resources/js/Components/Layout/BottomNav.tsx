import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Receipt, Settings, Utensils, Wallet } from 'lucide-react';

import { cn } from '@/lib/utils';

interface BottomNavItemProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
}

function BottomNavItem({ href, icon: Icon, label, isActive }: BottomNavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            <Icon className="size-5" />
            <span>{label}</span>
        </Link>
    );
}

export function BottomNav() {
    const { url } = usePage();

    return (
        <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center border-t border-border bg-background md:hidden">
            <BottomNavItem
                href="/dashboard"
                icon={LayoutDashboard}
                label="Home"
                isActive={url === '/dashboard'}
            />
            <BottomNavItem
                href="/finance/accounts"
                icon={Wallet}
                label="Finance"
                isActive={url.startsWith('/finance')}
            />
            <BottomNavItem
                href="/expenses"
                icon={Receipt}
                label="Expenses"
                isActive={url.startsWith('/expenses')}
            />
            <BottomNavItem
                href="/nutrition"
                icon={Utensils}
                label="Nutrition"
                isActive={url.startsWith('/nutrition')}
            />
            <BottomNavItem
                href="/profile"
                icon={Settings}
                label="Settings"
                isActive={url.startsWith('/profile')}
            />
        </nav>
    );
}
