import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSubAccountSchema = z.object({
  name: z.string().min(1).optional(),
  credits: z.number().optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const subAccount = await prisma.subAccount.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            agents: true,
            workflows: true,
          },
        },
      },
    });

    if (!subAccount || subAccount.ownerId !== dbUser.id) {
      return NextResponse.json({ error: "Sub-account not found" }, { status: 404 });
    }

    return NextResponse.json(subAccount);
  } catch (error) {
    console.error("Error fetching sub-account", error);
    return NextResponse.json({ error: "Failed to fetch sub-account" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const subAccount = await prisma.subAccount.findUnique({
      where: { id: params.id },
    });

    if (!subAccount || subAccount.ownerId !== dbUser.id) {
      return NextResponse.json({ error: "Sub-account not found" }, { status: 404 });
    }

    const data = await request.json();
    const parsed = updateSubAccountSchema.parse(data);

    const updated = await prisma.subAccount.update({
      where: { id: params.id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", details: error.issues }, { status: 400 });
    }

    console.error("Error updating sub-account", error);
    return NextResponse.json({ error: "Failed to update sub-account" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const subAccount = await prisma.subAccount.findUnique({
      where: { id: params.id },
    });

    if (!subAccount || subAccount.ownerId !== dbUser.id) {
      return NextResponse.json({ error: "Sub-account not found" }, { status: 404 });
    }

    await prisma.subAccount.update({
      where: { id: params.id },
      data: { status: "deleted" },
    });

    return NextResponse.json({ message: "Sub-account deleted successfully" });
  } catch (error) {
    console.error("Error deleting sub-account", error);
    return NextResponse.json({ error: "Failed to delete sub-account" }, { status: 500 });
  }
}
