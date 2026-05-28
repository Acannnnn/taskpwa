"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TaskList } from "@/components/TaskList";
import { Task } from "@/types";
import { getAllTasks, updateTask } from "@/lib/db";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { isToday, formatDate } from "@/lib/utils";

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0 });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      setTasks(allTasks);

      const total = allTasks.length;
      const completed = allTasks.filter((t: Task) => t.status === "done").length;
      setStats({ total, completed });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskClick = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    const newProgress = newStatus === "done" ? 100 : task.progressPercent;

    try {
      await updateTask(task.id, {
        status: newStatus,
        progressPercent: newProgress,
      });
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // 分组任务
  const dueToday = tasks.filter(
    (t) => t.dueDate && isToday(t.dueDate) && t.status !== "done"
  );
  const inProgress = tasks.filter(
    (t) => t.status === "in_progress" || t.status === "waiting"
  );
  const inbox = tasks.filter((t) => t.status === "inbox" || t.status === "todo");
  const completed = tasks.filter((t) => t.status === "done");

  const progressPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-500" />
              今天
            </h1>
            <span className="text-sm text-gray-500">
              {formatDate(new Date())}
            </span>
          </div>

          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">今日进度</span>
              <span className="text-sm font-medium text-primary-600">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{stats.completed} 已完成</span>
              <span>{stats.total - stats.completed} 待完成</span>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {dueToday.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  今日截止
                </h2>
                <TaskList tasks={dueToday} onTaskClick={handleTaskClick} />
              </section>
            )}

            {inProgress.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  进行中
                </h2>
                <TaskList tasks={inProgress} onTaskClick={handleTaskClick} />
              </section>
            )}

            {inbox.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  待处理
                </h2>
                <TaskList tasks={inbox} onTaskClick={handleTaskClick} />
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  已完成
                </h2>
                <TaskList tasks={completed} onTaskClick={handleTaskClick} />
              </section>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>今天还没有任务</p>
                <p className="text-sm mt-1">去记录页面添加一些吧</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
