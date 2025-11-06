import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }

  return stripeClient;
}

export const STRIPE_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
  },
  professional: {
    id: "professional",
    name: "Professional",
    credits: 500,
    price: 99,
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    credits: 2000,
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
} as const;

export type StripePlanId = keyof typeof STRIPE_PLANS;
