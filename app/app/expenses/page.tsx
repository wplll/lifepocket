import { CardList } from "@/components/life/card-list";
import { ExpenseDashboard } from "@/components/life/expense-dashboard";
import { demoCards } from "@/lib/demo-data";

export default function ExpensesPage() {
  const expenseCards = demoCards.filter((card) => card.amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">消费看板</h1>
        <p className="mt-2 text-muted-foreground">
          从消费、账单、旅行等卡片汇总金额和分类。
        </p>
      </div>
      <ExpenseDashboard cards={demoCards} />
      <CardList cards={expenseCards} />
    </div>
  );
}
