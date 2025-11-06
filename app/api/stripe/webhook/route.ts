import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = subscription.customer as string;

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              plan: subscription.items.data[0]?.price.nickname ?? "pro",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscription.id,
              status: subscription.status,
              plan: subscription.items.data[0]?.price.nickname ?? "pro",
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const existingSubscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: {
              status: subscription.status,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const subscription = await prisma.subscription.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (subscription) {
          // Add credits based on plan
          const creditAmount = subscription.plan === "pro" ? 10000 : subscription.plan === "starter" ? 5000 : 0;

          if (creditAmount > 0) {
            await prisma.creditTransaction.create({
              data: {
                userId: subscription.userId,
                amount: creditAmount,
                type: "purchase",
                description: `Monthly subscription credits - ${subscription.plan}`,
                metadata: JSON.stringify({ invoiceId: invoice.id }),
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
