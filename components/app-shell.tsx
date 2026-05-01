import Link from "next/link";
import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  Home,
  Inbox,
  Settings
} from "lucide-react";

const navItems = [
  { href: "/app", label: "总览", icon: Home },
  { href: "/app/inbox", label: "收集箱", icon: Inbox },
  { href: "/app/cards", label: "生活卡片", icon: Boxes },
  { href: "/app/reminders", label: "提醒", icon: Bell },
  { href: "/app/expenses", label: "消费", icon: BarChart3 },
  { href: "/app/lists", label: "清单", icon: ClipboardList },
  { href: "/app/settings", label: "设置", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card px-4 py-5 lg:block">
        <Link href="/" className="flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            LP
          </div>
          <div>
            <p className="text-sm font-semibold">LifePocket</p>
            <p className="text-xs text-muted-foreground">AI 生活口袋</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-semibold">
              LifePocket
            </Link>
            <Link className="text-sm text-primary" href="/app/inbox">
              添加
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
