"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Search, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "인력 검색", href: "/search", icon: Search },
  { name: "인력 목록", href: "/list", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="주요 네비게이션"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" aria-hidden="true" />
            <h1 className="text-xl font-semibold">AI-Powered HRM</h1>
          </div>
          <div className="flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.name}
                  asChild
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "gap-2",
                    isActive && "bg-primary text-primary-foreground"
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
        </div>
      </div>
    </nav>
  );
}
