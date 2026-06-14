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

export type ExpenseCategoryType = 'fixed' | 'item_based' | 'trip_based' | 'misc';

export interface ExpenseCategory {
    id: number;
    name: string;
    type: ExpenseCategoryType;
    default_account_id: number | null;
    default_account: Account | null;
    sort_order: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface BasicExpenseTemplate {
    id: number;
    category_id: number;
    category?: ExpenseCategory;
    name: string;
    default_amount: number;
    sort_order: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface BasicExpense {
    id: number;
    category_id: number;
    category: ExpenseCategory;
    template_id: number | null;
    name: string;
    amount: number;
    is_paid: boolean;
    paid_at: string | null;
    account_id: number | null;
    account: Account | null;
    period: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface CatalogItem {
    id: number;
    category_id: number;
    category?: ExpenseCategory;
    name: string;
    price: number;
    has_iva: boolean;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface Purchase {
    id: number;
    catalog_item_id: number;
    catalog_item: CatalogItem;
    category_id: number;
    category: ExpenseCategory;
    quantity: number;
    unit_price: number;
    iva_amount: number;
    total: number;
    account_id: number;
    account: Account;
    period: string;
    is_planned: boolean;
    purchased_at: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface PlannedItem {
    id: number;
    catalog_item_id: number;
    catalog_item: CatalogItem;
    period: string;
    quantity: number;
    is_purchased: boolean;
    purchase_id: number | null;
    purchase?: Purchase;
    created_at: string | null;
    updated_at: string | null;
}

export interface PurchaseSummary {
    total_spent: number;
    total_iva: number;
    purchase_count: number;
    planned_count: number;
    unplanned_count: number;
}

export interface CategoryPurchaseSummary {
    total_spent: number;
    total_iva: number;
    purchase_count: number;
}

export interface PlannedSummary {
    total_items: number;
    purchased_count: number;
    pending_count: number;
}

export interface ExpenseSummary {
    total: number;
    paid: number;
    remaining: number;
    count: number;
    paid_count: number;
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
