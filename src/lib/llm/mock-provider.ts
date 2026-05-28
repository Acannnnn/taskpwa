import { LlmProvider } from "./types";
import { ParsedTaskResult, ReviewParseResult, TaskStatus } from "@/types";

export class MockProvider implements LlmProvider {
  async parseTasks(text: string): Promise<ParsedTaskResult> {
    // 模拟解析延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 根据文本内容生成模拟任务
    const lowerText = text.toLowerCase();
    const tasks: ParsedTaskResult["tasks"] = [];

    // 检测项目关键词
    let project: string | undefined;
    if (lowerText.includes("工作") || lowerText.includes("项目") || lowerText.includes("会议")) {
      project = "工作";
    } else if (lowerText.includes("学习") || lowerText.includes("课程") || lowerText.includes("书")) {
      project = "学习";
    } else if (lowerText.includes("健康") || lowerText.includes("运动") || lowerText.includes("健身")) {
      project = "健康";
    } else if (lowerText.includes("个人") || lowerText.includes("家里") || lowerText.includes("生活")) {
      project = "个人";
    }

    // 检测优先级
    let priority: "low" | "medium" | "high" = "medium";
    if (lowerText.includes("紧急") || lowerText.includes("重要") || lowerText.includes("必须")) {
      priority = "high";
    } else if (lowerText.includes("稍后") || lowerText.includes("有空") || lowerText.includes("随便")) {
      priority = "low";
    }

    // 检测截止日期
    let dueDate: string | undefined;
    const today = new Date();
    if (lowerText.includes("今天")) {
      dueDate = today.toISOString().split("T")[0];
    } else if (lowerText.includes("明天")) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split("T")[0];
    } else if (lowerText.includes("下周")) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      dueDate = nextWeek.toISOString().split("T")[0];
    }

    // 提取任务标题（简单实现）
    const sentences = text.split(/[。！？\n]/).filter((s) => s.trim().length > 0);
    
    for (const sentence of sentences.slice(0, 3)) {
      const trimmed = sentence.trim();
      if (trimmed.length < 3) continue;

      // 检测动作词
      const actionWords = ["完成", "做", "写", "准备", "学习", "阅读", "购买", "整理", "开会", "提交"];
      const hasAction = actionWords.some((word) => trimmed.includes(word));

      if (hasAction || sentences.length === 1) {
        tasks.push({
          title: trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : ""),
          description: trimmed.length > 50 ? trimmed : undefined,
          project,
          dueDate,
          priority,
          status: "inbox",
          progressPercent: 0,
          confidence: 0.8,
          questions: priority === "high" ? ["这个任务有具体的截止时间吗？"] : undefined,
        });
      }
    }

    // 如果没有提取到任务，创建一个通用任务
    if (tasks.length === 0) {
      tasks.push({
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        description: text,
        project,
        dueDate,
        priority,
        status: "inbox",
        progressPercent: 0,
        confidence: 0.6,
        questions: ["能更具体地描述这个任务吗？"],
      });
    }

    return { tasks };
  }

  async parseReview(
    tasks: { id: string; title: string; status: string }[],
    progressText: string
  ): Promise<ReviewParseResult> {
    // 模拟解析延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lowerProgress = progressText.toLowerCase();
    const results: ReviewParseResult["results"] = [];

    for (const task of tasks) {
      const lowerTitle = task.title.toLowerCase();
      let newStatus: TaskStatus = task.status as TaskStatus;
      let newProgressPercent = 0;
      let reasoning = "未在进展描述中提及";

      // 检测任务是否被提及
      if (lowerProgress.includes(lowerTitle) || 
          task.title.split("").some((char) => lowerProgress.includes(char) && char.length > 1)) {
        
        if (lowerProgress.includes("完成") || lowerProgress.includes("做完") || lowerProgress.includes("搞定")) {
          newStatus = "done";
          newProgressPercent = 100;
          reasoning = "用户明确提到已完成";
        } else if (lowerProgress.includes("进行中") || lowerProgress.includes("正在") || lowerProgress.includes("一半")) {
          newStatus = "in_progress";
          newProgressPercent = 50;
          reasoning = "用户提到正在进行中";
        } else if (lowerProgress.includes("等待") || lowerProgress.includes("等") || lowerProgress.includes("别人")) {
          newStatus = "waiting";
          newProgressPercent = task.status === "in_progress" ? 50 : 0;
          reasoning = "用户提到需要等待他人或外部因素";
        } else {
          newStatus = "in_progress";
          newProgressPercent = 25;
          reasoning = "用户提及此任务，推测已开始";
        }
      }

      results.push({
        taskId: task.id,
        newStatus,
        newProgressPercent,
        reasoning,
      });
    }

    return {
      results,
      summary: `分析了 ${tasks.length} 个任务，根据你的描述更新了 ${results.filter((r) => r.reasoning !== "未在进展描述中提及").length} 个任务的状态。`,
    };
  }
}
