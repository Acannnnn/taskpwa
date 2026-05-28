import { ParsedTaskResult, ReviewParseResult } from "@/types";

export interface LlmProvider {
  parseTasks(text: string): Promise<ParsedTaskResult>;
  parseReview(tasks: { id: string; title: string; status: string }[], progressText: string): Promise<ReviewParseResult>;
}

export interface LlmConfig {
  provider: "openai" | "deepseek" | "mock";
  apiKey?: string;
  model?: string;
}
