import { z } from "@hono/zod-openapi";

export const ChatRequestSchema = z.object({
  sessionId: z.string().min(1).openapi({ example: "abc-123" }),
  message: z
    .string()
    .min(1)
    .openapi({ example: "I feel tired all day, what can I do?" }),
});
