export const metadata = {
  title: 'Privacy Policy | Edgy Fashion',
  description: 'Privacy Policy for Edgy Fashion. Learn how we collect, use, and protect your personal information.'
}

export default function PrivacyPolicyPage() {
  const updated = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-sm leading-6">
          <p>
            This Privacy Policy explains how Edgy Fashion ("we", "us", "our") collects, uses, discloses, and
            safeguards your information when you visit our website https://edgyfashion.vercel.app/ and make
            purchases from our store.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Personal information: name, email address, phone number, billing and shipping address.</li>
            <li>Order information: items purchased, payment method (processed securely by our payment partners), and transaction details.</li>
            <li>Technical data: IP address, browser type, pages visited, and device information for analytics and security.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill your orders, including shipping and returns.</li>
            <li>To communicate order updates, support queries, and service notifications.</li>
            <li>To improve our website, products, and customer experience.</li>
            <li>To prevent fraud and ensure platform security.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Sharing of Information</h2>
          <p>
            We do not sell your personal data. We share data only with trusted service providers such as payment
            gateways, analytics, and logistics partners, strictly for order processing and service delivery.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information. Payments are
            processed by secure, PCI-DSS compliant providers.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Your Rights</h2>
          <p>
            You can request access, correction, or deletion of your personal information by contacting us at
            <a href="/contact" className="text-red-400 hover:text-red-300 ml-1 underline">/contact</a>.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">6. Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience. You can manage cookies through your browser settings.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">7. Contact</h2>
          <p>
            For any questions about this Privacy Policy, please reach us on the Contact page at
            <a href="/contact" className="text-red-400 hover:text-red-300 ml-1 underline">/contact</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
