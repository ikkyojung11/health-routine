'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dumbbell, Home, TrendingUp, BookOpen, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: '홈', href: '/', icon: Home },
    { label: '기구목차', href: '/exercises', icon: BookOpen },
    { label: '운동일지', href: '/workout', icon: Dumbbell, isPrimary: true },
    { label: '성장분석', href: '/analytics', icon: TrendingUp },
    { label: '설정', href: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2 max-w-md mx-auto sm:max-w-lg md:max-w-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-zinc-950 ring-4 ring-emerald-500/30'
                      : 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                  }`}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <span className={`text-[11px] font-semibold mt-1 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-emerald-400 font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
