import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TASK_PARSE_PROMPT, REVIEW_PARSE_PROMPT } from "@/lib/llm/prompts";

type MessageParam = OpenAI.Chat.ChatCompletionMessageParam;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
const DEEPSEEK_MODEL_PRIMARY = process.env.DEEPSEEK_MODEL_PRIMARY || "deepseek-v4-flash";
const DEEPSEEK_MODEL_FALLBACK = process.env.DEEPSEEK_MODEL_FALLBACK || "deepseek-v4-pro";

function createClient() {
  return new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });
}

async function callDeepSeek(
  messages: MessageParam[],
  model: string
) {
  const client = createClient();
  const response = await client.chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from DeepSeek");
  }

  return JSON.parse(content);
}

async function callWithFallback(
  messages: MessageParam[]
) {
  try {
    return await callDeepSeek(messages, DEEPSEEK_MODEL_PRIMARY);
  } catch (error) {
    console.error(`Primary model (${DEEPSEEK_MODEL_PRIMARY}) failed, trying fallback (${DEEPSEEK_MODEL_FALLBACK}):`, error);
    return await callDeepSeek(messages, DEEPSEEK_MODEL_FALLBACK);
  }
}

// POST /api/ai/decompose - 拆解任务
export async function POST(request: NextRequest) {
  try {
    const { text, tasks, mode } = await request.json();

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "DEEPSEEK_API_KEY is not configured" },
        { status: 500 }
      );
    }

    if (mode === "review") {
      // 每日回顾模式
      if (!tasks || !Array.isArray(tasks)) {
        return NextResponse.json(
          { error: "tasks array is required for review mode" },
          { status: 400 }
        );
      }

      const tasksContext = tasks
        .map((t: { id: string; title: string; status: string }) =>
          `- ${t.id}: "${t.title}" (当前状态: ${t.status})`
        )
        .join("\n");

      const messages: MessageParam[] = [
        { role: "system" as const, content: REVIEW_PARSE_PROMPT },
        {
          role: "user" as const,
          content: `当前任务列表：\n${tasksContext}\n\n用户描述的今日进展：\n${text}`,
        },
      ];

      const result = await callWithFallback(messages);
      return NextResponse.json(result);
    }

    // 默认：拆解任务模式
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const messages: MessageParam[] = [
      { role: "system" as const, content: TASK_PARSE_PROMPT },
      { role: "user" as const, content: text },
    ];

    const result = await callWithFallback(messages);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/ai/decompose:", error);
    return NextResponse.json(
      { error: "AI service failed" },
      { status: 500 }
    );
  }
}
