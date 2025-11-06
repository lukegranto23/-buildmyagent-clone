import Link from "next/link";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: November 6, 2025</p>

          <div className="mt-8 space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
              <p className="mt-2">
                Main Street Agent Lab (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
              <p className="mt-2">We collect information that you provide directly to us, including:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li><strong>Account Information:</strong> Name, email address, password, and profile information</li>
                <li><strong>Agent Data:</strong> AI agent configurations, prompts, scripts, and settings you create</li>
                <li><strong>Communication Data:</strong> Messages, conversation logs, and interaction history</li>
                <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through Stripe)</li>
                <li><strong>Usage Data:</strong> Information about how you use our Service, including access times, pages viewed, and interactions</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
              <p className="mt-2">We use the collected information for:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li>Providing, maintaining, and improving our Service</li>
                <li>Processing transactions and sending related information</li>
                <li>Sending technical notices, updates, and support messages</li>
                <li>Responding to your comments and questions</li>
                <li>Monitoring and analyzing trends, usage, and activities</li>
                <li>Detecting and preventing fraud and abuse</li>
                <li>Personalizing your experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">4. Information Sharing and Disclosure</h2>
              <p className="mt-2">We may share your information with:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li><strong>Service Providers:</strong> Third-party companies that perform services on our behalf (e.g., OpenAI for AI processing, Twilio for communications, Stripe for payments)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition</li>
              </ul>
              <p className="mt-2">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">5. Data Security</h2>
              <p className="mt-2">
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">6. Data Retention</h2>
              <p className="mt-2">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Agent data and conversation logs are retained based on your subscription plan.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">7. Your Rights</h2>
              <p className="mt-2">You have the right to:</p>
              <ul className="mt-2 list-inside list-disc space-y-1 pl-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us at support@buildmyagent.io
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">8. Cookies and Tracking</h2>
              <p className="mt-2">
                We use cookies and similar tracking technologies to collect and track information about your use of our Service. You can control cookies through your browser settings, but disabling cookies may affect the functionality of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">9. Third-Party Services</h2>
              <p className="mt-2">
                Our Service integrates with third-party services including OpenAI, Twilio, Stripe, and various business tools. These services have their own privacy policies, and we encourage you to review them.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">10. Children&apos;s Privacy</h2>
              <p className="mt-2">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">11. International Data Transfers</h2>
              <p className="mt-2">
                Your information may be transferred to and maintained on servers located outside of your country. We ensure appropriate safeguards are in place for such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">12. Changes to This Policy</h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900">13. Contact Us</h2>
              <p className="mt-2">
                If you have any questions about this Privacy Policy, please contact us at:
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
