import { Link } from '@inertiajs/react';
import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/Components/ui/tooltip';

interface SidebarItemProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    isCollapsed?: boolean;
}

export function SidebarItem({
    href,
    icon: Icon,
    label,
    isActive = false,
    isCollapsed = false,
}: SidebarItemProps) {
    const linkContent = (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70',
                isCollapsed && 'justify-center px-2',
            )}
        >
            <Icon className="size-5 shrink-0" />
            {!isCollapsed && <span>{label}</span>}
        </Link>
    );

    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return linkContent;
}
