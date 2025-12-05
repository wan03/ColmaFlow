'use server'

import { createClient } from '@/utils/supabase/server'

export interface CustomerData {
  relationship_id: string
  customer_id: string
  full_name: string | null
  phone: string | null
  current_balance: number
  credit_limit: number
  is_fiado_approved: boolean
}

export async function getCustomers() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // 1. Get Store ID for this owner
  const { data: store } = await supabase
    .from('colmados')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!store) throw new Error('Store not found for this user')

  // 2. Fetch relationships
  const { data, error } = await supabase
    .from('store_customer_relationships')
    .select(`
      id,
      customer_id,
      current_balance,
      credit_limit,
      is_fiado_approved,
      profiles:customer_id (
        full_name,
        phone
      )
    `)
    .eq('store_id', store.id)

  if (error) throw new Error(error.message)

  // 3. Flatten data
  return data.map((item: any) => ({
    relationship_id: item.id,
    customer_id: item.customer_id,
    full_name: item.profiles?.full_name || 'Unknown',
    phone: item.profiles?.phone || 'Unknown',
    current_balance: item.current_balance,
    credit_limit: item.credit_limit,
    is_fiado_approved: item.is_fiado_approved
  })) as CustomerData[]
}

export async function adjustCreditLimit(relationshipId: string, newLimit: number) {
  const supabase = createClient()

  const { error } = await supabase
    .from('store_customer_relationships')
    .update({ credit_limit: newLimit, is_fiado_approved: true }) // Auto approve if limit is set? Maybe. Or just update limit.
    .eq('id', relationshipId)

  if (error) throw new Error(error.message)
  return { success: true }
}

export async function recordPayment(relationshipId: string, amount: number) {
  const supabase = createClient()

  // 1. Get current balance to decrement
  const { data: rel, error: fetchError } = await supabase
    .from('store_customer_relationships')
    .select('current_balance')
    .eq('id', relationshipId)
    .single()

  if (fetchError || !rel) throw new Error('Relationship not found')

  // 2. Update balance (Optimistic locking if we were strict, but for now simple update is okay for single owner action)
  const newBalance = rel.current_balance - amount

  const { error: updateError } = await supabase
    .from('store_customer_relationships')
    .update({ current_balance: newBalance })
    .eq('id', relationshipId)

  if (updateError) throw new Error(updateError.message)

  // 3. Log history
  const { error: historyError } = await supabase
    .from('balance_history')
    .insert({
      relationship_id: relationshipId,
      amount: amount,
      type: 'payment'
    })

  if (historyError) throw new Error('Failed to log history')

  return { success: true }
}
