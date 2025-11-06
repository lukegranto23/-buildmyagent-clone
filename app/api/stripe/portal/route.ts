import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Please add STRIPE_SECRET_KEY to your .env file." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { customerId, returnUrl } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create portal session" },
      { status: 500 }
    );
  }
}
