// Item types
export interface Item {
    id?: number;
    name: string;
    category_id: number;
    unit_id: number;
    user_id?: string;
}

// Brand types
export interface Brand {
    id?: number;
    name: string;
    user_id?: string;
}

// Category types
export interface Category {
    id?: number;
    name: string;
    color?: string;
    user_id?: string;
}

// Vendor types
export interface Vendor {
    id?: number;
    name: string;
    user_id?: string;
}

// Unit types
export interface Unit {
    id?: number;
    name: string;
    user_id?: string;
}

// Expense types
export interface Expense {
    id?: number;
    item_id: number;
    brand_id?: number | null;
    store_id: number;
    date: string;
    price: number;
    quantity: number;
    details?: string[] | null;
    user_id?: string;
    tag_ids?: number[] | null;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
    user_id?: string;
}

export interface ExpenseFull {
    brand: string | null;
    brand_id: number | null;
    category: string | null;
    category_color: string | null;
    category_id: number | null;
    date: string | null;
    details: string[] | null;
    id: number | null;
    item: string | null;
    item_id: number | null;
    price: number | null;
    quantity: number | null;
    tags: Tag[] | null;
    unit: string | null;
    user_id: string | null;
    vendor: string | null;
    vendor_id: number | null;
}

export interface UpdatedExpense {
    id: number;
    date: string;
    item_id: number;
    details: string[];
    brand_id?: number;
    store_id: number;
    quantity: number;
    price: number;
    user_id: string;
    tag_ids: number[];
}
// Query parameter types
export interface PeriodQuery {
    start_date: string;
    end_date: string;
}

export interface IntervalQuery extends PeriodQuery {
    days_interval: number;
}

// AI Suggestion Types (Function Calling Schema)
export interface AIPredictedExpense {
    brand_id?: number | null;
    details?: string[] | null;
    item_id?: number | null;
    price?: number | null;
    quantity?: number | null;
    tags?: number[] | null;
}

export interface AINewBrand {
    id: number; // negative ID for new brands
    name: string;
}

export interface AINewCategory {
    id: number; // negative ID for new categories
    name: string;
}

export interface AINewItem {
    id: number; // negative ID for new items
    name: string;
    category_id: number; // can be negative if new
    unit_id: number; // can be negative if new
}

export interface AINewUnit {
    id: number; // negative ID for new units
    name: string;
}

export interface AINewStore {
    id: number; // negative ID for new stores
    name: string;
}

export interface AIExpensePrediction {
    date?: string | null;
    store_id?: number | null;
    expenses?: AIPredictedExpense[] | null;
    new_brands?: AINewBrand[];
    new_categories?: AINewCategory[];
    new_items?: AINewItem[];
    new_units?: AINewUnit[];
    new_stores?: AINewStore[];
}
