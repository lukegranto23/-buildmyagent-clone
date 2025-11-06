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
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set, skipping signature verification");
    return NextResponse.json({ received: true });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session completed:", session.id);
        // TODO: Handle successful payment
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription ${event.type}:`, subscription.id);
        // TODO: Update user subscription status
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", invoice.id);
        // TODO: Record successful payment
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment failed:", invoice.id);
        // TODO: Handle failed payment
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 400 }
    );
  }
}
