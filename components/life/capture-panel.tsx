"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { extractLifeCard } from "@/lib/ai";
import { typeLabels } from "@/lib/demo-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const sampleText =
  "房租账单：5月房租 4200 元，需要在 5月5日 前转给房东，记得晚上提醒我。";

export function CapturePanel() {
  const [text, setText] = useState(sampleText);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const extracted = useMemo(() => extractLifeCard(text), [text]);

  function runDemoRecognition() {
    if (!text.trim() && !fileName) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => setStatus("success"), 650);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>上传或粘贴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center transition-colors hover:border-primary hover:bg-primary/5">
            <ImagePlus className="mb-3 h-8 w-8 text-primary" />
            <span className="text-sm font-medium">
              {fileName || "选择截图、票据或账单照片"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              可用于截图、票据、小票、账单和预约信息
            </span>
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFileName(event.target.files?.[0]?.name ?? "")
              }
            />
          </label>
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="粘贴账单、预约、购物、旅行或待办文字..."
          />
          <Button type="button" onClick={runDemoRecognition} disabled={status === "loading"}>
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {status === "loading" ? "识别中..." : "生成生活卡片"}
          </Button>
          {status === "error" && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
              <TriangleAlert className="h-4 w-4" />
              请先上传图片或粘贴一段需要整理的文字。
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI 识别结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Status status={status} />
          <div>
            <p className="text-xs text-muted-foreground">分类</p>
            <p className="mt-1 font-semibold">{typeLabels[extracted.type]}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">标题</p>
            <p className="mt-1 font-semibold">{extracted.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="金额" value={formatCurrency(extracted.amount)} />
            <Field label="日期" value={formatDateTime(extracted.occurredAt)} />
            <Field label="商家" value={extracted.merchant ?? "-"} />
            <Field label="分类" value={extracted.category ?? "-"} />
          </div>
          {extracted.reminderAt && (
            <div className="rounded-md bg-accent/15 p-3 text-sm">
              建议提醒：{formatDateTime(extracted.reminderAt)}
            </div>
          )}
          <Button type="button" variant="secondary">
            保存到生活卡片
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Status({ status }: { status: "idle" | "loading" | "success" | "error" }) {
  const content = {
    idle: ["待识别", "上传图片或粘贴文本后生成结构化字段。"],
    loading: ["正在识别", "正在模拟 AI 抽取金额、日期、商家和提醒。"],
    success: ["识别完成", "结果可保存为生活卡片。"],
    error: ["需要输入", "请补充图片或文字后再识别。"]
  }[status];

  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3 text-sm">
      {status === "loading" ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <CheckCircle2 className="h-4 w-4 text-primary" />
      )}
      <div>
        <p className="font-semibold">{content[0]}</p>
        <p className="text-muted-foreground">{content[1]}</p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
