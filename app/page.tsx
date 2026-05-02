import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bell,
  Camera,
  CheckCircle2,
  CreditCard,
  ListChecks,
  Plane,
  Receipt
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const scenarios = [
  { icon: Receipt, title: "小票识别", text: "提取商家、金额、日期和消费分类。" },
  { icon: Bell, title: "账单提醒", text: "把房租、水电、还款变成可追踪提醒。" },
  { icon: Camera, title: "预约整理", text: "保存诊所、维修、取件等关键时间。" },
  { icon: ListChecks, title: "购物清单", text: "从聊天和截图里整理待买物品。" },
  { icon: Plane, title: "旅行清单", text: "沉淀车票、酒店、证件和出行待办。" }
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,142,75,0.20),transparent_34%),linear-gradient(135deg,rgba(35,126,111,0.12),transparent_42%)]" />
        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-2xl">
            <Badge>AI 生活管家</Badge>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
              LifePocket / 生活口袋
            </h1>
            <p className="mt-5 text-2xl font-semibold text-primary">
              把截图、票据、待办、账单和生活琐事，自动整理成清单和提醒。
            </p>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
              上传截图、票据、小票、账单、预约、购物或旅行信息，也可以直接粘贴文字。LifePocket 会调用用户自己配置的书生模型 API，生成生活卡片、提醒、消费记录和清单。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app">
                <Button className="min-h-11 px-5">
                  开始整理生活
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/app/settings">
                <Button className="min-h-11 px-5" variant="secondary">
                  配置书生模型
                </Button>
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[720px]">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
              <Image
                src="/images/landing-hero.png"
                alt="LifePocket 将截图、票据、账单、清单和行程整理成生活卡片的产品展示图"
                width={1680}
                height={900}
                className="h-auto w-full"
                priority
              />
              <div className="grid gap-3 border-t border-border bg-card p-4 text-sm sm:grid-cols-4">
                <Preview label="金额" value="¥4,200.00" />
                <Preview label="提醒" value="5月4日 20:00" />
                <Preview label="类型" value="账单" />
                <Preview label="分类" value="居住" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">常见生活场景，一次收进同一个口袋</h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            面向普通用户的轻量整理工具，不替你制造复杂系统，只把已经散落在截图、聊天和票据里的信息变成可用卡片。
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {scenarios.map((scenario) => (
            <Card key={scenario.title}>
              <CardContent className="p-5">
                <scenario.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{scenario.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {scenario.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[
            ["用户自配模型", "API Endpoint、Model 和 Token 由用户填写，不在代码里硬编码。"],
            ["本地优先保存", "手机端使用本地存储保存卡片、清单和安全 Token。"],
            ["申报展示友好", "Web Demo 展示完整产品路径，适合 GitHub、项目申报和演示。"]
          ].map(([title, text]) => (
            <div key={title} className="flex gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-primary" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Badge>产品能力</Badge>
            <h2 className="mt-4 text-2xl font-semibold">从识别到行动的生活工作流</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              LifePocket 的目标不是做一个保存截图的相册，而是让截图里的日期、金额、地点、事项都能被重新利用。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["截图收纳箱", "统一入口接收截图、图片和文本。"],
              ["生活卡片", "结构化展示金额、日期、商家、地点和提醒。"],
              ["消费记录", "按周、月和分类汇总生活支出。"],
              ["智能清单", "按购物、旅行、出门等场景生成清单。"]
            ].map(([title, text]) => (
              <Card key={title}>
                <CardContent className="p-5">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Preview({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
