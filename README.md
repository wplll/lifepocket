# LifePocket / 生活口袋

LifePocket / 生活口袋 是一个 AI 日常生活整理应用。用户可以上传截图、票据、小票、账单、预约信息、购物截图、旅行截图，或直接粘贴文本；系统会调用用户自己配置的书生模型 API，识别生活信息类型，提取结构化字段，并生成生活卡片、提醒、消费记录和清单。

核心定位：把截图、票据、待办、账单和生活琐事，自动整理成清单和提醒。

## 产品预览

当前仓库包含 Web Demo 和 Expo 手机 App。预览图可按 [docs/image-prompts.md](docs/image-prompts.md) 中的 Prompt 生成后放入 `public/` 或 `assets/`，再替换这里的占位图。

```text
Web Demo：Landing Page、生活看板、上传识别、生活卡片、消费看板、AI 清单、设置页
Mobile App：首页、上传、消费、清单、设置、生活卡片详情
```

## 核心功能

- 图片识别：手机端支持拍照、相册选择，并把图片发送到用户配置的模型接口识别。
- 文本识别：粘贴账单、预约、购物、旅行、待办等文本，提取结构化生活信息。
- 生活卡片：统一沉淀标题、摘要、金额、日期、地点、商家、分类、提醒等字段。
- 本地提醒：通过 `expo-notifications` 创建本地通知提醒。
- 消费统计：按本周、本月和分类汇总消费记录。
- AI 清单生成：根据购物、旅行、出门等生活场景生成可勾选清单。
- 用户自定义书生模型 API：用户在设置页填写 Endpoint、Model 和 API Token。
- 本地保存和隐私保护：手机端使用本地存储保存卡片、清单和设置，Token 使用安全存储。

## 技术栈

- Web: Next.js 14, React 18, TypeScript, Tailwind CSS, lucide-react
- Mobile: Expo, React Native, TypeScript, Expo Router
- Storage: AsyncStorage, expo-secure-store
- AI: InternLM / 书生模型兼容 Chat Completions API
- Notification: expo-notifications
- Image Picker: expo-image-picker
- Reserved Backend: Supabase Auth / Postgres / Storage schema

## 项目结构

```text
.
├── app/                         # Next.js App Router 页面
│   ├── page.tsx                 # Web Landing Page
│   └── app/                     # Web Demo 操作台
├── components/                  # Web UI 与 LifePocket 业务组件
├── lib/                         # Web mock 数据、AI mock 提取、工具函数
├── apps/mobile/                 # Expo / React Native App
│   ├── app/                     # Expo Router 页面与 Tab
│   └── src/
│       ├── components/          # Mobile UI 组件
│       ├── prompts/             # AI Prompt
│       ├── services/            # 书生模型 API 与通知服务
│       ├── storage/             # 本地卡片、清单、设置与 Token 存储
│       ├── types/               # 生活信息类型
│       └── utils/               # JSON 与日期工具
├── supabase/schema.sql          # Supabase 预留 schema
├── docs/image-prompts.md        # 可用于生成产品素材的图片 Prompt
└── README.md
```

## 快速开始

### Web 运行方式

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

构建生产版本：

```bash
npm run build
npm run start
```

可选 Supabase 配置：

```bash
cp .env.example .env.local
```

然后填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Mobile 运行方式

```bash
cd apps/mobile
npm install
npx expo start
```

然后选择：

- Expo Go 扫码打开真机预览；
- 按 `a` 打开 Android 模拟器；
- 按 `i` 打开 iOS 模拟器，需 macOS 和 Xcode；
- 按 `w` 打开 Expo Web 预览。

类型检查：

```bash
npm run typecheck
```

## API 设置说明

用户需要在 App 设置页填写：

- API Endpoint
- API Token
- Model

默认 Endpoint：

```text
https://chat.intern-ai.org.cn/api/v1/chat/completions
```

默认 Model：

```text
intern-latest
```

