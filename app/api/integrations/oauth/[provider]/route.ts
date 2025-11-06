import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { provider: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { provider } = params;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) {
    // Initiate OAuth flow
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/oauth/${provider}`;
    const state = `${session.user.id}:${Date.now()}`;

    let authUrl = "";

    switch (provider) {
      case "google": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
          return NextResponse.json({ error: "Google OAuth not configured" }, { status: 400 });
        }
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar")}&access_type=offline&prompt=consent&state=${state}`;
        break;
      }
      case "slack": {
        const clientId = process.env.SLACK_CLIENT_ID;
        if (!clientId) {
          return NextResponse.json({ error: "Slack OAuth not configured" }, { status: 400 });
        }
        authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=chat:write,channels:read&state=${state}`;
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  }

  // Handle OAuth callback
  try {
    let accessToken = "";
    let refreshToken = "";
    let tokenData: Record<string, unknown> = {};

    switch (provider) {
      case "google": {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new Error("Google OAuth not configured");
        }

        const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/oauth/${provider}`;
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        });

        const tokens = await tokenResponse.json();
        accessToken = tokens.access_token;
        refreshToken = tokens.refresh_token;
        tokenData = tokens;
        break;
      }
      case "slack": {
        const clientId = process.env.SLACK_CLIENT_ID;
        const clientSecret = process.env.SLACK_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          throw new Error("Slack OAuth not configured");
        }

        const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/oauth/${provider}`;
        const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
          }),
        });

        const tokens = await tokenResponse.json();
        if (!tokens.ok) {
          throw new Error(tokens.error || "Slack OAuth failed");
        }
        accessToken = tokens.access_token;
        tokenData = tokens;
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
    }

    // Store integration
    await prisma.integration.create({
      data: {
        name: `${provider} Integration`,
        type: provider,
        config: JSON.stringify({ provider }),
        credentials: JSON.stringify({
          accessToken,
          refreshToken,
          ...tokenData,
        }),
        status: "active",
      },
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?integration=${provider}&success=true`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?integration=${provider}&error=true`);
  }
}
