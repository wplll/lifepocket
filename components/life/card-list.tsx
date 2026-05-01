import Link from "next/link";
import { CalendarClock, MapPin, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/life/empty-state";
import { LifeCard, typeLabels } from "@/lib/demo-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function CardList({ cards }: { cards: LifeCard[] }) {
  if (cards.length === 0) {
    return (
      <EmptyState
        title="还没有生活卡片"
        description="上传截图、票据、账单或粘贴文本后，AI 会把关键信息整理成卡片。"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.id} href={`/app/cards/${card.id}`}>
          <Card className="h-full transition-colors hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{card.title}</CardTitle>
                <Badge>{typeLabels[card.type]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {card.summary}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {card.amount && (
                  <span className="font-semibold text-foreground">
                    {formatCurrency(card.amount, card.currency)}
                  </span>
                )}
                {card.merchant && (
                  <span className="inline-flex items-center gap-1">
                    <Store className="h-3.5 w-3.5" />
                    {card.merchant}
                  </span>
                )}
                {card.place && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {card.place}
                  </span>
                )}
                {card.reminderAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {formatDateTime(card.reminderAt)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
