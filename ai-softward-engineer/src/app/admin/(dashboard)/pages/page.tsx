import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import type { Page } from "@/types/database";

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data: pagesList } = await supabase
    .from("pages")
    .select("*")
    .order("slug", { ascending: true });

  const pages = (pagesList ?? []) as Page[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">頁面管理</h1>
      </div>

      {pages.length === 0 ? (
        <p className="py-12 text-center text-gray-500">尚無頁面</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>頁面名稱</TableHead>
              <TableHead>路徑</TableHead>
              <TableHead>最後更新</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-gray-500">/{page.slug}</TableCell>
                <TableCell>
                  {new Date(page.updated_at).toLocaleDateString("zh-TW")}
                </TableCell>
                <TableCell>
                  <Link href={`/admin/pages/${page.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
