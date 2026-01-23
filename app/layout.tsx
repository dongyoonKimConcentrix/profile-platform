import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Powered HRM - 프로젝트 인력 추천 및 관리 시스템",
  description: "데이터 중심의 자동화와 AI 매칭을 통해 프로젝트 적임자를 빠르게 선발하는 지능형 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
