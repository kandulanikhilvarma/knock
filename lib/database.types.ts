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
          photo_url: string | null
          services: string[]
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
          photo_url?: string | null
          services?: string[]
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
          photo_url?: string | null
          services?: string[]
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
