"use client";

import { useState } from "react";
import { Button } from "./ui/button";

const plans = [
  {
    name: "Proof of Concept",
    description: "Close your first legacy client with confidence",
    monthlyPrice: 497,
    annualPrice: 3576,
    playbooksLabel: "Includes 2 boomer-ready playbooks",
    features: [
      "Launch kit with printed sales packet + postcard templates",
      "White-glove phone bridge configuration",
      "Single-location support + owner onboarding",
      "Weekly office hours to review call transcripts",
    ],
    buttonText: "Secure first client",
  },
  {
    name: "Main Street Studio",
    description: "Productize agents for 3-5 established businesses",
    monthlyPrice: 947,
    annualPrice: 6800,
    playbooksLabel: "Includes 6 curated playbooks",
    popular: true,
    features: [
      "Everything in Proof of Concept",
      "Done-for-you review + recall sequences",
      "Branded PDF proposals + printed kiosk signage",
      "Team rollout training (owners + staff)",
      "ROI scorecard + analog follow-up tracker",
    ],
    buttonText: "Build your studio",
  },
  {
    name: "Legacy Agency",
    description: "White-label agents for every Main Street niche",
    monthlyPrice: 2497,
    annualPrice: 17800,
    playbooksLabel: "Unlimited playbooks + sales collateral",
    features: [
      "Everything in Main Street Studio",
      "Dedicated success strategist + call audits",
      "Custom marketplace listings + referral program",
      "Printed welcome boxes for client staff",
      "Co-branded webinars + lunch-and-learn kit",
    ],
    buttonText: "Scale with legacy clients",
  },
  {
    name: "White Label Partner",
    description: "Embed BuildMyAgent inside your enterprise services",
    monthlyPrice: "Custom",
    annualPrice: null,
    features: [
      "Dedicated integration squad",
      "SLAs for 24/7 monitoring",
      "Custom compliance + legal reviews",
      "Co-sell motion with BuildMyAgent leadership",
    ],
    playbooksLabel: "Tailored rollout roadmap",
    buttonText: "Book partner call",
  },
];

export function Pricing() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Button className="mb-4" variant="outline">
          Pricing
        </Button>
        <h2 className="text-4xl font-bold">Simple, transparent pricing</h2>
      </div>

      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={billingInterval === "month" ? "font-bold" : ""}>Monthly</span>
        <button
          onClick={() => setBillingInterval(billingInterval === "month" ? "year" : "month")}
          className="relative w-14 h-8 bg-blue-600 rounded-full transition-colors"
        >
          <div
            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
              billingInterval === "year" ? "translate-x-6" : ""
            }`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={billingInterval === "year" ? "font-bold" : ""}>Annually</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">-40%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`border rounded-lg p-6 ${
              plan.popular ? "border-blue-500 shadow-lg relative" : "border-gray-200"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Most Popular
              </div>
            )}
            <div className="mb-4">
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-gray-600 text-sm">{plan.description}</p>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold">
                {typeof plan.monthlyPrice === "number"
                  ? `$${billingInterval === "month" ? plan.monthlyPrice : plan.annualPrice || plan.monthlyPrice}`
                  : plan.monthlyPrice}
              </span>
              <span className="ml-2 text-gray-600">{billingInterval === "month" ? "MONTH" : "YEAR"}</span>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{plan.playbooksLabel}</span>
                <span className="text-sm font-bold">
                  {typeof plan.monthlyPrice === "number"
                    ? `$${billingInterval === "month" ? plan.monthlyPrice : plan.annualPrice || plan.monthlyPrice}`
                    : plan.monthlyPrice}
                </span>
              </div>
            </div>
            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.popular ? "default" : "outline"}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

