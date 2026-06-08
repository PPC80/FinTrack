export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
}

export type AccountType = 'bank' | 'cash' | 'metro_card';
export type TransactionType = 'top_up' | 'expense' | 'income' | 'adjustment';

export interface Account {
    id: number;
    name: string;
    type: AccountType;
    balance: number;
    is_default: boolean;
    is_deletable: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface AccountTransaction {
    id: number;
    account_id: number;
    amount: number;
    description: string | null;
    type: TransactionType;
    period: string;
    created_at: string;
}

export interface BalanceSummary {
    totalBalance: number;
    metroBalance: number;
}

export interface FlashMessages {
    success: string | null;
    error: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    balanceSummary: BalanceSummary;
    flash: FlashMessages;
};
