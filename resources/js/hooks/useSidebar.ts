import { useCallback, useState } from 'react';

const STORAGE_KEY = 'fintrack-sidebar-collapsed';

function getStoredState(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function useSidebar() {
    const [isCollapsed, setCollapsedState] = useState<boolean>(getStoredState);

    const setCollapsed = useCallback((collapsed: boolean) => {
        localStorage.setItem(STORAGE_KEY, String(collapsed));
        setCollapsedState(collapsed);
    }, []);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(!isCollapsed);
    }, [isCollapsed, setCollapsed]);

    return { isCollapsed, setCollapsed, toggleCollapsed };
}
