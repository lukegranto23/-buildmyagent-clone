import { prisma } from "@/lib/prisma";

export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "usage" | "refund" | "bonus",
  description?: string,
  metadata?: Record<string, unknown>,
  subAccountId?: string
) {
  const transaction = await prisma.creditTransaction.create({
    data: {
      userId,
      subAccountId: subAccountId ?? null,
      amount,
      type,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  });

  if (subAccountId) {
    await prisma.subAccount.update({
      where: { id: subAccountId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: amount,
        },
      },
    });
  }

  return transaction;
}

export async function useCredits(
  userId: string,
  amount: number,
  description?: string,
  metadata?: Record<string, unknown>,
  subAccountId?: string
) {
  const account = subAccountId
    ? await prisma.subAccount.findUnique({ where: { id: subAccountId } })
    : await prisma.user.findUnique({ where: { id: userId } });

  if (!account) {
    throw new Error("Account not found");
  }

  const currentCredits = account.credits;
  if (currentCredits < amount) {
    throw new Error("Insufficient credits");
  }

  return await addCredits(userId, -amount, "usage", description, metadata, subAccountId);
}

export async function getCredits(userId: string, subAccountId?: string): Promise<number> {
  if (subAccountId) {
    const subAccount = await prisma.subAccount.findUnique({
      where: { id: subAccountId },
      select: { credits: true },
    });
    return subAccount?.credits ?? 0;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}