安全说明：

- Token 不应写入代码；
- Token 由用户自己填写；
- Token 在原生 App 中保存在 `expo-secure-store`；
- Web 预览环境使用 AsyncStorage 作为降级存储；
- 不要提交 `.env`、`.env.local` 或真实密钥；
- 日志和错误提示不要打印 Token。

## 手机端安装方案

### A. 开发者本地体验

1. 安装 Node.js。
2. 在仓库根目录执行 `npm install`。
3. 进入 `apps/mobile` 后执行 `npm install`。
4. 运行 `npx expo start`。
5. 手机安装 Expo Go，并扫描终端或浏览器中的二维码。

这种方式适合开发测试，不适合正式分发给普通用户。

### B. Android 真机安装

Expo Go 方式：

1. Android 手机安装 Expo Go。
2. 开发者运行 `cd apps/mobile && npx expo start`。
3. 手机扫码打开。

APK 方式：

1. 安装并登录 EAS CLI：`npm install -g eas-cli`、`eas login`。
2. 在 `apps/mobile` 中配置 EAS：`eas build:configure`。
3. 创建 preview APK 构建配置。
4. 执行 `eas build -p android --profile preview`。
5. 下载生成的 APK，传到 Android 手机安装。
6. Android 可能需要允许“安装未知来源应用”。

正式分发建议使用应用商店或可信渠道，不建议随意传播 APK。

### C. Android AAB 上架

1. 在 `apps/mobile` 中执行 `eas build -p android --profile production`。
2. 生成 AAB。
3. 上传到 Google Play Console。
4. 按 Google Play 要求完成签名、隐私政策、测试和审核。

### D. iPhone 安装

Expo Go 方式：

1. iPhone 安装 Expo Go。
2. 开发者运行 `cd apps/mobile && npx expo start`。
3. iPhone 扫码打开。

TestFlight 方式：

1. 需要 Apple Developer Account。
2. 在 `apps/mobile` 中配置 EAS。
3. 执行 `eas build -p ios --profile production`。
4. 上传到 App Store Connect。
5. 通过 TestFlight 邀请用户测试。

iOS 不能承诺绕过苹果签名直接安装；面向普通用户应使用 TestFlight 或 App Store。

### E. Web / PWA 体验

当前 Web Demo 是响应式网页，可以在手机浏览器打开，并通过浏览器菜单添加到主屏幕。它适合展示和轻量体验，但与原生 App 相比，在相机、通知、安全存储和离线能力上会有差异。

## 构建与发布

Web 可部署到 Vercel 或 Netlify：

```bash
npm run build
```

Mobile 使用 EAS Build：

```bash
cd apps/mobile
eas build -p android --profile preview
eas build -p android --profile production
eas build -p ios --profile production
```

发布前请检查：

- 没有提交真实 Token；
- `.env.local` 未进入 Git；
- App 设置页默认 Endpoint 和 Model 正确；
- Android/iOS 权限说明符合应用用途；
- 隐私政策说明 AI 调用会发送用户选择的图片或文本。

## 隐私与安全

- 项目不内置任何 API Token。
- 用户 Token 由用户自己填写，并保存在本地。
- 图片默认保存在本地；调用 AI 时，才会把用户选择的图片或文本发送到用户配置的模型接口。
- 不应上传敏感票据、身份证、银行卡等信息，除非用户理解模型接口和数据传输风险。
- 日志不要打印 Token。
- 不要把 `.env`、`.env.local`、真实 API Token 或个人隐私截图提交到仓库。

## Roadmap

- 多语言支持
- 家庭共享
- 更丰富的消费分析
- 离线 OCR
- 云同步
- 桌面端
- 更多模型支持
- 更完整的提醒系统
- Web 端接入真实上传、账号和数据库

## License

当前仓库未发现独立 License 文件。若项目准备开源分发，建议根据项目目标选择合适许可证；常见选择是 MIT License。
