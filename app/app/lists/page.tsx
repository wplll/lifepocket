import { ChecklistGenerator } from "@/components/life/checklist-generator";

export default function ListsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">AI 清单</h1>
        <p className="mt-2 text-muted-foreground">
          根据购物、旅行或出门场景生成可执行清单。
        </p>
      </div>
      <ChecklistGenerator />
    </div>
  );
}
