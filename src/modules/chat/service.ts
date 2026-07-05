import { createCompletionStream, Message } from "@anvia/core";
import { getModel } from "../../utils/openai-config";
import { prisma } from "../../utils/prisma";
import type { Role } from "../../generated/prisma/client";

const COACH_PERSONA = `You are HealthBuddy, a warm, encouraging health coach for busy working professionals starting their health journey.

Rules:
- Keep replies short (2-4 sentences) and actionable.
- Only discuss sleep, basic nutrition, gentle movement, and stress.
- Never diagnose. Suggest seeing a doctor for anything medical or serious.`;

async function saveMessage(sessionId: string, messages: Message[]) {
  const finalMessages = messages.map((message) => ({
    sessionId,
    role: message.role as Role,
    content: message.content[0].type === "text" ? message.content[0].text : "",
  }));

  await prisma.message.createMany({
    data: finalMessages,
    skipDuplicates: true,
  });
}

async function getHistory(sessionId: string, limit = 10) {
  const rows = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.reverse(); // oldest first
}

export async function getResponseAIChat(
  sessionId: string,
  userMessage: string,
) {
  const history = await getHistory(sessionId);
  console.log({ history });
  const messages = history.map((msg) =>
    msg.role === "user"
      ? Message.user(msg.content)
      : Message.assistant(msg.content),
  );

  const stream = createCompletionStream(getModel(), {
    instructions: COACH_PERSONA,
    input: userMessage,
    messages,
  });

  let assistantResponse = "";
  console.log("\nAssistant:");
  for await (const chunk of stream) {
    if (chunk.type === "text_delta") {
      process.stdout.write(chunk.delta);
      assistantResponse += chunk.delta;
    }
  }
  await saveMessage(sessionId, [
    Message.user(userMessage),
    Message.assistant(assistantResponse),
  ]);
  return assistantResponse;
}
