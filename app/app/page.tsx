import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardList } from "@/components/life/card-list";
import { ExpenseDashboard } from "@/components/life/expense-dashboard";
import { ReminderList } from "@/components/life/reminder-list";
import { demoCards, demoReminders } from "@/lib/demo-data";

export default function AppHomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-semibold">今日口袋</h1>
          <p className="mt-2 text-muted-foreground">
            近期卡片、提醒和消费概览集中在这里。
          </p>
        </div>
        <Link href="/app/inbox">
          <Button>
            <Inbox className="h-4 w-4" />
            添加资料
          </Button>
        </Link>
      </div>
      <ExpenseDashboard cards={demoCards} />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">最近卡片</h2>
            <Link className="inline-flex items-center gap-1 text-sm text-primary" href="/app/cards">
              全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardList cards={demoCards.slice(0, 3)} />
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">提醒</h2>
          <ReminderList reminders={demoReminders} />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>下一步</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              连接 Supabase 后，生成的卡片会写入 Postgres，图片会上传到 Storage。
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
