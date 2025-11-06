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
    const subAccountId = url.searchParams.get("subAccountId");

    // Find integration
    const integration = await prisma.integration.findFirst({
      where: {
        type: params.provider.toLowerCase(),
        status: "active",
      },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Build OAuth authorization URL
    const config = JSON.parse(integration.config);
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/oauth/${params.provider}`;
    const state = JSON.stringify({ userId: dbUser.id, subAccountId });

    let authUrl = "";

    switch (params.provider.toLowerCase()) {
      case "gmail":
      case "google":
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: config.clientId || process.env.GOOGLE_CLIENT_ID || "",
          redirect_uri: redirectUri,
          response_type: "code",
          scope: config.scope || "https://www.googleapis.com/auth/gmail.send",
          access_type: "offline",
          prompt: "consent",
          state,
        }).toString()}`;
        break;
      case "slack":
        authUrl = `https://slack.com/oauth/v2/authorize?${new URLSearchParams({
          client_id: config.clientId || "",
          redirect_uri: redirectUri,
          scope: config.scope || "chat:write,channels:read",
          state,
        }).toString()}`;
        break;
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating OAuth URL", error);
    return NextResponse.json({ error: "Failed to generate OAuth URL" }, { status: 500 });
  }
}
