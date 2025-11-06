import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hydrateAgentRecord } from "@/lib/runtime";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const industryId = url.searchParams.get("industryId");
    const roleId = url.searchParams.get("roleId");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const agents = await prisma.agent.findMany({
      where: {
        isPublic: true,
        status: "active",
        ...(industryId && { industryId }),
        ...(roleId && { roleId }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(agents.map(hydrateAgentRecord));
  } catch (error) {
    console.error("Error fetching marketplace agents", error);
    return NextResponse.json({ error: "Failed to fetch marketplace agents" }, { status: 500 });
  }
}
