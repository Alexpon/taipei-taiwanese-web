"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "儀表板", icon: "🏠" },
  { href: "/admin/news", label: "最新消息", icon: "📰" },
  { href: "/admin/events", label: "活動課程", icon: "📅" },
  { href: "/admin/pages", label: "頁面管理", icon: "📄" },
  { href: "/admin/media", label: "媒體庫", icon: "🖼️" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-gray-900 text-white">
      <div className="border-b border-gray-700 px-6 py-5">
        <h1 className="text-lg font-bold">台北市台灣語協會</h1>
        <p className="text-sm text-gray-400">管理後台</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-white/10 text-white"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
