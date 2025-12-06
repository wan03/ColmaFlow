'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

export interface CartItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url: string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (product_id: string) => void
  updateQuantity: (product_id: string, delta: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Calculate totals
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existing = current.find(i => i.product_id === newItem.product_id)
      if (existing) {
        return current.map(i =>
          i.product_id === newItem.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...current, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (product_id: string) => {
    setItems(current => current.filter(i => i.product_id !== product_id))
  }

  const updateQuantity = (product_id: string, delta: number) => {
    setItems(current => {
      return current.map(i => {
        if (i.product_id === product_id) {
          const newQty = Math.max(0, i.quantity + delta)
          return { ...i, quantity: newQty }
        }
        return i
      }).filter(i => i.quantity > 0)
    })
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
