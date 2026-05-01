"use client";

import { useMemo, useState } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
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
  const extracted = useMemo(() => extractLifeCard(text), [text]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>上传或粘贴</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 text-center transition-colors hover:border-primary">
            <ImagePlus className="mb-3 h-8 w-8 text-primary" />
            <span className="text-sm font-medium">
              {fileName || "选择截图、票据或账单照片"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              MVP 会先记录文件名，接入 Supabase Storage 后上传原图
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
          <Button type="button">
            <Sparkles className="h-4 w-4" />
            生成生活卡片
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI 识别结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
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
