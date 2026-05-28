import OpenAI from "openai";
import { LlmProvider } from "./types";
import { ParsedTaskResult, ReviewParseResult } from "@/types";
import { TASK_PARSE_PROMPT, REVIEW_PARSE_PROMPT } from "./prompts";

export class DeepSeekProvider implements LlmProvider {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "deepseek-chat") {
    this.client = new OpenAI({
      apiKey,
      baseURL: "https://api.deepseek.com",
    });
    this.model = model;
  }

  async parseTasks(text: string): Promise<ParsedTaskResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: TASK_PARSE_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from DeepSeek");
    }

    return JSON.parse(content) as ParsedTaskResult;
  }

  async parseReview(
    tasks: { id: string; title: string; status: string }[],
    progressText: string
  ): Promise<ReviewParseResult> {
    const tasksContext = tasks
      .map((t) => `- ${t.id}: "${t.title}" (当前状态: ${t.status})`)
      .join("\n");

    const userMessage = `当前任务列表：\n${tasksContext}\n\n用户描述的今日进展：\n${progressText}`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: REVIEW_PARSE_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from DeepSeek");
    }

    return JSON.parse(content) as ReviewParseResult;
  }
}
