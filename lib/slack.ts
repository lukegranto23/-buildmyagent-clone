export async function sendSlackMessage({
  webhookUrl,
  channel,
  text,
  blocks,
}: {
  webhookUrl: string;
  channel?: string;
  text?: string;
  blocks?: unknown[];
}) {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        text,
        blocks,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slack API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return { success: true, ts: data.ts };
  } catch (error) {
    console.error("Slack message send failed:", error);
    throw error;
  }
}

export async function sendSlackMessageWithToken({
  token,
  channel,
  text,
  blocks,
}: {
  token: string;
  channel: string;
  text?: string;
  blocks?: unknown[];
}) {
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        text,
        blocks,
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return { success: true, ts: data.ts };
  } catch (error) {
    console.error("Slack message send failed:", error);
    throw error;
  }
}
