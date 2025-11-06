import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

// Pricing tiers (in cents)
export const PRICING_PLANS = {
  starter: {
    name: "Starter",
    price: 29900, // $299/month
    credits: 10000,
    description: "Perfect for getting started with AI agents",
    features: [
      "10,000 AI credits per month",
      "Up to 5 active agents",
      "Basic integrations",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    price: 79900, // $799/month
    credits: 30000,
    description: "For growing businesses",
    features: [
      "30,000 AI credits per month",
      "Up to 20 active agents",
      "All integrations",
      "Priority support",
      "Custom workflows",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: 199900, // $1,999/month
    credits: 100000,
    description: "For large organizations",
    features: [
      "100,000 AI credits per month",
      "Unlimited active agents",
      "All integrations + custom",
      "24/7 dedicated support",
      "Custom workflows & training",
      "SLA guarantee",
    ],
  },
} as const;

export type PricingPlan = keyof typeof PRICING_PLANS;

export function formatPrice(amountInCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}
