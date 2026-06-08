import { type PropsWithChildren } from 'react';

import { TooltipProvider } from '@/Components/ui/tooltip';
import { useSidebar } from '@/hooks/useSidebar';

import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppLayout({ children }: PropsWithChildren) {
    const { isCollapsed, toggleCollapsed } = useSidebar();

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    isCollapsed={isCollapsed}
                    onToggleCollapse={toggleCollapsed}
                />

                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header />

                    <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
                        {children}
                    </main>
                </div>

                <BottomNav />
            </div>
        </TooltipProvider>
    );
}
