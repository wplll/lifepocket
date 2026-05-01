# LifePocket

LifePocket 是一个 AI 日常生活整理 Web 应用。用户可以上传截图、票据、账单、预约、购物或旅行信息，也可以直接粘贴文字；系统会识别内容类型，提取结构化字段，并生成生活卡片、提醒、消费记录和清单。

## MVP 范围

- Next.js App Router + TypeScript + Tailwind CSS
- shadcn/ui 风格基础组件
- Supabase Auth / Postgres / Storage 接入预留
- Demo 数据
- AI 分类与字段抽取 mock
- Landing Page、登录页、应用总览、收集箱、卡片、提醒、消费看板、清单生成器

## 本地运行

```bash
npm install
npm run dev
```

复制 `.env.example` 为 `.env.local`，并填入 Supabase 项目配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Supabase

在 Supabase SQL Editor 执行 `supabase/schema.sql`，会创建：

- `profiles`
- `life_cards`
- `reminders`
- `checklists`
- `life-uploads` storage bucket
- 基于 `auth.uid()` 的 RLS 策略

## 后续接入点

- 将 `lib/ai.ts` 替换为真实 AI 抽取 API。
- 在 `/app/inbox` 中把文件上传到 Supabase Storage。
- 将 Demo 数据替换为 Supabase 查询。
- 登录页接入 Supabase Magic Link 或密码登录。
