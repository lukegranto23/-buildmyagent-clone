import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const integration = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Error fetching integration", error);
    return NextResponse.json({ error: "Failed to fetch integration" }, { status: 500 });
  }
}
