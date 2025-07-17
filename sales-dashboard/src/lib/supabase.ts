import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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