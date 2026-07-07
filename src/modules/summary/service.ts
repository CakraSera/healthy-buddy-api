import { createCompletion } from "@anvia/core";
import type { Message } from "../../../generated/prisma/client";
import { getModel } from "../../utils/openai-config";
import { prisma } from "../../utils/prisma";

export function createPendingSummary(sessionId: string) {
  return prisma.summary.create({
    data: { sessionId, status: "pending" },
  });
}

export function getSummary(id: string) {
  return prisma.summary.findUnique({ where: { id } });
}

function setStatus(id: string, status: string, content?: string) {
  console.log({ content });
  return prisma.summary.update({
    where: { id },
    data: { status, ...(content !== undefined ? { content } : {}) },
  });
}

const SUMMARY_PROMPT = `You are HealthBuddy. Read this user's conversation history and write a short, warm weekly reflection (4-6 sentences).

Include:
- One thing they're doing well
- One gentle suggestion for next week
- An encouraging closing line

Keep it personal and specific to what they actually discussed.`;

export async function generateSummary(summaryId: string, sessionId: string) {
  await setStatus(summaryId, "processing");

  const messages: Message[] = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
  });

  const transcript = messages.length
    ? messages.map((m) => `${m.role}: ${m.content}`).join("\n")
    : "(no conversation yet)";

  console.log({ transcript });

  const response = await createCompletion(getModel(), {
    instructions: SUMMARY_PROMPT,
    input: transcript,
  });

  console.log({ result: response.text });

  // await setStatus(summaryId, "done", transcript);
  const text = response.text.trim();
  await setStatus(summaryId, "done", text);
  return text;
}
