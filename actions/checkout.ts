'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

interface OrderData {
  store_id: string
  customer_id: string
  items: OrderItem[]
  payment_method: 'cash' | 'credit_card' | 'fiado'
  total: number
}

export async function processOrder(orderData: OrderData) {
  // Use admin client to bypass RLS for balance updates and order creation (if user is customer)
  // Standard `createClient` would use the user's session, which might lack permissions
  // to update `store_customer_relationships` (only owners can update).
  const supabase = createAdminClient()
  const userSupabase = createClient() // We still might want to check auth?

  const { store_id, customer_id, payment_method, total } = orderData

  try {
    // Basic Auth Check
    const { data: { user } } = await userSupabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    if (user.id !== customer_id) throw new Error('Customer ID mismatch')

    // 1. Validate 'Fiado' Logic
    if (payment_method === 'fiado') {
      // a. Query relationship
      const { data: relationship, error: relError } = await supabase
        .from('store_customer_relationships')
        .select('*')
        .eq('store_id', store_id)
        .eq('customer_id', customer_id)
        .single()

      if (relError || !relationship) {
        throw new Error('Relationship not found or access denied')
      }

      // b. Check if approved
      if (!relationship.is_fiado_approved) {
        throw new Error('Fiado not approved for this store')
      }

      // c. & d. Check limit and Atomic Update
      if (relationship.current_balance + total > relationship.credit_limit) {
        throw new Error('Credit limit exceeded')
      }

      // Optimistic/Careful Update using Admin Client
      const newBalance = relationship.current_balance + total

      const { data: updatedRel, error: updateError } = await supabase
        .from('store_customer_relationships')
        .update({ current_balance: newBalance })
        .eq('id', relationship.id)
        .eq('current_balance', relationship.current_balance) // Optimistic Lock
        .select()
        .single()

      if (updateError || !updatedRel) {
         throw new Error('Transaction failed (concurrency). Please try again.')
      }

      // e. Insert balance history
      const { error: historyError } = await supabase
        .from('balance_history')
        .insert({
          relationship_id: relationship.id,
          amount: total,
          type: 'credit'
        })

      if (historyError) {
        // Compensation
        await supabase
          .from('store_customer_relationships')
          .update({ current_balance: relationship.current_balance })
          .eq('id', relationship.id)

        throw new Error('Failed to record transaction history')
      }
    }

    // 3. Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        store_id,
        customer_id,
        status: 'pending',
        payment_method,
        total
      })
      .select()
      .single()

    if (orderError) {
      // If Fiado was used, we need to revert the balance change!
      if (payment_method === 'fiado') {
         const { data: rel } = await supabase
            .from('store_customer_relationships')
            .select('id, current_balance')
            .eq('store_id', store_id)
            .eq('customer_id', customer_id)
            .single()

         if (rel) {
             await supabase
            .from('store_customer_relationships')
            .update({ current_balance: rel.current_balance - total })
            .eq('id', rel.id)
         }
      }
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    return { success: true, order }

  } catch (error: any) {
    console.error('Process Order Error:', error)
    return { success: false, error: error.message }
  }
}
