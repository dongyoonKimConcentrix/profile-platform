"use client";

interface DashboardBlurMaskProps {
  isLoggedIn: boolean;
  children: React.ReactNode;
}

/**
 * 비로그인 시 카드 영역 위에 흰색 blur 마스크를 씌웁니다.
 * 제목 영역은 부모에서 제외하고 이 컴포넌트로 카드만 감싸 사용하세요.
 */
export function DashboardBlurMask({ isLoggedIn, children }: DashboardBlurMaskProps) {
  if (isLoggedIn) {
    return <>{children}</>;
  }
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-white/45 backdrop-blur-[3px]"
        aria-hidden="true"
      />
      <div className="relative opacity-95 select-none" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
