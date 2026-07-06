import { prisma } from "../../utils/prisma";

export function createPendingSummary(sessionId: string) {
  return prisma.summary.create({
    data: { sessionId, status: "pending" },
  });
}
