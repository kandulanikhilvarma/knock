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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          address: string | null
          area_geohash: string | null
          assigned_provider_id: string | null
          category_id: string | null
          category_slug: string
          created_at: string
          cust_lat: number | null
          cust_lng: number | null
          customer_id: string
          description: string | null
          excluded_provider_ids: string[]
          id: string
          paid_at: string | null
          pay_method: string | null
          photos: string[]
          price_agreed: number | null
          status: Database["public"]["Enums"]["booking_status"]
          swap_used: boolean
          time_pref: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area_geohash?: string | null
          assigned_provider_id?: string | null
          category_id?: string | null
          category_slug: string
          created_at?: string
          cust_lat?: number | null
          cust_lng?: number | null
          customer_id: string
          description?: string | null
          excluded_provider_ids?: string[]
          id?: string
          paid_at?: string | null
          pay_method?: string | null
          photos?: string[]
          price_agreed?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          swap_used?: boolean
          time_pref?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area_geohash?: string | null
          assigned_provider_id?: string | null
          category_id?: string | null
          category_slug?: string
          created_at?: string
          cust_lat?: number | null
          cust_lng?: number | null
          customer_id?: string
          description?: string | null
          excluded_provider_ids?: string[]
          id?: string
          paid_at?: string | null
          pay_method?: string | null
          photos?: string[]
          price_agreed?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          swap_used?: boolean
          time_pref?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_live: boolean
          name_en: string
          name_hi: string
          name_te: string
          slug: string
          sort: number
          tier: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_live?: boolean
          name_en: string
          name_hi: string
          name_te: string
          slug: string
          sort?: number
          tier: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_live?: boolean
          name_en?: string
          name_hi?: string
          name_te?: string
          slug?: string
          sort?: number
          tier?: string
        }
        Relationships: []
      }
      dispatch_offers: {
        Row: {
          booking_id: string
          id: string
          provider_id: string
          responded_at: string | null
          response: Database["public"]["Enums"]["offer_response"]
          score: number | null
          sent_at: string
          wave: number
          window_sec: number
        }
        Insert: {
          booking_id: string
          id?: string
          provider_id: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["offer_response"]
          score?: number | null
          sent_at?: string
          wave: number
          window_sec: number
        }
        Update: {
          booking_id?: string
          id?: string
          provider_id?: string
          responded_at?: string | null
          response?: Database["public"]["Enums"]["offer_response"]
          score?: number | null
          sent_at?: string
          wave?: number
          window_sec?: number
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_offers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_offers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      job_tokens: {
        Row: {
          booking_id: string
          created_at: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          pin: string
          token: string
          verified_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          pin: string
          token?: string
          verified_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          pin?: string
          token?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_tokens_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          booking_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          booking_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          booking_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          lang: string
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          lang?: string
          phone?: string | null
          role?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          lang?: string
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          area_geohash: string | null
          availability_status: string
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          photo_url: string | null
          services: string[]
          upi_id: string | null
          user_id: string
          verify_tier: string
          visiting_charge: number | null
          voice_intro_url: string | null
          years_exp: number | null
        }
        Insert: {
          area_geohash?: string | null
          availability_status?: string
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          photo_url?: string | null
          services?: string[]
          upi_id?: string | null
          user_id: string
          verify_tier?: string
          visiting_charge?: number | null
          voice_intro_url?: string | null
          years_exp?: number | null
        }
        Update: {
          area_geohash?: string | null
          availability_status?: string
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          photo_url?: string | null
          services?: string[]
          upi_id?: string | null
          user_id?: string
          verify_tier?: string
          visiting_charge?: number | null
          voice_intro_url?: string | null
          years_exp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_stats: {
        Row: {
          acceptance_rate: number
          completion_rate: number
          jobs_done: number
          provider_id: string
          rating_avg: number
          updated_at: string
        }
        Insert: {
          acceptance_rate?: number
          completion_rate?: number
          jobs_done?: number
          provider_id: string
          rating_avg?: number
          updated_at?: string
        }
        Update: {
          acceptance_rate?: number
          completion_rate?: number
          jobs_done?: number
          provider_id?: string
          rating_avg?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_stats_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          booking_id: string
          created_at: string
          customer_id: string
          id: string
          provider_id: string
          rating: number
          tags: string[]
        }
        Insert: {
          body?: string | null
          booking_id: string
          created_at?: string
          customer_id: string
          id?: string
          provider_id: string
          rating: number
          tags?: string[]
        }
        Update: {
          body?: string | null
          booking_id?: string
          created_at?: string
          customer_id?: string
          id?: string
          provider_id?: string
          rating?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          category_id: string | null
          city: string | null
          created_at: string
          id: string
          phone: string
        }
        Insert: {
          category_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          phone: string
        }
        Update: {
          category_id?: string | null
          city?: string | null
          created_at?: string
          id?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      sweep_dispatch: { Args: never; Returns: undefined }
    }
    Enums: {
      booking_status:
        | "requested"
        | "finding_pro"
        | "assigned"
        | "verified"
        | "in_progress"
        | "done"
        | "cancelled"
        | "failed"
      offer_response: "pending" | "accepted" | "declined" | "expired"
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
      booking_status: [
        "requested",
        "finding_pro",
        "assigned",
        "verified",
        "in_progress",
        "done",
        "cancelled",
        "failed",
      ],
      offer_response: ["pending", "accepted", "declined", "expired"],
    },
  },
} as const
