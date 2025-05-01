export type ExpenseView = {
    id: number;
    item_id: number;
    item_name: string;
    item_unit: string;
    details: string;
    brand_id: number;
    brand_name: string;
    quantity: number;
    price: number;
    tag_ids: number[];
};
