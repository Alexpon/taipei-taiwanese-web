"use client";

import { Button } from "@/components/ui/button";
import { deleteEvent } from "./actions";

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("確定要刪除這個活動嗎？")) return;

    await deleteEvent(id);
    window.location.reload();
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      刪除
    </Button>
  );
}
