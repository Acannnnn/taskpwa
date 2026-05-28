"use client";

import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TaskList } from "@/components/TaskList";
import { Task } from "@/types";
import { getAllTasks, getAllProjects, createProject, updateTask } from "@/lib/db";
import { FolderOpen, Plus, Loader2, X, Check } from "lucide-react";

interface ProjectGroup {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

export default function ProjectsPage() {
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projects, tasks] = await Promise.all([
        getAllProjects(),
        getAllTasks(),
      ]);

      // 按项目分组
      const groups: Record<string, ProjectGroup> = {};

      // 初始化项目分组
      projects.forEach((p) => {
        groups[p.name] = {
          id: p.id,
          name: p.name,
          color: p.color,
          tasks: [],
        };
      });

      // 添加"未分类"
      groups["未分类"] = {
        id: "uncategorized",
        name: "未分类",
        color: "#9ca3af",
        tasks: [],
      };

      // 分配任务
      tasks.forEach((task: Task) => {
        const projectName = task.project || "未分类";
        if (!groups[projectName]) {
          groups[projectName] = {
            id: `temp-${projectName}`,
            name: projectName,
            color: "#9ca3af",
            tasks: [],
          };
        }
        groups[projectName].tasks.push(task);
      });

      // 转换为数组并排序
      const sortedGroups = Object.values(groups).sort((a, b) => {
        if (a.name === "未分类") return 1;
        if (b.name === "未分类") return -1;
        return b.tasks.length - a.tasks.length;
      });

      setProjectGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;

    setIsAdding(true);
    try {
      await createProject({
        id: crypto.randomUUID(),
        name: newProjectName,
        color: "#3b82f6",
      });

      setNewProjectName("");
      setShowAddProject(false);
      fetchData();
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setIsAdding(false);
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
      fetchData();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <main className="min-h-screen pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-primary-500" />
              项目
            </h1>
            <button
              onClick={() => setShowAddProject(true)}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        {showAddProject && (
          <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="项目名称"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
              <button
                onClick={() => setShowAddProject(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddProject}
                disabled={!newProjectName.trim() || isAdding}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {projectGroups.map((group) => (
              <section key={group.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h2 className="font-medium text-gray-900">{group.name}</h2>
                    <span className="text-sm text-gray-500">
                      ({group.tasks.length})
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {group.tasks.filter((t) => t.status === "done").length} /
                    {group.tasks.length} 完成
                  </span>
                </div>

                {group.tasks.length > 0 ? (
                  <TaskList tasks={group.tasks} onTaskClick={handleTaskClick} />
                ) : (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    暂无任务
                  </p>
                )}
              </section>
            ))}

            {projectGroups.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>还没有项目</p>
                <p className="text-sm mt-1">点击右上角添加</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
