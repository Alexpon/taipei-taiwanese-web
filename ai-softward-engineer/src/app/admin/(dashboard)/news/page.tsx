import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { News } from "@/types/database";
import DeleteButton from "./delete-button";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false });

  const news = (newsList ?? []) as News[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">最新消息</h1>
        <Link href="/admin/news/new">
          <Button>新增消息</Button>
        </Link>
      </div>

      {news.length === 0 ? (
        <p className="py-12 text-center text-gray-500">尚無消息</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>標題</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>發布日期</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {news.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {item.status === "published" ? (
                    <Badge variant="default">已發布</Badge>
                  ) : (
                    <Badge variant="secondary">草稿</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.published_at
                    ? new Date(item.published_at).toLocaleDateString("zh-TW")
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/news/${item.id}/edit`}>
                      <Button variant="outline" size="sm">
                        編輯
                      </Button>
                    </Link>
                    <DeleteButton id={item.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
