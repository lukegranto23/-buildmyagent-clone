import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgentBuilder } from "@/components/AgentBuilder";
import { Integrations } from "@/components/Integrations";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { Community } from "@/components/Community";
import { WorkflowBuilder } from "@/components/workflows/WorkflowBuilder";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b">
          <nav className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span>Main Street Agent</span>
              <span className="text-gray-500">Lab</span>
            </Link>
            <Link href="/agents" className="text-gray-600 hover:text-gray-900">
              Agents
            </Link>
            <Link href="/workflows" className="text-gray-600 hover:text-gray-900">
              Workflows
            </Link>
            <Link href="#method" className="text-gray-600 hover:text-gray-900">
              Method
            </Link>
            <Link href="#integrations" className="text-gray-600 hover:text-gray-900">
              Integrations
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
              Plans
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link href="#community" className="text-gray-600 hover:text-gray-900">
              Collective
            </Link>
          </nav>
        </header>

        <main>
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20">
            <AgentBuilder />
          </section>

          <section className="bg-gray-100 py-16">
            <div className="container mx-auto px-4">
              <div className="mb-8 max-w-3xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Orchestrate the experience
                </span>
                <h2 className="mt-4 text-3xl font-semibold text-gray-900 sm:text-4xl">
                  Drag-and-drop the calls, texts, and analog follow-up your clients expect
                </h2>
                <p className="mt-3 text-base text-gray-600">
                  Map the full customer journey just like n8n or buildmyagent.io—triggers on the left, AI brains in the middle, and integrations that make it real on day one. No API keys required yet.
                </p>
              </div>
              <WorkflowBuilder />
            </div>
          </section>

        <section id="method" className="bg-slate-900 py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                How it works
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Deliver an AI agent that feels like a trusted office manager from day one
              </h2>
              <p className="mt-3 text-base text-slate-200">
                Every playbook we ship pairs proven prompts with the collateral boomer-run businesses expect: phone scripts, printed mailers, handwritten notes, and a launch checklist that staff can follow without touching a dashboard.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[{
                title: "Analog-first sales kit",
                description: "Printable proposals, postcard templates, counter signage, and handwritten note scripts show owners you understand how they win business.",
              }, {
                title: "Blueprint engine",
                description: "Describe the niche, choose the tone, and instantly generate prompts, follow-up cadences, and ROI talking points tailor-made for Main Street.",
              }, {
                title: "Launch in 48 hours",
                description: "Follow the handoff checklist: wire the phone bridge, sync calendars, mail welcome packets, and review transcripts with the owner every week.",
              }].map((highlight) => (
                <div key={highlight.title} className="rounded-3xl bg-slate-800/60 p-6 shadow-lg shadow-slate-900/20">
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">{highlight.title}</p>
                  <p className="mt-3 text-sm text-slate-200">{highlight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="bg-gray-50 py-20">
          <Integrations />
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20">
          <Testimonials />
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-gray-50 py-20">
          <Pricing />
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <FAQ />
        </section>

        {/* Community */}
        <section id="community" className="bg-gray-50 py-20">
          <Community />
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Build and Launch AI Agents Today</h2>
            <Link href="/auth/signin">
              <Button size="lg" className="mt-6 bg-white text-blue-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="font-bold mb-2">buildmyagent.io</p>
              <p className="text-sm text-gray-600">
                Build and test your prompts faster, better and more consistent - saving many hours every week.
              </p>
            </div>
            <div>
              <p className="font-bold mb-2">Support</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>support@buildmyagent.io</li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-2">Legal</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-2">Partners</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><Link href="/affiliate" className="hover:underline">Become Affiliate</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

