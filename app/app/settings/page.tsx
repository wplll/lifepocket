import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const defaultEndpoint = "https://chat.intern-ai.org.cn/api/v1/chat/completions";

export default function SettingsPage() {
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">设置</h1>
        <p className="mt-2 text-muted-foreground">
          配置书生模型 API、查看本地隐私说明，并预留 Supabase 接入状态。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>书生模型 API 设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label title="API Endpoint">
              <Input defaultValue={defaultEndpoint} />
            </Label>
            <Label title="Model">
              <Input defaultValue="intern-latest" />
            </Label>
            <Label title="API Token">
              <Input type="password" placeholder="在手机 App 设置页填写并安全保存" />
            </Label>
            <div className="flex flex-wrap gap-2">
              <Button type="button">测试连接</Button>
              <Button type="button" variant="secondary">保存设置</Button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Web Demo 仅展示设置形态；手机 App 会使用 SecureStore 保存 Token，并在识别图片或文本时调用用户配置的接口。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              隐私与本地保存
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>不内置任何 API Token，也不把真实密钥提交到仓库。</p>
            <p>Token 由用户自己填写，手机端保存在本地安全存储中。</p>
            <p>调用 AI 时，会把用户选择的图片或文本发送到用户配置的模型接口。</p>
            <p>日志和错误提示不应输出 Token。</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supabase 状态</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            连接状态：
            <span className={hasSupabase ? "font-semibold text-primary" : "text-muted-foreground"}>
              {hasSupabase ? " 已配置" : " 未配置"}
            </span>
          </p>
          <p className="text-muted-foreground">
            在 `.env.local` 中填入 `NEXT_PUBLIC_SUPABASE_URL` 和
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` 后，可继续接入真实账号、数据库和图片存储。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ title, children }: { title: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {title}
      {children}
    </label>
  );
}
