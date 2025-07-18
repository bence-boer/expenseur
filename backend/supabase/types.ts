export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      brands: {
        Row: {
          id: number
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          color?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          category_id: number
          id: number
          name: string
          unit_id: number
          user_id: string
        }
        Insert: {
          category_id: number
          id?: number
          name: string
          unit_id: number
          user_id?: string
        }
        Update: {
          category_id?: number
          id?: number
          name?: string
          unit_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_duplicate_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "items_duplicate_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "items_duplicate_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_tags: {
        Row: {
          assigned_at: string
          purchase_id: number
          tag_id: number
          user_id: string
        }
        Insert: {
          assigned_at?: string
          purchase_id: number
          tag_id: number
          user_id?: string
        }
        Update: {
          assigned_at?: string
          purchase_id?: number
          tag_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_tags_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_tags_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          brand_id: number | null
          date: string
          details: string[] | null
          id: number
          item_id: number
          price: number
          quantity: number
          store_id: number
          user_id: string
        }
        Insert: {
          brand_id?: number | null
          date: string
          details?: string[] | null
          id?: number
          item_id: number
          price: number
          quantity: number
          store_id: number
          user_id?: string
        }
        Update: {
          brand_id?: number | null
          date?: string
          details?: string[] | null
          id?: number
          item_id?: number
          price?: number
          quantity?: number
          store_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_duplicate_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "purchases_duplicate_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_duplicate_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "purchases_duplicate_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      stores: {
        Row: {
          id: number
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: number
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          id: number
          name: string
          user_id: string
        }
        Insert: {
          id?: number
          name: string
          user_id?: string
        }
        Update: {
          id?: number
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      all_tables_view: {
        Row: {
          brand: string | null
          brand_id: number | null
          category: string | null
          category_color: string | null
          category_id: number | null
          date: string | null
          details: string[] | null
          id: number | null
          item: string | null
          item_id: number | null
          price: number | null
          quantity: number | null
          tags: Json | null
          unit: string | null
          user_id: string | null
          vendor: string | null
          vendor_id: number | null
        }
        Relationships: []
      }
      details_by_item: {
        Row: {
          details: string[] | null
          frequency: number | null
          item_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_purchases: {
        Row: {
          brand_id: number | null
          date: string | null
          details: string[] | null
          frequency: number | null
          item_id: number | null
          price: number | null
          store_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_duplicate_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["brand_id"]
          },
          {
            foreignKeyName: "purchases_duplicate_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_duplicate_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "purchases_duplicate_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      quantity_by_item: {
        Row: {
          frequency: number | null
          item_id: number | null
          quantity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "all_tables_view"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "purchases_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          email_confirmed_at: string | null
          id: string | null
          last_sign_in_at: string | null
          phone: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          roles: Database["public"]["Enums"]["app_role"][] | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          roles: Database["public"]["Enums"]["app_role"][]
          email: string
          email_confirmed_at: string
          last_sign_in_at: string
          raw_app_meta_data: Json
          raw_user_meta_data: Json
          created_at: string
          updated_at: string
          phone: string
        }[]
      }
      item_details: {
        Args: { item_id: number }
        Returns: {
          id: number
          name: string
          unit: string
          category: string
        }[]
      }
      spendings_by_category: {
        Args: { start_date: string; end_date: string }
        Returns: {
          id: number
          category: string
          total: number
          color: string
        }[]
      }
      spendings_by_category_interval: {
        Args: { start_date: string; end_date: string; days_interval: number }
        Returns: Json
      }
    }
    Enums: {
      app_permission:
        | "role.update"
        | "users.select"
        | "role.select"
        | "role.insert"
        | "role.delete"
      app_role: "admin" | "beta"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_permission: [
        "role.update",
        "users.select",
        "role.select",
        "role.insert",
        "role.delete",
      ],
      app_role: ["admin", "beta"],
    },
  },
} as const
