/**
 * Simplified Supabase database types for the stepper form example
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      offers: {
        Row: {
          id: string
          customer_id: string
          source: string
          created_by: string
          waste_type: string
          address: string
          tk?: string | null
          town?: string | null
          who_transport: boolean
          loading: string
          hma: boolean
          certificate?: string | null
          requirements: string
          customer_comments: string
          created_at: string
          updated_at: string
          deleted: boolean
        }
        Insert: {
          id?: string
          customer_id: string
          source: string
          created_by: string
          waste_type: string
          address: string
          tk?: string | null
          town?: string | null
          who_transport: boolean
          loading: string
          hma: boolean
          certificate?: string | null
          requirements: string
          customer_comments: string
          created_at: string
          updated_at: string
          deleted: boolean
        }
        Update: {
          id?: string
          customer_id?: string
          source?: string
          created_by?: string
          waste_type?: string
          address?: string
          tk?: string | null
          town?: string | null
          who_transport?: boolean
          loading?: string
          hma?: boolean
          certificate?: string | null
          requirements?: string
          customer_comments?: string
          created_at?: string
          updated_at?: string
          deleted?: boolean
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email?: string | null
          phone?: string | null
          created_at: string
          updated_at?: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: string
          status: string
          created_at: string
          updated_at?: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          role: string
          status: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          status?: string
          created_at?: string
          updated_at?: string | null
        }
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
  }
} 