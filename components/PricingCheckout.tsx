"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

type Plan = {
  id: string;
  name: string;
  credits: number;
  price: number;
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 29,
    features: [
      "100 AI agent credits",
      "Basic analytics",
      "Email support",
      "1 active agent",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    credits: 500,
    price: 99,
    features: [
      "500 AI agent credits",
      "Advanced analytics",
      "Priority support",
      "5 active agents",
      "Custom integrations",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 299,
    features: [
      "2000 AI agent credits",
      "Full analytics suite",
      "24/7 dedicated support",
      "Unlimited agents",
      "Custom integrations",
      "White-label options",
    ],
  },
];

export function PricingCheckout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    setLoading(planId);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`rounded-2xl border-2 p-8 ${
            plan.id === "professional"
              ? "border-blue-500 shadow-lg"
              : "border-gray-200"
          }`}
        >
          {plan.id === "professional" && (
            <div className="mb-4 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Most Popular
            </div>
          )}
          <h3 className="text-2xl font-bold">{plan.name}</h3>
          <div className="mt-4">
            <span className="text-4xl font-bold">${plan.price}</span>
            <span className="text-gray-600">/one-time</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{plan.credits} credits</p>
          <ul className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-8 w-full"
            onClick={() => handleCheckout(plan.id)}
            disabled={loading === plan.id}
          >
            {loading === plan.id
              ? "Processing..."
              : session
              ? "Purchase Now"
              : "Sign in to Purchase"}
          </Button>
        </div>
      ))}
    </div>
  );
}
