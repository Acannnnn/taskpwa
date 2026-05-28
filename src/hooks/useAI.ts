"use client";

import { useState, useCallback } from "react";
import { ParsedTaskResult, ReviewParseResult } from "@/types";

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseTasks = useCallback(async (text: string): Promise<ParsedTaskResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "AI 解析失败");
      }

      return await response.json();
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
      const response = await fetch("/api/ai/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: progressText, tasks, mode: "review" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "AI 分析失败");
      }

      return await response.json();
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
