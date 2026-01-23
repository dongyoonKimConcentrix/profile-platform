"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn, Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setError("로그인에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      // 관리자 역할 확인
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", authData.user.id)
        .single();

      if (adminError || !adminData) {
        // 로그아웃 처리
        await supabase.auth.signOut();
        setError("관리자 권한이 없습니다.");
        setIsLoading(false);
        return;
      }

      // 로그인 성공 - 미들웨어가 자동으로 리다이렉트 처리
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="h-8 w-8 text-indigo-600" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">관리자 로그인</CardTitle>
          <CardDescription>
            인력 관리 시스템에 접속하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="관리자 이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-describedby="email-help"
                disabled={isLoading}
              />
              <p id="email-help" className="text-xs text-muted-foreground">
                Supabase Auth에 등록된 관리자 이메일을 입력하세요
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-describedby="password-help"
                disabled={isLoading}
              />
              <p id="password-help" className="text-xs text-muted-foreground">
                관리자 비밀번호를 입력하세요
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  로그인 중...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" aria-hidden="true" />
                  로그인
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
