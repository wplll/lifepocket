import { CardList } from "@/components/life/card-list";
import { Badge } from "@/components/ui/badge";
import { demoCards, typeLabels } from "@/lib/demo-data";

export default function CardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">生活卡片</h1>
        <p className="mt-2 text-muted-foreground">
          所有账单、消费、预约、旅行、保修和待办都会沉淀成卡片。
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.values(typeLabels).map((label) => (
          <Badge key={label}>{label}</Badge>
        ))}
      </div>
      <CardList cards={demoCards} />
    </div>
  );
}
