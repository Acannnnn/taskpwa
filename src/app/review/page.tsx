"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ReviewResult } from "@/types";
import { useAI } from "@/hooks/useAI";
import { getAllTasks, updateTask } from "@/lib/db";
import { CheckCircle, Send, AlertCircle, Check, X } from "lucide-react";
import { getStatusLabel } from "@/lib/utils";

export default function ReviewPage() {
  const [progressText, setProgressText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [results, setResults] = useState<ReviewResult[]>([]);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [success, setSuccess] = useState(false);
  const { parseReview } = useAI();

  const handleParse = async () => {
    if (!progressText.trim()) return;

    setIsParsing(true);
    setError(null);
    setSuccess(false);

    try {
      // 获取所有未完成的任务
      const tasks = await getAllTasks();
      const activeTasks = tasks.filter(
        (t) => t.status !== "done" && t.status !== "cancelled"
      );

      if (activeTasks.length === 0) {
        setError("当前没有进行中的任务");
        setIsParsing(false);
        return;
      }

      const result = await parseReview(
        activeTasks.map((t) => ({ id: t.id, title: t.title, status: t.status })),
        progressText
      );

      if (result) {
        setResults(result.results || []);
        setSummary(result.summary || "");
        setShowConfirm(true);
      } else {
        setError("AI 分析失败，请重试");
      }
    } catch (err) {
      setError("分析过程出错");
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);

    try {
      // 应用所有变更
      for (const result of results) {
        if (result.reasoning !== "未在进展描述中提及") {
          await updateTask(result.taskId, {
            status: result.newStatus,
            progressPercent: result.newProgressPercent,
          });
        }
      }

      setSuccess(true);
      setTimeout(() => {
        setProgressText("");
        setResults([]);
        setSummary("");
        setShowConfirm(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError("应用变更失败，请重试");
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setResults([]);
    setSummary("");
  };

  const changedResults = results.filter(
    (r) => r.reasoning !== "未在进展描述中提及"
  );

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-primary-500" />
            每日回顾
          </h1>
          <p className="text-gray-500 mt-1">描述今天的进展，AI 会帮你更新任务状态</p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            任务状态已更新！
          </div>
        )}

        {!showConfirm ? (
          <div className="space-y-4">
            <textarea
              value={progressText}
              onChange={(e) => setProgressText(e.target.value)}
              placeholder="例如：今天完成了项目报告，还在等设计稿反馈，学习了一小时英语..."
              className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
            <button
              onClick={handleParse}
              disabled={!progressText.trim() || isParsing}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              {isParsing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  分析进展
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">分析结果</h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {summary && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                {summary}
              </div>
            )}

            {changedResults.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">
                  检测到的变更 ({changedResults.length})
                </h3>
                {changedResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        任务 #{result.taskId.slice(0, 8)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          result.newStatus === "done"
                            ? "bg-green-100 text-green-700"
                            : result.newStatus === "in_progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : result.newStatus === "waiting"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {getStatusLabel(result.newStatus)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      进度: {result.newProgressPercent}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {result.reasoning}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={isApplying}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
                  >
                    {isApplying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        应用中...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        确认变更
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>没有在描述中识别到任务进展</p>
                <button
                  onClick={handleCancel}
                  className="mt-4 text-primary-600 hover:text-primary-700"
                >
                  重新输入
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
