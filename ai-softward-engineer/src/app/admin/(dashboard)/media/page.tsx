"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FileObject } from "@supabase/storage-js";

export default function AdminMediaPage() {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadFiles() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.storage.from("media").list();
    const filtered = (data ?? []).filter(
      (f) => f.name !== ".emptyFolderPlaceholder"
    );
    setFiles(filtered);
    setLoading(false);
  }

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getPublicUrl(name: string): string {
    const supabase = createClient();
    const { data } = supabase.storage.from("media").getPublicUrl(name);
    return data.publicUrl;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const filename = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("media")
      .upload(filename, file);

    if (error) {
      alert("上傳失敗：" + error.message);
    }

    // Reset input so the same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploading(false);
    await loadFiles();
  }

  async function handleCopyUrl(name: string) {
    const url = getPublicUrl(name);
    await navigator.clipboard.writeText(url);
    alert("已複製網址");
  }

  async function handleDelete(name: string) {
    if (!confirm("確定要刪除這張圖片嗎？")) return;

    const supabase = createClient();
    const { error } = await supabase.storage.from("media").remove([name]);
    if (error) {
      alert("刪除失敗：" + error.message);
    }
    await loadFiles();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">媒體庫</h1>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "上傳中…" : "上傳圖片"}
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-500">載入中…</p>
      ) : files.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          尚無上傳的圖片，請點擊「上傳圖片」開始
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <Card key={file.name}>
              <CardContent className="space-y-3 p-4">
                <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicUrl(file.name)}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p
                  className="truncate text-sm text-gray-600"
                  title={file.name}
                >
                  {file.name}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCopyUrl(file.name)}
                  >
                    複製網址
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(file.name)}
                  >
                    刪除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
