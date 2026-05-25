export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
          spot_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
          spot_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
          spot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "fishing_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accommodation_persons: number
          accommodation_price: number
          accommodation_type: string
          admin_notes: string | null
          all_inclusive: boolean
          all_inclusive_price: number
          base_price: number
          booking_mode: string
          cancelled_at: string | null
          cleaning_price: number
          companions: number
          created_at: string
          deposit_amount: number
          deposit_paid_at: string | null
          email: string
          end_date: string
          extra_24h_blocks: number
          extras: Json
          extras_price: number
          final_paid_at: string | null
          final_payment_due_date: string | null
          first_name: string
          id: string
          last_name: string
          license_price: number
          message: string | null
          nights: number
          paddle_transaction_id: string | null
          payment_deadline: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          persons: number
          phone: string
          spot_id: string
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accommodation_persons?: number
          accommodation_price?: number
          accommodation_type?: string
          admin_notes?: string | null
          all_inclusive?: boolean
          all_inclusive_price?: number
          base_price?: number
          booking_mode?: string
          cancelled_at?: string | null
          cleaning_price?: number
          companions?: number
          created_at?: string
          deposit_amount?: number
          deposit_paid_at?: string | null
          email: string
          end_date: string
          extra_24h_blocks?: number
          extras?: Json
          extras_price?: number
          final_paid_at?: string | null
          final_payment_due_date?: string | null
          first_name: string
          id?: string
          last_name: string
          license_price?: number
          message?: string | null
          nights?: number
          paddle_transaction_id?: string | null
          payment_deadline?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          persons?: number
          phone: string
          spot_id: string
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accommodation_persons?: number
          accommodation_price?: number
          accommodation_type?: string
          admin_notes?: string | null
          all_inclusive?: boolean
          all_inclusive_price?: number
          base_price?: number
          booking_mode?: string
          cancelled_at?: string | null
          cleaning_price?: number
          companions?: number
          created_at?: string
          deposit_amount?: number
          deposit_paid_at?: string | null
          email?: string
          end_date?: string
          extra_24h_blocks?: number
          extras?: Json
          extras_price?: number
          final_paid_at?: string | null
          final_payment_due_date?: string | null
          first_name?: string
          id?: string
          last_name?: string
          license_price?: number
          message?: string | null
          nights?: number
          paddle_transaction_id?: string | null
          payment_deadline?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          persons?: number
          phone?: string
          spot_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "fishing_spots"
            referencedColumns: ["id"]
          },
        ]
      }
      extras: {
        Row: {
          active: boolean
          allow_quantity: boolean
          code: string | null
          created_at: string
          description: string
          id: string
          name: string
          price: number
          sort_order: number
          unit: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          allow_quantity?: boolean
          code?: string | null
          created_at?: string
          description?: string
          id?: string
          name: string
          price?: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          allow_quantity?: boolean
          code?: string | null
          created_at?: string
          description?: string
          id?: string
          name?: string
          price?: number
          sort_order?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      fishing_spots: {
        Row: {
          accommodation_type: string
          active: boolean
          created_at: string
          description: string
          features: string[]
          id: string
          image_url: string | null
          max_persons: number
          name: string
          price_per_day: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          accommodation_type?: string
          active?: boolean
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string | null
          max_persons?: number
          name: string
          price_per_day?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          accommodation_type?: string
          active?: boolean
          created_at?: string
          description?: string
          features?: string[]
          id?: string
          image_url?: string | null
          max_persons?: number
          name?: string
          price_per_day?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          bank_holder: string
          bic: string
          cancellation_days_before: number
          contact_email: string
          contact_phone: string
          created_at: string
          deposit_deadline_hours: number
          deposit_percent: number
          full_payment_days_before: number
          iban: string
          id: string
          updated_at: string
        }
        Insert: {
          bank_holder?: string
          bic?: string
          cancellation_days_before?: number
          contact_email?: string
          contact_phone?: string
          created_at?: string
          deposit_deadline_hours?: number
          deposit_percent?: number
          full_payment_days_before?: number
          iban?: string
          id?: string
          updated_at?: string
        }
        Update: {
          bank_holder?: string
          bic?: string
          cancellation_days_before?: number
          contact_email?: string
          contact_phone?: string
          created_at?: string
          deposit_deadline_hours?: number
          deposit_percent?: number
          full_payment_days_before?: number
          iban?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      payment_settings_public: {
        Row: {
          cancellation_days_before: number | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          deposit_deadline_hours: number | null
          deposit_percent: number | null
          full_payment_days_before: number | null
          id: string | null
          updated_at: string | null
        }
        Insert: {
          cancellation_days_before?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deposit_deadline_hours?: number | null
          deposit_percent?: number | null
          full_payment_days_before?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Update: {
          cancellation_days_before?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          deposit_deadline_hours?: number | null
          deposit_percent?: number | null
          full_payment_days_before?: number | null
          id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      expire_unpaid_bookings: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      booking_status: "pending" | "approved" | "rejected" | "paid" | "cancelled"
      payment_status:
        | "unpaid"
        | "paid"
        | "refunded"
        | "failed"
        | "expired"
        | "deposit_pending"
        | "deposit_paid"
      spot_availability: "available" | "partial" | "unavailable"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      booking_status: ["pending", "approved", "rejected", "paid", "cancelled"],
      payment_status: [
        "unpaid",
        "paid",
        "refunded",
        "failed",
        "expired",
        "deposit_pending",
        "deposit_paid",
      ],
      spot_availability: ["available", "partial", "unavailable"],
    },
  },
} as const
