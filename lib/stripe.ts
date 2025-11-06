import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (stripeInstance) {
    return stripeInstance;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    console.warn("STRIPE_SECRET_KEY not found in environment variables. Stripe features disabled.");
    return null;
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: "2023-10-16",
  });

  return stripeInstance;
}

export async function createCheckoutSession(params: {
  priceId?: string;
  amount?: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.priceId
    ? [{ price: params.priceId, quantity: 1 }]
    : [
        {
          price_data: {
            currency: params.currency || "usd",
            unit_amount: params.amount || 0,
            product_data: {
              name: "Custom Payment",
            },
          },
          quantity: 1,
        },
      ];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata,
  });

  return session;
}

export async function createSubscription(params: {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const subscription = await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata,
  });

  return subscription;
}

export async function createCustomer(params: { email: string; name?: string; metadata?: Record<string, string> }) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });

  return customer;
}

export async function retrieveSubscription(subscriptionId: string) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();

  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.subscriptions.cancel(subscriptionId);
}
