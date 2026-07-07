import { Queue } from "bullmq";
import { connection, SUMMARY_QUEUE_NAME } from "./queue-config";

export const summaryQueue = new Queue(SUMMARY_QUEUE_NAME, { connection });

export interface SummaryJobData {
  summaryId: string;
  sessionId: string;
}
