import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, credits } = session.metadata || {};

        if (!userId || !credits) {
          console.error("Missing metadata in checkout session:", session.id);
          break;
        }

        // Find user by email (simplified - in production you'd want a proper user ID mapping)
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId },
              { email: session.customer_email },
            ],
          },
        });

        if (!user) {
          console.error("User not found for session:", session.id);
          break;
        }

        // In a real implementation, you'd have a Credits model to track this
        // For now, we'll just log it
        console.log(`Credits purchased: ${credits} for user ${user.email}`);
        
        // TODO: Create a Credit transaction record in database
        // await prisma.creditTransaction.create({
        //   data: {
        //     userId: user.id,
        //     amount: parseInt(credits),
        //     type: "purchase",
        //     stripeSessionId: session.id,
        //   },
        // });

        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
