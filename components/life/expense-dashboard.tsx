import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeCard } from "@/lib/demo-data";
import { formatCurrency } from "@/lib/utils";

export function ExpenseDashboard({ cards }: { cards: LifeCard[] }) {
  const expenseCards = cards.filter((card) => card.amount);
  const total = expenseCards.reduce((sum, card) => sum + (card.amount ?? 0), 0);
  const categories = expenseCards.reduce<Record<string, number>>((acc, card) => {
    const key = card.category ?? "其他";
    acc[key] = (acc[key] ?? 0) + (card.amount ?? 0);
    return acc;
  }, {});

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
      <Card>
        <CardHeader>
          <CardTitle>本月消费</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-semibold">{formatCurrency(total)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            来自 {expenseCards.length} 条生活卡片
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>分类分布</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(categories).map(([category, amount]) => (
            <div key={category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{category}</span>
                <span>{formatCurrency(amount)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max((amount / total) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
