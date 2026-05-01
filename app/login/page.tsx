import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>登录 LifePocket</CardTitle>
          <p className="text-sm text-muted-foreground">
            输入邮箱后可接入 Supabase Magic Link。
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input type="email" placeholder="you@example.com" />
          <Button className="w-full" type="button">
            <Mail className="h-4 w-4" />
            发送登录链接
          </Button>
          <Link className="block text-center text-sm text-primary" href="/app">
            先体验 Demo
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
