'use client'

import { useCart } from '@/context/CartContext'
import { useState } from 'react'
import { processOrder } from '@/actions/checkout'
import { useRouter } from 'next/navigation'

interface CartSheetProps {
  isOpen: boolean
  onClose: () => void
  storeId: string
  customerId: string | null
  creditInfo: {
    is_fiado_approved: boolean
    available_balance: number
    credit_limit: number
  } | null
}

export default function CartSheet({ isOpen, onClose, storeId, customerId, creditInfo }: CartSheetProps) {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'fiado'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleCheckout = async () => {
    if (!customerId) {
      alert('Please login to checkout')
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        store_id: storeId,
        customer_id: customerId,
        items: items.map(i => ({
          product_id: i.product_id,
          quantity: i.quantity,
          price: i.price
        })),
        payment_method: paymentMethod,
        total: total
      }

      const result = await processOrder(orderData)

      if (result.success) {
        clearCart()
        onClose()
        router.push('/order-confirmation')
      } else {
        alert('Checkout failed: ' + result.error)
      }
    } catch (e: any) {
      alert('Error: ' + e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const canUseFiado = creditInfo?.is_fiado_approved && creditInfo.available_balance >= total

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-in">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-500 mt-10">Your cart is empty.</p>
          ) : (
            items.map(item => (
              <div key={item.product_id} className="flex gap-3 border-b pb-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                   {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                  <div className="text-gray-600 text-sm">RD$ {item.price}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center border rounded">
                    <button onClick={() => updateQuantity(item.product_id, -1)} className="px-2 py-1 hover:bg-gray-100">-</button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product_id, 1)} className="px-2 py-1 hover:bg-gray-100">+</button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t bg-gray-50 space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>RD$ {total.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="font-semibold text-sm">Payment Method</label>

              <div
                className={`border rounded p-3 flex justify-between items-center cursor-pointer ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                onClick={() => setPaymentMethod('cash')}
              >
                <div className="flex items-center gap-2">
                  <input type="radio" checked={paymentMethod === 'cash'} readOnly />
                  <span>Cash</span>
                </div>
              </div>

              <div
                className={`border rounded p-3 cursor-pointer ${paymentMethod === 'fiado' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} ${!canUseFiado ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => canUseFiado && setPaymentMethod('fiado')}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <input type="radio" checked={paymentMethod === 'fiado'} readOnly disabled={!canUseFiado} />
                    <span>Fiado (Credit)</span>
                  </div>
                  {creditInfo && (
                     <span className={`text-xs ${canUseFiado ? 'text-green-600' : 'text-red-500'}`}>
                        Avail: RD$ {creditInfo.available_balance.toFixed(2)}
                     </span>
                  )}
                </div>
                {!creditInfo?.is_fiado_approved && <p className="text-xs text-red-500 pl-6">Not approved for credit.</p>}
                {creditInfo?.is_fiado_approved && !canUseFiado && <p className="text-xs text-red-500 pl-6">Insufficient credit.</p>}
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow disabled:opacity-70"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
