export const metadata = {
  title: 'Terms & Conditions | Edgy Fashion',
  description: 'Terms and Conditions for using the Edgy Fashion website and services.'
}

export default function TermsPage() {
  const updated = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <main className="min-h-screen bg-gray-900 text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Terms & Conditions</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {updated}</p>

        <div className="space-y-6 text-sm leading-6">
          <p>
            By accessing and placing an order with Edgy Fashion ("we", "us"), you confirm that you agree to and
            are bound by the terms and conditions contained in the Terms of Use outlined below. These terms apply
            to the entire website and any email or other type of communication between you and Edgy Fashion.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">1. Use of the Website</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You agree not to misuse the services or help anyone else to do so.</li>
            <li>All content is for personal, non-commercial use unless we provide written consent.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">2. Orders and Pricing</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>All prices are shown in INR and inclusive/exclusive of taxes as indicated at checkout.</li>
            <li>Order confirmation is subject to stock availability and payment authorization.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">3. Intellectual Property</h2>
          <p>
            All content on this website including logos, graphics, images, and text is the property of Edgy Fashion
            or its content suppliers and protected by applicable laws.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Edgy Fashion shall not be liable for any indirect, incidental,
            special, consequential or punitive damages resulting from your use of the website.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">5. Contact</h2>
          <p>
            For questions regarding these Terms, please contact us at
            <a href="/contact" className="text-red-400 hover:text-red-300 ml-1 underline">/contact</a>.
          </p>
        </div>
      </div>
    </main>
  )
}
