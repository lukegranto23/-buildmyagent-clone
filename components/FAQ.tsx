"use client";

import { useState } from "react";
import { Button } from "./ui/button";

const faqs = [
  {
    question: "Who is BuildMyAgent designed for?",
    answer: "We built this for automation agencies packaging AI for legacy, phone-first businesses – dentists, HVAC, senior care, financial advisors, real estate teams, and more.",
  },
  {
    question: "Do I need to be technical to launch these agents?",
    answer: "No. Every playbook includes the AI configuration, printed collateral, onboarding checklist, and call scripts. You focus on relationships while the platform handles the tech.",
  },
  {
    question: "How do the analog assets get delivered?",
    answer: "Each playbook comes with printable PDFs (postcards, counter signs, fridge magnets) plus editable files. We also provide templates for letter shops and local print vendors.",
  },
  {
    question: "What about compliance and escalation?",
    answer: "Prompts include escalation triggers for pricing exceptions, legal questions, emotional callers, and compliance-sensitive topics. You can add custom rules per client.",
  },
  {
    question: "How quickly can I onboard a new client?",
    answer: "Most agencies close a deal in under a week and launch within 48 hours. The builder stores all scripts, integrations, and mailed assets so you can rinse and repeat.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Button className="mb-4" variant="outline">
          FAQ
        </Button>
        <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-gray-600 text-lg">Everything you need to know about Buildmyagent</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 rounded-lg"
            >
              <h3 className="font-semibold text-lg">{faq.question}</h3>
              <svg
                className={`w-6 h-6 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

