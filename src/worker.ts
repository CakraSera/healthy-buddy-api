import "dotenv/config";
import { Worker } from "bullmq";
import { connection, SUMMARY_QUEUE_NAME } from "./utils/queue-config";
import type { SummaryJobData } from "./utils/queue";
import { generateSummary } from "./modules/summary/service";
import { prisma } from "./utils/prisma";

export const worker = new Worker<SummaryJobData>(
  SUMMARY_QUEUE_NAME,
  async (job) => {
    const { summaryId, sessionId } = job.data;
    console.log(`Processing summary ${summaryId} for session ${sessionId}`);

    try {
      const text = await generateSummary(summaryId, sessionId);
      return text;
    } catch (error) {
      console.error(`Error processing summary ${summaryId}:`, error);
      await prisma.summary
        .update({ where: { id: summaryId }, data: { status: "failed" } })
        .catch(() => {});
      throw error;
    }
  },
  { connection },
);
