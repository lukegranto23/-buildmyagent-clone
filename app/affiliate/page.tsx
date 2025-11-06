"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AffiliatePage() {
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
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Become an Affiliate Partner
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Earn generous commissions by helping Main Street businesses discover AI automation
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">30% Recurring Commission</h3>
              <p className="mt-2 text-gray-600">
                Earn 30% commission on every monthly subscription payment from customers you refer, for as long as they remain active.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">90-Day Cookie Window</h3>
              <p className="mt-2 text-gray-600">
                Get credit for any customer who signs up within 90 days of clicking your affiliate link.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Marketing Resources</h3>
              <p className="mt-2 text-gray-600">
                Access banners, email templates, demo videos, and sales scripts to help you succeed.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-12 space-y-8">
            <div className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Sign Up</h3>
                <p className="mt-1 text-gray-600">
                  Fill out the application form below. We&apos;ll review and approve your account within 24 hours.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Get Your Links</h3>
                <p className="mt-1 text-gray-600">
                  Access your unique affiliate links and marketing materials from your dashboard.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Promote</h3>
                <p className="mt-1 text-gray-600">
                  Share Main Street Agent Lab with your network, blog readers, social media followers, or clients.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Earn Commissions</h3>
                <p className="mt-1 text-gray-600">
                  Get paid monthly via PayPal or direct deposit. Track your earnings in real-time through your affiliate dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ideal Partners */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Ideal For</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Agency Owners & Consultants</h3>
              <p className="mt-2 text-sm text-gray-600">
                Offer AI agent solutions to your clients and earn recurring revenue without the development overhead.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Content Creators & Influencers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Share valuable automation tools with your audience and earn from every sign-up.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Software Reviewers & Bloggers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Write about AI automation and get compensated for driving qualified traffic.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-gray-900">Business Coaches & Trainers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Recommend proven automation tools to help your clients scale their operations.
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="mx-auto mt-20 max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900">Apply to Join</h2>
          <p className="mt-2 text-gray-600">Fill out the form below to start earning with us.</p>

          <form className="mt-8 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website or Social Media URL
              </label>
              <input
                type="url"
                id="website"
                name="website"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://"
                required
              />
            </div>

            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
                Describe Your Audience
              </label>
              <textarea
                id="audience"
                name="audience"
                rows={4}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about your audience, traffic, and how you plan to promote Main Street Agent Lab..."
                required
              />
            </div>

            <div>
              <label htmlFor="promotionMethod" className="block text-sm font-medium text-gray-700">
                How will you promote us?
              </label>
              <select
                id="promotionMethod"
                name="promotionMethod"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a method...</option>
                <option value="blog">Blog / Content Marketing</option>
                <option value="social">Social Media</option>
                <option value="youtube">YouTube / Video</option>
                <option value="email">Email Marketing</option>
                <option value="consulting">Consulting / Agency Services</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => {
                alert("Affiliate program coming soon! We'll notify you when applications open.");
              }}
            >
              Submit Application
            </Button>

            <p className="text-center text-sm text-gray-500">
              By applying, you agree to our affiliate terms and conditions.
            </p>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">When do I get paid?</h3>
              <p className="mt-2 text-gray-600">
                Commissions are paid out monthly, 30 days after the end of each month. You need a minimum of $50 in commissions to receive a payout.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Can I refer myself?</h3>
              <p className="mt-2 text-gray-600">
                No, self-referrals are not permitted. Our affiliate program is designed to reward genuine promotion to new customers.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">How do I track my referrals?</h3>
              <p className="mt-2 text-gray-600">
                You&apos;ll have access to a real-time dashboard showing clicks, conversions, and earnings for all your referral links.
              </p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">What if a customer cancels?</h3>
              <p className="mt-2 text-gray-600">
                If a customer cancels their subscription, you&apos;ll no longer earn commissions on their account. However, you&apos;ll keep all commissions earned up until the cancellation.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2025 Main Street Agent Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
