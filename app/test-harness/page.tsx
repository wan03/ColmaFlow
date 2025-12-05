'use client'

import { useState } from 'react'
import { processOrder } from '@/actions/checkout'

export default function TestHarness() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Hardcoded test data based on seed
  // Store: Súper Colmado La Bendición (c01m4d0s-0001-4000-8000-000000000001)
  // Customer: Pedro (d0d8c19c-0b0d-4096-b0a6-123456789003) - Has Credit
  // Relationship: f1ad0000-0001-0000-0000-000000000001
  // Limit: 5000, Balance: 1450 (from seed) -> Available: 3550

  const handleCheckout = async (amount: number, paymentMethod: 'fiado' | 'cash') => {
    setLoading(true)
    setResult(null)

    try {
      const orderData = {
        store_id: 'c01m4d0s-0001-4000-8000-000000000001',
        customer_id: 'd0d8c19c-0b0d-4096-b0a6-123456789003',
        items: [{ product_id: 'test-product', quantity: 1, price: amount }],
        payment_method: paymentMethod,
        total: amount
      }

      const response = await processOrder(orderData)
      setResult(response)
    } catch (e: any) {
      setResult({ success: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Test Harness</h1>

      <div className="space-x-4 mb-4">
        <button
          id="btn-fiado-success"
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => handleCheckout(100, 'fiado')}
          disabled={loading}
        >
          Fiado Success ($100)
        </button>

        <button
          id="btn-fiado-fail"
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => handleCheckout(10000, 'fiado')} // Exceeds limit
          disabled={loading}
        >
          Fiado Fail ($10000)
        </button>
      </div>

      <div id="result-area" className="border p-4 mt-4 bg-gray-100">
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>

      {result?.success && <div id="success-indicator" className="text-green-600 font-bold">SUCCESS</div>}
      {result?.error && <div id="error-indicator" className="text-red-600 font-bold">ERROR: {result.error}</div>}
    </div>
  )
}
