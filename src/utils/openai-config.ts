import { OpenAIClient } from "@anvia/openai";
import "dotenv/config";

const openClient = new OpenAIClient({
  baseUrl: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export function getModel(model: string = "gpt-5.5") {
  return openClient.completionModel(model);
}
