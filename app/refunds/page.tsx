export const metadata = {
  title: 'Cancellation & Refunds | Edgy Fashion',
  description: 'Cancellation and Refunds policy for Edgy Fashion orders.'
}

export default function RefundsPage() {
  const updated = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Cancellation & Refunds</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-sm leading-6">
          <h2 className="text-xl font-semibold text-white">1. Order Cancellation</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Orders can be cancelled before they are shipped. To request cancellation, please contact us at <a href="/contact" className="text-red-400 hover:text-red-300 underline">/contact</a> with your order number.</li>
            <li>If the order has already been shipped, it cannot be cancelled. You may initiate a return after delivery (see Returns below).</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Returns</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Returns are accepted within 7 days from the date of delivery.</li>
            <li>Items must be unused, unwashed, and in original packaging with all tags intact.</li>
            <li>Certain items like innerwear or hygiene-sensitive products may be non-returnable.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Refunds</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Upon approval of the return, refunds will be initiated to the original payment method within 5-7 business days.</li>
            <li>Shipping charges (if any) are non-refundable unless the product is defective or the wrong item was delivered.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">4. Damaged or Incorrect Items</h2>
          <p>
            If you receive a damaged or incorrect item, please raise a request within 48 hours of delivery with photos for verification.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. How to Raise a Request</h2>
          <p>
            Please reach us via the Contact page at <a href="/contact" className="text-red-400 hover:text-red-300 underline">/contact</a> with your order number and details.
          </p>
        </div>
      </div>
    </main>
  )
}
