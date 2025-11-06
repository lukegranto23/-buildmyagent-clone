import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { handleWebhook } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = await handleWebhook(body, signature);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        // Handle successful checkout
        console.log("Checkout session completed:", event.data.object);
        break;
      case "customer.subscription.created":
        // Handle new subscription
        console.log("Subscription created:", event.data.object);
        break;
      case "customer.subscription.updated":
        // Handle subscription update
        console.log("Subscription updated:", event.data.object);
        break;
      case "customer.subscription.deleted":
        // Handle subscription cancellation
        console.log("Subscription deleted:", event.data.object);
        break;
      case "invoice.payment_succeeded":
        // Handle successful payment
        console.log("Payment succeeded:", event.data.object);
        break;
      case "invoice.payment_failed":
        // Handle failed payment
        console.log("Payment failed:", event.data.object);
        break;
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
