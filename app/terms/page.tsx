import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Main Street Agent Lab
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 6, 2025</p>

          <div className="mt-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
              <p className="mt-2">
                By accessing and using Main Street Agent Lab (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Description of Service</h2>
              <p className="mt-2">
                Main Street Agent Lab provides a platform for creating, managing, and deploying AI agents for business automation. The Service includes agent building tools, workflow automation, calendar integration, and communication management features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. User Accounts</h2>
              <p className="mt-2">
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Acceptable Use</h2>
              <p className="mt-2">
                You agree not to use the Service to:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious code</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to the Service</li>
                <li>Use the Service for spam or unsolicited communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Intellectual Property</h2>
              <p className="mt-2">
                The Service and its original content, features, and functionality are owned by Main Street Agent Lab and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">6. Payment and Billing</h2>
              <p className="mt-2">
                Certain features of the Service may require payment. You agree to pay all fees or charges to your account based on the billing terms in effect at the time. We reserve the right to change our pricing at any time with prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">7. Termination</h2>
              <p className="mt-2">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">8. Limitation of Liability</h2>
              <p className="mt-2">
                In no event shall Main Street Agent Lab, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">9. Disclaimer of Warranties</h2>
              <p className="mt-2">
                The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Main Street Agent Lab makes no warranties, expressed or implied, and hereby disclaims all warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">10. Changes to Terms</h2>
              <p className="mt-2">
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">11. Contact Us</h2>
              <p className="mt-2">
                If you have any questions about these Terms, please contact us at:
              </p>
              <p className="mt-2 font-medium">support@buildmyagent.io</p>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 Main Street Agent Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
