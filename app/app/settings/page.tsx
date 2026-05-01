import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">设置</h1>
        <p className="mt-2 text-muted-foreground">
          配置账户、Supabase 和后续 AI 服务。
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supabase 状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            连接状态：
            <span className={hasSupabase ? "text-primary" : "text-muted-foreground"}>
              {hasSupabase ? " 已配置" : " 未配置"}
            </span>
          </p>
          <p className="text-muted-foreground">
            在 `.env.local` 中填入 `NEXT_PUBLIC_SUPABASE_URL` 和
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` 后即可接入真实项目。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
