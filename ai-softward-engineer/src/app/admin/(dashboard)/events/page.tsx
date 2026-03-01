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
import type { Event } from "@/types/database";
import DeleteButton from "./delete-button";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: eventsList } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  const events = (eventsList ?? []) as Event[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">活動管理</h1>
        <Link href="/admin/events/new">
          <Button>新增活動</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="py-12 text-center text-gray-500">尚無活動</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>標題</TableHead>
              <TableHead>活動日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  {new Date(item.event_date).toLocaleDateString("zh-TW")}
                </TableCell>
                <TableCell>
                  {item.status === "published" ? (
                    <Badge variant="default">已發布</Badge>
                  ) : (
                    <Badge variant="secondary">草稿</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/events/${item.id}/edit`}>
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
