import { NextResponse } from "next/server";
import { z } from "zod";

import { createCheckoutSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  agentId: z.string(),
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { agentId } = checkoutSchema.parse(data);

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { priceSetup: true, priceRetainer: true },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const session = await createCheckoutSession({
      agentId,
      priceSetup: agent.priceSetup,
      priceRetainer: agent.priceRetainer,
      successUrl: `${origin}/agents/${agentId}?payment=success`,
      cancelUrl: `${origin}/agents/${agentId}?payment=cancelled`,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to create checkout session", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
