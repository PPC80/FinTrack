import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 md:px-6 md:justify-end">
            <div className="flex items-center gap-2 md:hidden">
                <img
                    src="/images/FinTrack_logo.png"
                    alt="FinTrack"
                    className="h-6 w-auto"
                />
            </div>

            <div className="flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
            </div>
        </header>
    );
}
