export type TaskStatus = 
  | "inbox" 
  | "todo" 
  | "in_progress" 
  | "waiting" 
  | "done" 
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high";

export interface ParsedTask {
  title: string;
  description?: string;
  project?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  progressPercent: number;
  confidence: number;
  questions?: string[];
}

export interface ParsedTaskResult {
  tasks: ParsedTask[];
}

export interface Task extends ParsedTask {
  id: string;
  sourceText: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewResult {
  taskId: string;
  newStatus: TaskStatus;
  newProgressPercent: number;
  reasoning: string;
}

export interface ReviewParseResult {
  results: ReviewResult[];
  summary: string;
}
