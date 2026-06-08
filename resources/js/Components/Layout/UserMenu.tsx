import { router, usePage } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';

import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Button } from '@/Components/ui/button';
import { type PageProps } from '@/types';

export function UserMenu() {
    const { auth } = usePage<PageProps>().props;
    const initials = auth.user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    function handleLogout() {
        router.post('/logout');
    }

    function handleProfile() {
        router.visit('/profile');
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative size-9 rounded-full"
                    aria-label="User menu"
                >
                    <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium">{auth.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {auth.user.email}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfile}>
                    <User className="mr-2 size-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
