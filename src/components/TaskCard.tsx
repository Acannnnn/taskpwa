"use client";

import { Task } from "@/types";
import {
  formatDate,
  getStatusLabel,
  getPriorityLabel,
  getStatusColor,
  getPriorityColor,
} from "@/lib/utils";
import { Calendar, Folder, AlertCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (checked: boolean) => void;
}

export function TaskCard({
  task,
  onClick,
  showCheckbox,
  checked,
  onCheckChange,
}: TaskCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckChange?.(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {getStatusLabel(task.status)}
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {getPriorityLabel(task.priority)}
            </span>

            {task.project && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Folder className="w-3 h-3" />
                {task.project}
              </span>
            )}

            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>

          {task.progressPercent > 0 && task.progressPercent < 100 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>进度</span>
                <span>{task.progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${task.progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {task.confidence < 0.8 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <AlertCircle className="w-3 h-3" />
              <span>AI 信心度较低，请确认信息</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
