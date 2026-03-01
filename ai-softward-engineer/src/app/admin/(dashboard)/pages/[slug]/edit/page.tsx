"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TiptapEditor from "@/components/admin/tiptap-editor";
import { createClient } from "@/lib/supabase/client";
import { updatePage } from "../../actions";
import type { Page } from "@/types/database";

export default function EditPagePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .single();

      if (data) {
        const page = data as Page;
        setTitle(page.title);
        setContent(page.content);
      }
      setLoading(false);
    };

    fetchPage();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaved(false);

    try {
      await updatePage(slug, { title, content });
      setSaved(true);
    } catch {
      // Error handling
    } finally {
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
      <h1 className="text-2xl font-bold text-gray-900">編輯頁面</h1>

      <Card>
        <CardHeader>
          <CardTitle>頁面內容</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">頁面標題</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>內容</Label>
              <TiptapEditor content={content} onChange={setContent} />
            </div>

            <div className="flex items-center gap-4">
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
              {saved && (
                <span className="text-sm text-green-600">儲存成功！</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
