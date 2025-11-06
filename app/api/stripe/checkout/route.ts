import { NextResponse } from "next/server";
import { z } from "zod";

import { createCheckoutSession } from "@/lib/stripe";

const checkoutSchema = z.object({
  priceId: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().default("usd"),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const session = await createCheckoutSession(data);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.issues }, { status: 400 });
    }

    console.error("Failed to create checkout session", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
