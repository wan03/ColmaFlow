'use client'

import { useEffect, useState } from 'react'
import { getStoreDetails, getStoreProducts, getCustomerCreditInfo } from '@/actions/customer/store'
import ProductCard from '@/components/ProductCard'
import CartSheet from '@/components/CartSheet'
import { useCart } from '@/context/CartContext'
import { createClient } from '@/utils/supabase/client'

export default function StorePage({ params }: { params: { id: string } }) {
  const { itemCount } = useCart()
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [creditInfo, setCreditInfo] = useState<any>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const [storeData, productsData, creditData] = await Promise.all([
          getStoreDetails(params.id),
          getStoreProducts(params.id),
          getCustomerCreditInfo(params.id)
        ])
        setStore(storeData)
        setProducts(productsData)
        setCreditInfo(creditData)

        // Get current user ID for checkout
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCustomerId(user?.id || null)

      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [params.id])

  if (loading) return <div className="p-10 text-center">Loading Store...</div>
  if (!store) return <div className="p-10 text-center">Store not found</div>

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">{store.name}</h1>
            <p className="text-xs text-gray-500">{store.is_open ? 'Open Now' : 'Closed'}</p>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Product Grid */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {products.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No products available.</p>
        )}
      </main>

      {/* Cart Sheet */}
      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeId={store.id}
        customerId={customerId}
        creditInfo={creditInfo}
      />
    </div>
  )
}
