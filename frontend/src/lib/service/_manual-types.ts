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

// Vendor (Store) types
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

// Purchase types
export interface Purchase {
    id?: number;
    item_id: number;
    brand_id?: number | null;
    store_id: number;
    date: string;
    price: number;
    quantity: number;
    details?: string[] | null;
    user_id?: string;
}

// Query parameter types
export interface PeriodQuery {
    start_date: string;
    end_date: string;
}

export interface IntervalQuery extends PeriodQuery {
    days_interval: number;
}

// AI suggestion types
export interface AISuggestionQuery {
    image: number[];
    mime: string;
}
