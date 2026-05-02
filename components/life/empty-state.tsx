import Image from "next/image";
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
        <Image
          src="/images/empty-state.png"
          alt=""
          width={132}
          height={132}
          className="h-24 w-24 rounded-lg object-contain sm:h-28 sm:w-28"
        />
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
