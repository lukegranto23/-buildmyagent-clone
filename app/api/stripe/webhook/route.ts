import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (customerId && subscriptionId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && "email" in customer && customer.email) {
            const user = await prisma.user.findUnique({
              where: { email: customer.email },
            });

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  stripeCustomerId: customerId,
                  stripeSubscriptionId: subscriptionId,
                  subscription: "pro", // You can determine this from the subscription
                },
              });

              // Add credits based on subscription tier
              await addCredits(
                user.id,
                1000, // Example: 1000 credits for pro subscription
                "purchase",
                "Subscription credits",
                { subscriptionId, sessionId: session.id }
              );
            }
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscription: subscription.status === "active" ? "pro" : "free",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        if (customerId) {
          const customer = await stripe.customers.retrieve(customerId);
          if (!customer.deleted && "email" in customer && customer.email) {
            const user = await prisma.user.findUnique({
              where: { email: customer.email },
            });

            if (user) {
              // Add monthly credits for subscription renewal
              await addCredits(
                user.id,
                1000,
                "purchase",
                "Monthly subscription credits",
                { invoiceId: invoice.id }
              );
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
