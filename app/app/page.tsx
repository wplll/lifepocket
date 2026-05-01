import Link from "next/link";
import { ArrowRight, Inbox, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardList } from "@/components/life/card-list";
import { ExpenseDashboard } from "@/components/life/expense-dashboard";
import { ReminderList } from "@/components/life/reminder-list";
import { demoCards, demoReminders } from "@/lib/demo-data";

export default function AppHomePage() {
  const pendingCount = demoCards.filter((card) => card.reminderAt).length;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-primary">欢迎回来</p>
            <h1 className="mt-2 text-3xl font-semibold">今日生活口袋</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              这里集中展示今日事项、最近生活卡片、本周消费和待处理信息。
            </p>
          </div>
          <Link href="/app/inbox">
            <Button className="w-full sm:w-auto">
              <Inbox className="h-4 w-4" />
              添加资料
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric title="今日事项" value="2" hint="牙科复诊、房租提醒" />
        <Metric title="待处理信息" value={`${pendingCount}`} hint="建议先处理带提醒的卡片" />
        <Metric title="最近识别" value={`${demoCards.length}`} hint="来自截图和文本输入" />
      </div>

      <ExpenseDashboard cards={demoCards} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold">最近生活卡片</h2>
            <Link className="inline-flex items-center gap-1 text-sm font-semibold text-primary" href="/app/cards">
              全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <CardList cards={demoCards.slice(0, 3)} />
        </section>
        <section>
          <h2 className="mb-3 text-xl font-semibold">智能提醒</h2>
          <ReminderList reminders={demoReminders} />
          <Card className="mt-4 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                下一步
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              在上传页粘贴账单、预约或小票文字，可以立即看到结构化识别结果。手机 App 会调用你自己填写的书生模型 API。
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Metric({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
