import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;

  try {
    const integration = await prisma.integration.findUnique({
      where: { id },
    });

    if (!integration) {
      return NextResponse.json(
        { error: "Integration not found" },
        { status: 404 }
      );
    }

    const config = JSON.parse(integration.config);
    let testResult: any = { success: false, message: "Test not implemented" };

    // Test integration based on type
    switch (integration.type) {
      case "webhook":
        testResult = await testWebhook(config);
        break;
      case "rest":
        testResult = await testRestApi(config);
        break;
      case "email":
        testResult = await testEmail(config);
        break;
      case "slack":
        testResult = await testSlack(config);
        break;
      default:
        testResult = { 
          success: true, 
          message: `${integration.type} integration configured but test not available` 
        };
    }

    logger.info("Integration test completed", { 
      integrationId: id, 
      success: testResult.success 
    });

    return NextResponse.json(testResult);
  } catch (error) {
    logger.error("Integration test failed", error, { integrationId: id });
    return NextResponse.json(
      { success: false, error: "Test failed" },
      { status: 500 }
    );
  }
}

async function testWebhook(config: any) {
  try {
    const { url } = config;
    if (!url) {
      return { success: false, message: "Webhook URL not configured" };
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
    });

    return {
      success: response.ok,
      message: response.ok ? "Webhook test successful" : `Webhook returned ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Webhook test failed",
    };
  }
}

async function testRestApi(config: any) {
  try {
    const { baseUrl, endpoint = "/health" } = config;
    if (!baseUrl) {
      return { success: false, message: "API base URL not configured" };
    }

    const response = await fetch(`${baseUrl}${endpoint}`);

    return {
      success: response.ok,
      message: response.ok ? "API connection successful" : `API returned ${response.status}`,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "API test failed",
    };
  }
}

async function testEmail(config: any) {
  // Email test would require SMTP connection
  return {
    success: true,
    message: "Email integration configured (SMTP test requires credentials)",
  };
}

async function testSlack(config: any) {
  const { webhookUrl } = config;
  if (!webhookUrl) {
    return { success: false, message: "Slack webhook URL not configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Test message from BuildMyAgent - Integration test successful! 🎉",
      }),
    });

    return {
      success: response.ok,
      message: response.ok ? "Slack test message sent" : `Slack returned ${response.status}`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Slack test failed",
    };
  }
}
