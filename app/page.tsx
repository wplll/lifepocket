import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Camera,
  ListChecks,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  { icon: Camera, title: "截图进口袋", text: "票据、账单、预约、购物截图都能统一收进 LifePocket。" },
  { icon: Sparkles, title: "AI 自动整理", text: "自动分类并提取标题、金额、日期、地点、商家和提醒时间。" },
  { icon: Bell, title: "提醒不断档", text: "账单、预约、保修和待办会转成可追踪提醒。" },
  { icon: BarChart3, title: "消费有脉络", text: "从生活卡片自动汇总消费总额和分类分布。" },
  { icon: ListChecks, title: "清单随手生成", text: "购物、旅行、出门场景都能按上下文生成清单。" }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1800&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold text-primary">AI 生活口袋</p>
            <h1 className="text-5xl font-semibold leading-tight tracking-normal text-foreground sm:text-6xl">
              LifePocket
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              上传截图、票据、账单、预约或旅行信息，AI 自动识别内容并整理成生活卡片、提醒、消费记录和清单。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app">
                <Button>
                  进入 Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">登录</Button>
              </Link>
            </div>
          </div>
          <div className="grid content-end gap-4">
            <Card className="bg-card/90 backdrop-blur">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">识别结果</p>
                <p className="mt-2 text-2xl font-semibold">5 月房租账单</p>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <Preview label="金额" value="¥4,200.00" />
                  <Preview label="提醒" value="5月4日 20:00" />
                  <Preview label="类型" value="账单" />
                  <Preview label="分类" value="居住" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-5">
                <feature.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/80 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
