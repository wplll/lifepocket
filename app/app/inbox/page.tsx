import { CapturePanel } from "@/components/life/capture-panel";

export default function InboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">收集箱</h1>
        <p className="mt-2 text-muted-foreground">
          上传截图或粘贴文字，LifePocket 会生成结构化生活卡片。
        </p>
      </div>
      <CapturePanel />
    </div>
  );
}
