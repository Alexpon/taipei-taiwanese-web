"use client";

import { logout } from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-800">
        台北市台灣語協會 管理後台
      </h2>
      <form action={logout}>
        <Button variant="outline" size="sm" type="submit">
          登出
        </Button>
      </form>
    </header>
  );
}
