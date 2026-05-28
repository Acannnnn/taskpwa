# TaskPWA - 智能任务管理（纯前端版）

一个 AI 驱动的个人任务管理 PWA 应用，数据完全存储在本地 IndexedDB，支持离线使用。

## 技术栈

- **框架**: Next.js 14 + TypeScript（静态导出）
- **样式**: Tailwind CSS
- **数据存储**: IndexedDB（idb 库）
- **AI**: DeepSeek / OpenAI / Mock（仅用于解析任务）
- **PWA**: next-pwa

## 核心特性

- ✅ **纯前端应用** - 无需后端服务器
- ✅ **本地数据存储** - IndexedDB，数据完全属于你自己
- ✅ **AI 任务解析** - DeepSeek 只负责拆任务，不存储任何数据
- ✅ **无需登录** - 打开即用
- ✅ **PWA 支持** - 可添加到主屏幕，离线使用
- ✅ **完全免费部署** - Vercel 免费托管

## 功能

1. **自然语言录入** (`/capture`)
   - 输入任意文本描述
   - AI 自动解析成结构化任务
   - 支持批量确认和保存

2. **今日任务** (`/today`)
   - 显示今日截止和进行中的任务
   - 一键标记完成
   - 进度统计

3. **项目分组** (`/projects`)
   - 按项目查看任务
   - 支持创建新项目
   - 项目完成度统计

4. **每日回顾** (`/review`)
   - 描述今日进展
   - AI 自动判断任务状态
   - 批量更新进度

## 快速开始

### 1. 安装依赖

```bash
cd taskpwa
npm install
```

### 2. 配置 AI（可选）

编辑 `.env` 文件：

```env
# 使用 Mock（无需 API Key，适合测试）
NEXT_PUBLIC_AI_PROVIDER=mock

# 或使用 DeepSeek（推荐）
NEXT_PUBLIC_AI_PROVIDER=deepseek
NEXT_PUBLIC_AI_API_KEY=your-deepseek-api-key
NEXT_PUBLIC_AI_MODEL=deepseek-chat
```

获取 DeepSeek API Key：https://platform.deepseek.com

### 3. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 构建

```bash
npm run build
```

静态文件输出到 `dist/` 目录

## 部署到 Vercel

### 方式一：Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

### 方式二：GitHub + Vercel

1. 将代码推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入项目
3. 配置环境变量（同上）
4. 自动部署

### 方式三：Vercel 静态导出

```bash
# 构建
npm run build

# 进入 dist 目录
cd dist

# 用 vercel 部署
vercel --prod
```

## 项目结构

```
taskpwa/
├── src/
│   ├── app/               # Next.js 页面
│   │   ├── capture/       # 任务录入
│   │   ├── today/         # 今日任务
│   │   ├── projects/      # 项目分组
│   │   ├── review/        # 每日回顾
│   │   └── layout.tsx     # 根布局
│   ├── components/        # 共享组件
│   ├── hooks/
│   │   └── useAI.ts       # AI 调用 Hook
│   ├── lib/
│   │   ├── db.ts          # IndexedDB 封装
│   │   └── llm/           # AI Provider
│   └── types/             # TypeScript 类型
├── public/
│   └── manifest.json      # PWA 配置
├── next.config.mjs        # Next.js 配置（静态导出）
└── package.json
```

## 数据存储说明

所有数据存储在浏览器 IndexedDB 中：

- **Tasks**: 任务数据（标题、状态、优先级、截止日期等）
- **Projects**: 项目列表

数据不会上传到任何服务器，完全本地保存。

**注意事项**:
- 清除浏览器数据会丢失所有任务
- 不同浏览器/设备间数据不互通
- 如需备份，可导出数据（后续版本支持）

## AI 配置

### Mock 模式（默认）
无需配置，适合开发和测试

### DeepSeek 模式
1. 注册 https://platform.deepseek.com
2. 创建 API Key
3. 配置到 `.env`
4. 重新部署

### OpenAI 模式
```env
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_API_KEY=sk-...
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini
```

## 添加到主屏幕

### iPhone (Safari)
1. 访问部署后的网址
2. 点击底部「分享」按钮
3. 选择「添加到主屏幕」

### Android (Chrome)
1. 访问部署后的网址
2. 点击右上角菜单
3. 选择「添加到主屏幕」或「安装应用」

## License

MIT
