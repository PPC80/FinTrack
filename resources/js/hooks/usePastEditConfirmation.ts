import { useCallback, useRef, useState } from 'react';

interface UsePastEditConfirmationOptions {
    currentPeriod: string;
}

interface UsePastEditConfirmationReturn {
    isPastMonth: boolean;
    confirmDialogOpen: boolean;
    requestConfirmation: (action: () => void) => void;
    handleConfirm: () => void;
    handleCancel: () => void;
}

export function usePastEditConfirmation({
    currentPeriod,
}: UsePastEditConfirmationOptions): UsePastEditConfirmationReturn {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const pendingAction = useRef<(() => void) | null>(null);

    const isPastMonth = !isCurrentMonth(currentPeriod);

    const requestConfirmation = useCallback(
        (action: () => void) => {
            if (isPastMonth) {
                pendingAction.current = action;
                setConfirmDialogOpen(true);
            } else {
                action();
            }
        },
        [isPastMonth],
    );

    const handleConfirm = useCallback(() => {
        setConfirmDialogOpen(false);
        pendingAction.current?.();
        pendingAction.current = null;
    }, []);

    const handleCancel = useCallback(() => {
        setConfirmDialogOpen(false);
        pendingAction.current = null;
    }, []);

    return {
        isPastMonth,
        confirmDialogOpen,
        requestConfirmation,
        handleConfirm,
        handleCancel,
    };
}

function isCurrentMonth(period: string): boolean {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return period === current;
}
