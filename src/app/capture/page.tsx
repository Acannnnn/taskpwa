"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { TaskCard } from "@/components/TaskCard";
import { ParsedTask, Task } from "@/types";
import { useAI } from "@/hooks/useAI";
import { createTask } from "@/lib/db";
import { Sparkles, Send, X, Check, AlertCircle } from "lucide-react";

export default function CapturePage() {
  const router = useRouter();
  const { parseTasks, isLoading } = useAI();
  const [inputText, setInputText] = useState("");
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!inputText.trim()) return;

    setError(null);
    const result = await parseTasks(inputText);

    if (result) {
      setParsedTasks(result.tasks || []);
      setSelectedTasks(new Set(result.tasks.map((_: ParsedTask, i: number) => i)));
    } else {
      setError("AI 解析失败，请重试");
    }
  };

  const toggleTaskSelection = (index: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTasks(newSelected);
  };

  const handleSave = async () => {
    if (selectedTasks.size === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const tasksToSave = parsedTasks.filter((_, i) => selectedTasks.has(i));

      for (const task of tasksToSave) {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          sourceText: inputText,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await createTask(newTask);
      }

      setInputText("");
      setParsedTasks([]);
      setSelectedTasks(new Set());
      router.push("/today");
    } catch (err) {
      setError("保存失败，请重试");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setParsedTasks([]);
    setSelectedTasks(new Set());
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-500" />
            记录任务
          </h1>
          <p className="text-gray-500 mt-1">用自然语言描述你的任务，AI 会帮你整理</p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {parsedTasks.length === 0 ? (
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="例如：明天下午3点和团队开会讨论项目进度，这周要完成报告，记得买牛奶..."
              className="w-full h-40 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
            <button
              onClick={handleParse}
              disabled={!inputText.trim() || isLoading}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  AI 解析中...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  解析任务
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-gray-900">
                识别到 {parsedTasks.length} 个任务
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {parsedTasks.map((task, index) => (
                <div
                  key={index}
                  onClick={() => toggleTaskSelection(index)}
                  className={`cursor-pointer transition-opacity ${
                    selectedTasks.has(index) ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <TaskCard
                    task={{
                      ...task,
                      id: String(index),
                      sourceText: inputText,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    }}
                    showCheckbox
                    checked={selectedTasks.has(index)}
                    onCheckChange={() => toggleTaskSelection(index)}
                  />
                </div>
              ))}
            </div>

            {parsedTasks.some((t) => t.questions && t.questions.length > 0) && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-2">需要确认</h3>
                <ul className="space-y-1 text-sm text-amber-700">
                  {parsedTasks
                    .flatMap((t) => t.questions || [])
                    .map((q, i) => (
                      <li key={i}>• {q}</li>
                    ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={selectedTasks.size === 0 || isSaving}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    保存 ({selectedTasks.size})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
