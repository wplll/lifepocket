"use client";

import { useState } from "react";
import { Check, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateChecklist } from "@/lib/ai";
import { Checklist, demoChecklists } from "@/lib/demo-data";

const kinds: Array<{ value: Checklist["kind"]; label: string }> = [
  { value: "shopping", label: "购物" },
  { value: "travel", label: "旅行" },
  { value: "outing", label: "出门" }
];

export function ChecklistGenerator() {
  const [kind, setKind] = useState<Checklist["kind"]>("shopping");
  const [context, setContext] = useState("牛奶，纸巾，水果，明早送达");
  const [lists, setLists] = useState(demoChecklists);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>AI 清单生成</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {kinds.map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={kind === item.value ? "primary" : "secondary"}
                onClick={() => setKind(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="输入场景、目的地、购物需求..."
          />
          <div className="flex flex-wrap gap-2">
            {["周末露营", "搬家准备", "短途旅行"].map((example) => (
              <button
                className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                key={example}
                type="button"
                onClick={() => setContext(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={() => setLists([generateChecklist(kind, context), ...lists])}
          >
            <Sparkles className="h-4 w-4" />
            生成清单
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-primary" />
                {list.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {list.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="flex items-center gap-2 rounded-md bg-muted/60 px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
                    onClick={() => setChecked((current) => ({ ...current, [`${list.id}-${item}`]: !current[`${list.id}-${item}`] }))}
                  >
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-md border border-primary/40 bg-card">
                      {checked[`${list.id}-${item}`] && <Check className="h-3.5 w-3.5 text-primary" />}
                    </span>
                    <span className={checked[`${list.id}-${item}`] ? "text-muted-foreground line-through" : ""}>{item}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
