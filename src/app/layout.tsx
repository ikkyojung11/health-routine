import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: '헬스루틴 - 초보자를 위한 헬스일지 & 성장분석',
  description: '가슴, 등, 하체, 팔 부위별 기구 목차와 중량/횟수/세트 기록 및 성장 추이 분석 웹앱',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#09090b',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className="font-sans bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-zinc-950 pb-24">
        <div className="max-w-md mx-auto sm:max-w-lg md:max-w-2xl px-4 min-h-screen flex flex-col">
          <main className="flex-1 py-4">{children}</main>
        </div>
        <Navigation />
      </body>
    </html>
  );
}
