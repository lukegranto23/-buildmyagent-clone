import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { provider: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const subAccountId = state ? JSON.parse(state).subAccountId : null;

    // Find integration by provider name
    const integration = await prisma.integration.findFirst({
      where: {
        type: params.provider.toLowerCase(),
        status: "active",
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Exchange code for tokens (implementation depends on provider)
    // This is a simplified example - you'd need to implement OAuth flow per provider
    let credentials: Record<string, unknown> = {};

    switch (params.provider.toLowerCase()) {
      case "gmail":
      case "google":
        // Implement Google OAuth token exchange
        // credentials = await exchangeGoogleToken(code);
        break;
      case "slack":
        // Implement Slack OAuth token exchange
        // credentials = await exchangeSlackToken(code);
        break;
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // Save connection
    const connection = await prisma.integrationConnection.upsert({
      where: {
        userId_integrationId_subAccountId: {
          userId: dbUser.id,
          integrationId: integration.id,
          subAccountId: subAccountId || "",
        },
      },
      create: {
        userId: dbUser.id,
        subAccountId: subAccountId || null,
        integrationId: integration.id,
        credentials: JSON.stringify(credentials),
        status: "active",
      },
      update: {
        credentials: JSON.stringify(credentials),
        status: "active",
        updatedAt: new Date(),
      },
    });

    // Redirect to success page
    const redirectUrl = new URL("/dashboard/integrations", request.url);
    redirectUrl.searchParams.set("connected", integration.id);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Error processing OAuth callback", error);
    return NextResponse.json({ error: "Failed to process OAuth callback" }, { status: 500 });
  }
}
