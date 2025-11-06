import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createCustomerPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    const portalSession = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      `${process.env.NEXTAUTH_URL}/dashboard`
    );

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal session creation failed:", error);
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
