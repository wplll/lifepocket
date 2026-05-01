import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoCards, typeLabels } from "@/lib/demo-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function CardDetailPage({ params }: { params: { id: string } }) {
  const card = demoCards.find((item) => item.id === params.id);

  if (!card) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link className="inline-flex items-center gap-2 text-sm text-primary" href="/app/cards">
        <ArrowLeft className="h-4 w-4" />
        返回卡片
      </Link>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl font-semibold">{card.title}</h1>
          <p className="mt-2 text-muted-foreground">{card.summary}</p>
        </div>
        <Badge>{typeLabels[card.type]}</Badge>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>结构化字段</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="金额" value={formatCurrency(card.amount, card.currency)} />
          <Field label="日期" value={formatDateTime(card.occurredAt)} />
          <Field label="提醒" value={formatDateTime(card.reminderAt)} />
          <Field label="地点" value={card.place ?? "-"} />
          <Field label="商家" value={card.merchant ?? "-"} />
          <Field label="分类" value={card.category ?? "-"} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>原始来源</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          {card.sourceText ?? `来源类型：${card.sourceKind}`}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/60 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
