import { Moon, Sun } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? (
                        <Sun className="size-5" />
                    ) : (
                        <Moon className="size-5" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</p>
            </TooltipContent>
        </Tooltip>
    );
}
