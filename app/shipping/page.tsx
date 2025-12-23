export const metadata = {
  title: 'Shipping Policy | Edgy Fashion',
  description: 'Shipping policy for Edgy Fashion orders including delivery timelines, charges, and coverage area.'
}

export default function ShippingPolicyPage() {
  const updated = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Shipping Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-sm leading-6">
          <h2 className="text-xl font-semibold text-white">1. Delivery Timelines</h2>
          <p>
            Orders are typically processed within 1–2 business days. Standard delivery timelines are 3–7 business days
            depending on your location. During peak seasons or due to unforeseen circumstances, deliveries may take
            longer.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Shipping Charges</h2>
          <p>
            We offer free shipping on eligible orders as displayed at checkout. Any applicable shipping charges will be
            shown before you place the order.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Serviceable Locations</h2>
          <p>
            We ship across most pin codes in India through trusted courier partners. If your address is not serviceable,
            you will be notified at checkout.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Order Tracking</h2>
          <p>
            Once your order is shipped, you will receive a tracking link via email/SMS (where available). You can also
            contact us for tracking assistance via the Contact page at
            <a href="/contact" className="text-red-400 hover:text-red-300 ml-1 underline">/contact</a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Failed Delivery</h2>
          <p>
            If delivery fails due to an incorrect address or unavailability of the recipient, the shipment may be
            returned. We will contact you to attempt re-delivery. Additional charges may apply in such cases.
          </p>
        </div>
      </div>
    </main>
  )
}
