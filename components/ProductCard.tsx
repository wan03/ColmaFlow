'use client'

import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string | null
    category: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 flex flex-col">
      <div className="aspect-square bg-gray-200 relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="font-bold text-gray-900">RD$ {product.price}</span>
          <button
            onClick={() => addItem({
              product_id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url
            })}
            className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-transform"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}
