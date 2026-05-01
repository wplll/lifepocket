import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed bg-card/80">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Inbox className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
