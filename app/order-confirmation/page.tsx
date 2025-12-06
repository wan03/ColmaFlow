import Link from 'next/link'

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Received!</h1>
      <p className="text-gray-600 mb-8 max-w-xs">
        Your order has been successfully placed and sent to the colmado.
      </p>
      <Link href="/" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg w-full max-w-xs">
        Back to Home
      </Link>
    </div>
  )
}
