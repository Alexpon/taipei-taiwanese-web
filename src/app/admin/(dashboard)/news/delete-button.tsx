"use client";

import { Button } from "@/components/ui/button";
import { deleteNews } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("確定要刪除這則消息嗎？")) return;

    await deleteNews(id);
    window.location.reload();
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      刪除
    </Button>
  );
}
