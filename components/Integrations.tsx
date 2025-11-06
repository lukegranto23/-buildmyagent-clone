"use client";

import { Button } from "./ui/button";

const integrationStacks = [
  {
    title: "Analog handshake essentials",
    description: "Bridge the landline, postcards, and counter signage Main Street owners still rely on.",
    items: [
      { name: "Phone-to-Text Bridge", icon: "☎️", note: "Answer landlines + route to AI" },
      { name: "Printed Mailers Queue", icon: "📬", note: "Auto-generate reminder cards" },
      { name: "Handwritten Notes", icon: "✍️", note: "Trigger physical thank-you notes" },
      { name: "Fax-to-Email", icon: "📠", note: "Convert legacy paperwork instantly" },
      { name: "Lobby Signage QR", icon: "🪧", note: "Print-ready signage for in-person adoption" },
    ],
  },
  {
    title: "Digital follow-through",
    description: "Modern connectors that prove ROI and keep your AI accountable.",
    items: [
      { name: "Google Calendar", icon: "📅", note: "Sync chair time and tech routes" },
      { name: "Jobber / ServiceTitan", icon: "🛠️", note: "Dispatch trades and update jobs" },
      { name: "Dentrix / OpenDental", icon: "🦷", note: "Push hygiene recalls and treatments" },
      { name: "Mailchimp & Constant Contact", icon: "📧", note: "Send boomer-friendly newsletters" },
      { name: "QuickBooks & Stripe", icon: "💳", note: "Collect deposits and reconcile" },
      { name: "Zapier & Make", icon: "⚡", note: "Extend to 800+ apps in minutes" },
    ],
  },
];

export function Integrations() {
  return (
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <Button className="mb-4" variant="outline">
          Integrations
        </Button>
        <h2 className="text-4xl font-bold">Wire the agent into the real world</h2>
        <p className="mt-3 text-lg text-gray-600">
          Blend postcard reminders, phone bridges, and modern automations so boomer-run teams feel nothing but relief.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {integrationStacks.map((stack) => (
          <div key={stack.title} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{stack.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{stack.description}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {stack.items.length} touchpoints
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {stack.items.map((item) => (
                <li
                  key={item.name}
                  className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                >
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button className="bg-blue-600 text-white hover:bg-blue-700">
          Schedule an integration walk-through
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

