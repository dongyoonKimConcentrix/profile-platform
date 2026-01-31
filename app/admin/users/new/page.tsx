"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserCog, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminCreateUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "계정 생성에 실패했습니다.");
        setIsLoading(false);
        return;
      }

      setSuccess("사용자 계정이 생성되었습니다. 해당 이메일과 비밀번호를 사용자에게 전달하세요.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("요청 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" aria-label="뒤로 가기">
            <Link href="/admin">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <UserCog className="h-6 w-6" aria-hidden="true" />
              사용자 계정 생성
            </h1>
            <p className="text-muted-foreground mt-1">
              인력 검색·목록·상세를 이용할 사용자 계정을 생성합니다. 회원가입은 없으며, 관리자가 생성한 계정을 전달하세요.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>새 계정</CardTitle>
            <CardDescription>
              이메일과 비밀번호를 입력한 뒤 생성하세요. 생성된 계정으로 /login 페이지에서 로그인할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-user-email">이메일 *</Label>
                <Input
                  id="create-user-email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="off"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-user-password">비밀번호 * (6자 이상)</Label>
                <Input
                  id="create-user-password"
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md" role="alert">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md" role="status">
                  {success}
                </div>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                    생성 중...
                  </>
                ) : (
                  "계정 생성"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
