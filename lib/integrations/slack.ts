import { prisma } from "@/lib/prisma";

export async function sendSlackMessage(
  userId: string,
  channel: string,
  message: string,
  subAccountId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const connection = await prisma.integrationConnection.findFirst({
      where: {
        userId,
        subAccountId: subAccountId || null,
        integration: {
          type: "slack",
        },
        status: "active",
      },
      include: {
        integration: true,
      },
    });

    if (!connection || !connection.credentials) {
      return { success: false, error: "Slack integration not connected" };
    }

    const credentials = JSON.parse(connection.credentials);
    const webhookUrl = credentials.webhookUrl || credentials.url;

    if (!webhookUrl) {
      return { success: false, error: "Slack webhook URL not found" };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        text: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending Slack message", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
