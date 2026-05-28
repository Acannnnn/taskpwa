# TaskPWA - 智能任务管理

AI 驱动的个人任务管理 PWA 应用，数据完全存储在本地 IndexedDB，支持离线使用。

## 技术栈

- **框架**: Next.js 14 + TypeScript（SSR 模式）
- **样式**: Tailwind CSS
- **数据存储**: IndexedDB（idb 库）
- **AI**: DeepSeek（服务端 API Route，API Key 不暴露到前端）
- **PWA**: next-pwa
- **部署**: 腾讯云 EdgeOne Pages

## 核心特性

- ✅ **纯前端数据存储** - IndexedDB，数据完全属于你自己
- ✅ **AI 任务拆解** - DeepSeek 只负责拆任务，API Key 存储在服务端
- ✅ **主备模型** - Primary 失败自动切换 Fallback
- ✅ **无需登录** - 打开即用
- ✅ **PWA 支持** - 可添加到主屏幕，离线使用
- ✅ **无云数据库** - 不依赖 Supabase 等外部服务

## 功能

1. **记录** (`/capture`) - 自然语言输入，AI 解析成结构化任务
2. **今天** (`/today`) - 查看今日任务、进度统计、一键完成
3. **项目** (`/projects`) - 按项目分组管理、创建新项目
4. **回顾** (`/review`) - 描述今日进展，AI 更新任务状态

## 快速开始

### 1. 安装依赖

```bash
cd taskpwa
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL_PRIMARY=deepseek-v4-flash
DEEPSEEK_MODEL_FALLBACK=deepseek-v4-pro
```

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到腾讯云 EdgeOne Pages

### 方式一：Git 仓库导入（推荐）

1. 登录 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages)
2. 点击 **创建项目** > **导入 Git 仓库**
3. 选择 `Acannnnn/taskpwa` 仓库和 `main` 分支
4. 平台会自动检测 Next.js 框架，自动填充：
   - **构建命令**: `npm run build`
   - **输出目录**: `.next`
5. **配置环境变量**（在项目设置中添加）：

   | 变量名 | 值 |
   |--------|-----|
   | `DEEPSEEK_API_KEY` | `sk-your-key-here` |
   | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` |
   | `DEEPSEEK_MODEL_PRIMARY` | `deepseek-v4-flash` |
   | `DEEPSEEK_MODEL_FALLBACK` | `deepseek-v4-pro` |

6. 点击 **开始部署**，等待 1-3 分钟完成

之后每次 `git push` 到 `main` 分支都会自动重新部署。

### 方式二：EdgeOne CLI 部署

```bash
# 安装 CLI
npm install -g edgeone

# 登录
edgeone login

# 部署
edgeone pages deploy
```

### 方式三：从 Vercel 迁移

参考腾讯云官方文档：[从 Vercel 迁移至 EdgeOne Pages](https://cloud.tencent.com/document/product/1552/127454)

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DEEPSEEK_API_KEY` | ✅ | DeepSeek API Key |
| `DEEPSEEK_BASE_URL` | ❌ | API 地址，默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL_PRIMARY` | ❌ | 主模型，默认 `deepseek-v4-flash` |
| `DEEPSEEK_MODEL_FALLBACK` | ❌ | 备用模型，默认 `deepseek-v4-pro` |

## 项目结构

```
taskpwa/
├── src/
│   ├── app/
│   │   ├── api/ai/decompose/  # 服务端 AI 路由（隐藏 API Key）
│   │   ├── capture/           # 记录任务页面
│   │   ├── today/             # 今日任务页面
│   │   ├── projects/          # 项目页面
│   │   ├── review/            # 每日回顾页面
│   │   └── layout.tsx         # 根布局
│   ├── components/            # 共享组件
│   ├── hooks/useAI.ts         # AI 调用 Hook（调用服务端 API）
│   ├── lib/
│   │   ├── db.ts              # IndexedDB 封装
│   │   └── llm/               # LLM Provider（仅服务端使用）
│   └── types/                 # TypeScript 类型
├── public/manifest.json       # PWA 配置
├── .env.example               # 环境变量模板
├── next.config.mjs            # Next.js 配置
└── package.json
```

## API 路由

### POST /api/ai/decompose

**拆解任务模式**（默认）：
```json
{
  "text": "明天下午3点开会，这周要完成报告"
}
```

**每日回顾模式**：
```json
{
  "text": "今天完成了报告，还在等设计稿",
  "tasks": [
    { "id": "xxx", "title": "完成报告", "status": "in_progress" }
  ],
  "mode": "review"
}
```

## 安全说明

- API Key 仅存储在服务端环境变量中，不会暴露到前端
- 前端通过 `/api/ai/decompose` 服务端路由间接调用 DeepSeek
- 所有任务数据存储在浏览器 IndexedDB 中，不上传到任何服务器
