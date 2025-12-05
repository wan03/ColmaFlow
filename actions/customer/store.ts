'use server'

import { createClient } from '@/utils/supabase/server'

export async function getStoreDetails(storeId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('colmados')
    .select('id, name, location, is_open')
    .eq('id', storeId)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getStoreProducts(storeId: string) {
  const supabase = createClient()
  // Fetch store products joined with global products
  const { data, error } = await supabase
    .from('store_products')
    .select(`
      id,
      price,
      in_stock,
      custom_name,
      global_products (
        id,
        name,
        category,
        image_url
      )
    `)
    .eq('store_id', storeId)
    .eq('in_stock', true)

  if (error) throw new Error(error.message)

  // Map to a cleaner structure
  return data.map((item: any) => ({
    product_id: item.global_products.id, // Store Product Logic might need the Store Product ID for specific pricing, but usually cart uses product ID. Actually the checkout action expects product_id? No, it expects items. Ideally we pass the product_id (global) or store_product_id. Let's verify checkout.ts.
    // Checkout.ts expects items: { product_id: string ... }. Usually this means the REFERENCE to the product being bought.
    // If we use Global ID, the checkout logic needs to find the price again?
    // In `checkout.ts` the `OrderData` has `items` with `price`.
    // So we just need an identifier. Global Product ID is fine if unique per store in cart.
    // But `store_products.id` is more specific.
    // Let's use `store_products.id` as the unique key for "Item from this store".
    // Wait, the CartItem interface uses `product_id`. I'll use `store_products.id` as the `product_id` in the cart to be safe/unique per store listing.

    // Actually, looking at seed.sql, store_products links store and global_product.
    // Let's pass the global product ID as "id" for display, but keep track?
    // Let's look at `checkout.ts` again. It takes `items: OrderItem[]`. `OrderItem` has `product_id`.
    // It doesn't query the price from DB in checkout (it trusts client `price`? That's risky but `processOrder` takes `total` and `items` with `price`...).
    // The current `processOrder` implementation relies on the input total. (We should fix that later for security, but for this task, we follow the interface).

    id: item.id, // This is the store_product_id
    global_id: item.global_products.id,
    name: item.custom_name || item.global_products.name,
    category: item.global_products.category,
    image_url: item.global_products.image_url,
    price: item.price
  }))
}

export async function getCustomerCreditInfo(storeId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('store_customer_relationships')
    .select('is_fiado_approved, credit_limit, current_balance')
    .eq('store_id', storeId)
    .eq('customer_id', user.id)
    .single()

  if (error || !data) return null

  return {
    is_fiado_approved: data.is_fiado_approved,
    credit_limit: data.credit_limit,
    current_balance: data.current_balance,
    available_balance: data.credit_limit - data.current_balance
  }
}
