import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

async function getStats() {
  const supabase = await createClient();

  const [{ count: newsCount }, { count: eventsCount }] = await Promise.all([
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }),
  ]);

  return {
    newsCount: newsCount ?? 0,
    eventsCount: eventsCount ?? 0,
  };
}

const quickLinks = [
  { href: "/admin/news/new", label: "新增消息", icon: "📝" },
  { href: "/admin/events/new", label: "新增活動", icon: "📅" },
  { href: "/admin/pages", label: "編輯頁面", icon: "📄" },
  { href: "/admin/media", label: "媒體庫", icon: "🖼️" },
];

export default async function AdminDashboardPage() {
  const { newsCount, eventsCount } = await getStats();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">儀表板</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              最新消息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{newsCount}</p>
            <p className="text-sm text-gray-500">篇文章</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-500">
              活動課程
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{eventsCount}</p>
            <p className="text-sm text-gray-500">項活動</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">快速操作</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="mb-2 text-3xl">{link.icon}</span>
                  <p className="font-medium">{link.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
