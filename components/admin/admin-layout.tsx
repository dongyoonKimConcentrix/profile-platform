"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, List, LogOut, Shield, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavigation = [
  { name: "인력 목록", href: "/admin", icon: List },
  { name: "인력 등록", href: "/admin/profiles/new", icon: UserPlus },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Supabase Auth로 인증 확인
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/admin/login");
          return;
        }

        // 관리자 역할 확인
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (adminError || !adminData) {
          router.push("/admin/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error("Auth check error:", err);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
      router.push("/admin/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              <h1 className="text-xl font-semibold">관리자 시스템</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Button
                      key={item.name}
                      asChild
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "gap-2",
                        isActive && "bg-indigo-600 text-white"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only sm:not-sr-only">{item.name}</span>
                      </Link>
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2"
                aria-label="로그아웃"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">로그아웃</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t bg-white py-4 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2024 AI-Powered HRM 관리자 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
