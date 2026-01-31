"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn, User, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);

  useEffect(() => {
    if (from && from !== "/") {
      setShowRequiredModal(true);
    }
  }, [from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

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

      // 관리자면 /admin으로, 일반 사용자는 from 또는 /
      const { data: adminData } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", authData.user.id)
        .single();

      if (adminData) {
        router.push("/admin");
      } else {
        router.push(from);
      }
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">로그인</CardTitle>
            <CardDescription>
              인력 검색·목록·상세를 이용하려면 로그인하세요. <br />계정은 관리자가 발급합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email">이메일</Label>
                <Input
                  id="user-email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-describedby="user-email-help"
                  disabled={isLoading}
                />
                <p id="user-email-help" className="text-xs text-muted-foreground">
                  관리자가 발급한 계정 이메일을 입력하세요
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-password">비밀번호</Label>
                <Input
                  id="user-password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
                  role="alert"
                >
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
            <p className="text-center mt-4">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
              >
                대시보드로 돌아가기
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showRequiredModal} onOpenChange={setShowRequiredModal}>
        <DialogContent role="alertdialog">
          <DialogTitle>로그인이 필요합니다</DialogTitle>
          <DialogHeader>
            <DialogDescription>
              인력 검색·인력 목록·인력 상세 페이지는 로그인 후 이용할 수 있습니다. 아래에서 로그인해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setShowRequiredModal(false)}>
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
