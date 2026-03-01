"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TiptapEditor from "@/components/admin/tiptap-editor";
import { createClient } from "@/lib/supabase/client";
import { updateNews } from "../../../news/actions";
import type { News } from "@/types/database";

export default function EditNewsPage() {
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        const news = data as News;
        setTitle(news.title);
        setCoverImage(news.cover_image ?? "");
        setContent(news.content);
        setIsPublished(news.status === "published");
      }
      setLoading(false);
    };

    fetchNews();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("content", content);
      formData.set("cover_image", coverImage);
      formData.set("status", isPublished ? "published" : "draft");

      await updateNews(id, formData);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">編輯消息</h1>

      <Card>
        <CardHeader>
          <CardTitle>消息內容</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image">封面圖片網址</Label>
              <Input
                id="cover_image"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>內容</Label>
              <TiptapEditor content={content} onChange={setContent} />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="published">發布</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "儲存中..." : "儲存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
