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
      profiles: {
        Row: {
          id: string
          role: 'customer' | 'owner' | 'driver'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'customer' | 'owner' | 'driver'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'customer' | 'owner' | 'driver'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      colmados: {
        Row: {
          id: string
          owner_id: string
          name: string
          location: string
          is_open: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          location: string
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          location?: string
          is_open?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      global_products: {
        Row: {
          id: string
          name: string
          category: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      store_products: {
        Row: {
          id: string
          store_id: string
          product_id: string
          custom_name: string | null
          price: number
          in_stock: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          product_id: string
          custom_name?: string | null
          price: number
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          product_id?: string
          custom_name?: string | null
          price?: number
          in_stock?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          customer_id: string
          status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          payment_method: 'cash' | 'credit_card' | 'fiado'
          total: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_id: string
          status?: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          payment_method: 'cash' | 'credit_card' | 'fiado'
          total: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_id?: string
          status?: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | null
          payment_method?: 'cash' | 'credit_card' | 'fiado'
          total?: number
          created_at?: string
          updated_at?: string
        }
      }
      store_customer_relationships: {
        Row: {
          id: string
          store_id: string
          customer_id: string
          is_fiado_approved: boolean
          credit_limit: number
          current_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          customer_id: string
          is_fiado_approved?: boolean
          credit_limit?: number
          current_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          customer_id?: string
          is_fiado_approved?: boolean
          credit_limit?: number
          current_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      balance_history: {
        Row: {
          id: string
          relationship_id: string
          amount: number
          type: 'credit' | 'debit' | 'payment'
          created_at: string
        }
        Insert: {
          id?: string
          relationship_id: string
          amount: number
          type: 'credit' | 'debit' | 'payment'
          created_at?: string
        }
        Update: {
          id?: string
          relationship_id?: string
          amount?: number
          type?: 'credit' | 'debit' | 'payment'
          created_at?: string
        }
      }
    }
  }
}
