import { createClient } from '@supabase/supabase-js'

// Hardcoded for development - in production use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zyuhigsqvgqhsdccjqvi.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5dWhpZ3NxdmdxaHNkY2NqcXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODg1MzYsImV4cCI6MjA1MDM2NDUzNn0.qf6rjEJxbDrqMUMmzG0K8VxL39y0yIXdMXMX9W7FaKY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface Staff {
  id: string
  name: string
  position: 'SE1' | 'SE2' | 'PE1' | 'PE2' | 'Manager'
  email?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Traffic {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Device {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Game {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface ExchangeRate {
  id: string
  from_currency: 'USD' | 'IDR' | 'MYR'
  to_currency: 'USD' | 'IDR' | 'MYR'
  rate: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CommissionRate {
  id: string
  position: 'SE1' | 'SE2' | 'PE1' | 'PE2' | 'Manager'
  tmt_rate: number
  crt_rate: number
  kpi_target: number
  depositor_target: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  customer_name: string
  deposit: number
  staff_id: string
  agent_id: string
  traffic_id?: string
  device_id?: string
  game_id?: string
  department: string
  exchange_rate: number
  amount: number
  amount_in_myr: number
  currency: string
  type: string
  status: 'pending' | 'closed' | 'cancelled'
  date: string
  notes?: string
  is_depositor: boolean
  is_fda: boolean
  created_at: string
  updated_at: string
}

// Helper function untuk error handling
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  return {
    success: false,
    error: error.message || 'Database error occurred'
  }
} 