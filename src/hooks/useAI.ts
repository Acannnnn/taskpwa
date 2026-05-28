"use client";

import { useState, useCallback } from "react";
import { createLlmProvider } from "@/lib/llm";
import { ParsedTaskResult, ReviewParseResult } from "@/types";

const AI_PROVIDER = (process.env.NEXT_PUBLIC_AI_PROVIDER as "openai" | "deepseek" | "mock") || "mock";
const AI_API_KEY = process.env.NEXT_PUBLIC_AI_API_KEY || "";
const AI_MODEL = process.env.NEXT_PUBLIC_AI_MODEL || "deepseek-chat";

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseTasks = useCallback(async (text: string): Promise<ParsedTaskResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = createLlmProvider({
        provider: AI_PROVIDER,
        apiKey: AI_API_KEY,
        model: AI_MODEL,
      });

      const result = await provider.parseTasks(text);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 解析失败");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const parseReview = useCallback(async (
    tasks: { id: string; title: string; status: string }[],
    progressText: string
  ): Promise<ReviewParseResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const provider = createLlmProvider({
        provider: AI_PROVIDER,
        apiKey: AI_API_KEY,
        model: AI_MODEL,
      });

      const result = await provider.parseReview(tasks, progressText);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI 分析失败");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    parseTasks,
    parseReview,
    isLoading,
    error,
  };
}
