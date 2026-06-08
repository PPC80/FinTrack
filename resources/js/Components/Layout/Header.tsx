import { BalanceWidget } from '@/Components/Finance/BalanceWidget';

import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6">
            <div className="flex items-center gap-2 md:hidden">
                <h1 className="text-lg font-bold text-primary">FinTrack</h1>
            </div>

            <div className="hidden md:block">
                <BalanceWidget />
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
