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
    service_payment_fee: number | null;
    cross_bank_transfer_fee: number | null;
    withdrawal_atm_fee: number | null;
    withdrawal_store_fee: number | null;
    international_iva_rate: number | null;
    isd_rate: number | null;
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
    monthly_budget: number | null;
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
    due_day_of_month: number | null;
    sort_order: number;
    created_at: string | null;
    updated_at: string | null;
}

export type BasicExpensePaymentMethod = 'direct' | 'service_payment' | 'bank_transfer' | 'international';

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
    payment_method: BasicExpensePaymentMethod | null;
    commission_amount: number;
    due_day_of_month: number | null;
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
    is_bank_transfer: boolean;
    is_international: boolean;
    commission_amount: number;
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
    theBigNumber: number;
}

export interface FlashMessages {
    success: string | null;
    error: string | null;
    warning: string | null;
}

export interface MiscExpense {
    id: number;
    description: string;
    amount: number;
    is_guilty: boolean;
    is_taxi: boolean;
    is_bank_transfer: boolean;
    is_international: boolean;
    commission_amount: number;
    account_id: number;
    account: Account;
    period: string;
    spent_at: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface ShameSummary {
    total_spent: number;
    expense_count: number;
    guilty_total: number;
    guilty_count: number;
    taxi_total: number;
    taxi_count: number;
}

export type TransferType = 'cross_bank_transfer' | 'same_bank_atm' | 'other_bank_atm' | 'store_withdrawal';

export interface AccountTransfer {
    id: number;
    source_account_id: number;
    source_account: Account;
    destination_account_id: number;
    destination_account: Account;
    amount: number;
    commission_amount: number;
    transfer_type: TransferType;
    description: string | null;
    period: string;
    transferred_at: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface CategoryPeriodBudget {
    id: number;
    category_id: number;
    period: string;
    amount: number;
}

export interface TransportMode {
    id: number;
    name: string;
    fare: number;
    deducts_from_metro: boolean;
    default_account_id: number | null;
    default_account: Account | null;
    sort_order: number;
    is_active: boolean;
    is_taxi: boolean;
    trip_count: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface Trip {
    id: number;
    transport_mode_id: number;
    transport_mode: TransportMode;
    fare_at_time: number;
    account_id: number;
    account: Account;
    period: string;
    taken_at: string;
    created_at: string | null;
}

export interface MetroTopup {
    id: number;
    amount: number;
    source_account_id: number;
    source_account: Account;
    period: string;
    created_at: string | null;
}

export interface TransportationSummary {
    total_trips: number;
    total_cost: number;
    total_topups: number;
    mode_breakdown: Record<number, { count: number; cost: number }>;
}

export interface IncomeEntry {
    id: number;
    source: string;
    amount: number;
    account_id: number;
    account: Account | null;
    period: string;
    received_at: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface ObligationsBreakdown {
    unpaid_basic_expenses: number;
    remaining_category_budgets: number;
    unpaid_planned_items: number;
}

export interface SpendingBreakdown {
    basic_expenses: number;
    purchases: number;
    misc_expenses: number;
    transportation: number;
}

export interface CategoryBudgetStatus {
    id: number;
    name: string;
    budget: number;
    spent: number;
    remaining: number;
    percentage_used: number;
}

export interface MonthlySummaryData {
    period: string;
    total_income: number;
    total_spent: number;
    leftover: number;
    carry_over_from_previous: number;
}

export interface BudgetSummary {
    total_income: number;
    carry_over: number;
    effective_income: number;
    total_obligations: number;
    total_spent: number;
    account_balances: number;
    the_big_number: number;
    monthly_leftover: number;
    obligations_breakdown: ObligationsBreakdown;
    spending_breakdown: SpendingBreakdown;
    category_budgets: CategoryBudgetStatus[];
}

export interface PredictedIncome {
    id: number;
    description: string;
    amount: number;
    expected_date: string | null;
    is_received: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface WishlistItem {
    id: number;
    name: string;
    price: number;
    url: string | null;
    priority: number | null;
    is_purchased: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface PlanningSummary {
    predicted_income_pending: number;
    predicted_income_received: number;
    wishlist_pending: number;
    wishlist_purchased: number;
}

export interface DashboardAccount {
    id: number;
    name: string;
    type: AccountType;
    balance: number;
}

export interface BasicExpensesProgress {
    total_count: number;
    paid_count: number;
    total_amount: number;
    paid_amount: number;
    percentage: number;
}

export interface DashboardShameSummary {
    guilty_total: number;
    guilty_count: number;
    taxi_total: number;
}

export type RecentActivityType = 'income' | 'basic_expense' | 'purchase' | 'misc_expense' | 'trip';

export interface RecentActivityItem {
    id: string;
    type: RecentActivityType;
    description: string;
    amount: number;
    date: string;
    account_name: string | null;
}

export interface MonthComparison {
    current_spent: number;
    previous_spent: number;
    difference: number;
    direction: 'more' | 'less';
    previous_period: string;
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
