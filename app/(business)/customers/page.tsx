'use client'

import { useEffect, useState } from 'react'
import { getCustomers, adjustCreditLimit, recordPayment, CustomerData } from '@/actions/business/customers'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal State
  const [activeCustomer, setActiveCustomer] = useState<CustomerData | null>(null)
  const [modalType, setModalType] = useState<'limit' | 'payment' | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await getCustomers()
      setCustomers(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAction = async () => {
    if (!activeCustomer || !inputValue) return
    setActionLoading(true)
    try {
      const amount = parseFloat(inputValue)
      if (isNaN(amount)) throw new Error('Invalid number')

      if (modalType === 'limit') {
        await adjustCreditLimit(activeCustomer.relationship_id, amount)
      } else if (modalType === 'payment') {
        await recordPayment(activeCustomer.relationship_id, amount)
      }

      setModalType(null)
      setInputValue('')
      setActiveCustomer(null)
      await fetchData() // Refresh
    } catch (e: any) {
      alert(e.message)
    } finally {
      setActionLoading(false)
    }
  }

  const openModal = (customer: CustomerData, type: 'limit' | 'payment') => {
    setActiveCustomer(customer)
    setModalType(type)
    setInputValue('')
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Customers & Fiado</h1>

      {loading && <p>Loading customers...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Balance</th>
                <th className="px-6 py-4">Limit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((c) => (
                <tr key={c.relationship_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div>{c.full_name}</div>
                    <div className="text-xs text-gray-500">{c.phone}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">
                    RD$ {c.current_balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    RD$ {c.credit_limit.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.is_fiado_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {c.is_fiado_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => openModal(c, 'limit')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm text-xs sm:text-sm"
                    >
                      Adjust Limit
                    </button>
                    <button
                      onClick={() => openModal(c, 'payment')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm text-xs sm:text-sm"
                    >
                      Record Payment
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalType && activeCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'limit' ? 'Adjust Credit Limit' : 'Record Cash Payment'}
            </h2>
            <p className="mb-4 text-gray-600">
              Customer: <strong>{activeCustomer.full_name}</strong>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modalType === 'limit' ? 'New Credit Limit (RD$)' : 'Amount Paid (RD$)'}
            </label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded shadow-sm ${modalType === 'limit' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {actionLoading ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
