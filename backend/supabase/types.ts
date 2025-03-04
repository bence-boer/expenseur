export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Database = {
    public: {
        Tables: {
            brands: {
                Row: {
                    id: number;
                    name: string;
                    user_id: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    user_id?: string;
                };
                Update: {
                    id?: number;
                    name?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            categories: {
                Row: {
                    color: string;
                    id: number;
                    name: string;
                    user_id: string;
                };
                Insert: {
                    color?: string;
                    id?: number;
                    name: string;
                    user_id?: string;
                };
                Update: {
                    color?: string;
                    id?: number;
                    name?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            items: {
                Row: {
                    category_id: number;
                    id: number;
                    name: string;
                    unit_id: number;
                    user_id: string;
                };
                Insert: {
                    category_id: number;
                    id?: number;
                    name: string;
                    unit_id: number;
                    user_id?: string;
                };
                Update: {
                    category_id?: number;
                    id?: number;
                    name?: string;
                    unit_id?: number;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'items_duplicate_category_id_fkey';
                        columns: ['category_id'];
                        isOneToOne: false;
                        referencedRelation: 'categories';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'items_duplicate_unit_id_fkey';
                        columns: ['unit_id'];
                        isOneToOne: false;
                        referencedRelation: 'units';
                        referencedColumns: ['id'];
                    },
                ];
            };
            purchases: {
                Row: {
                    brand_id: number | null;
                    date: string;
                    details: string[] | null;
                    id: number;
                    item_id: number;
                    price: number;
                    quantity: number;
                    store_id: number;
                    user_id: string;
                };
                Insert: {
                    brand_id?: number | null;
                    date: string;
                    details?: string[] | null;
                    id?: number;
                    item_id: number;
                    price: number;
                    quantity: number;
                    store_id: number;
                    user_id?: string;
                };
                Update: {
                    brand_id?: number | null;
                    date?: string;
                    details?: string[] | null;
                    id?: number;
                    item_id?: number;
                    price?: number;
                    quantity?: number;
                    store_id?: number;
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'purchases_duplicate_brand_id_fkey';
                        columns: ['brand_id'];
                        isOneToOne: false;
                        referencedRelation: 'brands';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'purchases_duplicate_store_id_fkey';
                        columns: ['store_id'];
                        isOneToOne: false;
                        referencedRelation: 'stores';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'purchases_item_id_fkey';
                        columns: ['item_id'];
                        isOneToOne: false;
                        referencedRelation: 'items';
                        referencedColumns: ['id'];
                    },
                ];
            };
            stores: {
                Row: {
                    id: number;
                    name: string;
                    user_id: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    user_id?: string;
                };
                Update: {
                    id?: number;
                    name?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
            units: {
                Row: {
                    id: number;
                    name: string;
                    user_id: string;
                };
                Insert: {
                    id?: number;
                    name: string;
                    user_id?: string;
                };
                Update: {
                    id?: number;
                    name?: string;
                    user_id?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            all_tables_view: {
                Row: {
                    brand: string | null;
                    category: string | null;
                    date: string | null;
                    details: string[] | null;
                    id: number | null;
                    item: string | null;
                    price: number | null;
                    quantity: number | null;
                    store: string | null;
                    unit: string | null;
                    user_id: string | null;
                };
                Relationships: [];
            };
            details_by_item: {
                Row: {
                    details: string[] | null;
                    frequency: number | null;
                    item_id: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'purchases_item_id_fkey';
                        columns: ['item_id'];
                        isOneToOne: false;
                        referencedRelation: 'items';
                        referencedColumns: ['id'];
                    },
                ];
            };
            quantity_by_item: {
                Row: {
                    frequency: number | null;
                    item_id: number | null;
                    quantity: number | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'purchases_item_id_fkey';
                        columns: ['item_id'];
                        isOneToOne: false;
                        referencedRelation: 'items';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Functions: {
            item_details: {
                Args: {
                    item_id: number;
                };
                Returns: {
                    id: number;
                    name: string;
                    unit: string;
                    category: string;
                }[];
            };
            spendings_by_category: {
                Args: {
                    start_date: string;
                    end_date: string;
                };
                Returns: {
                    category: string;
                    total: number;
                    color: string;
                }[];
            };
            spendings_by_category_interval: {
                Args: {
                    start_date: string;
                    end_date: string;
                    days_interval: number;
                };
                Returns: Json;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof (
            & Database[PublicTableNameOrOptions['schema']]['Tables']
            & Database[PublicTableNameOrOptions['schema']]['Views']
        )
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? (
        & Database[PublicTableNameOrOptions['schema']]['Tables']
        & Database[PublicTableNameOrOptions['schema']]['Views']
    )[TableName] extends {
        Row: infer R;
    } ? R
    : never
    : PublicTableNameOrOptions extends keyof (
        & PublicSchema['Tables']
        & PublicSchema['Views']
    ) ? (
            & PublicSchema['Tables']
            & PublicSchema['Views']
        )[PublicTableNameOrOptions] extends {
            Row: infer R;
        } ? R
        : never
    : never;

export type TablesInsert<
    PublicTableNameOrOptions extends
        | keyof PublicSchema['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Insert: infer I;
    } ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables'] ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Insert: infer I;
        } ? I
        : never
    : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends
        | keyof PublicSchema['Tables']
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
        Update: infer U;
    } ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables'] ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Update: infer U;
        } ? U
        : never
    : never;

export type Enums<
    PublicEnumNameOrOptions extends
        | keyof PublicSchema['Enums']
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database } ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
        | keyof PublicSchema['CompositeTypes']
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database;
    } ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database } ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes'] ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
