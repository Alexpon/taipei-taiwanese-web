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
import { updateEvent } from "../../../events/actions";
import type { Event } from "@/types/database";

export default function EditEventPage() {
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        const event = data as Event;
        setTitle(event.title);
        setCoverImage(event.cover_image ?? "");
        setEventDate(event.event_date);
        setLocation(event.location);
        setRegistrationUrl(event.registration_url ?? "");
        setDescription(event.description);
        setIsPublished(event.status === "published");
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("cover_image", coverImage);
      formData.set("event_date", eventDate);
      formData.set("location", location);
      formData.set("registration_url", registrationUrl);
      formData.set("status", isPublished ? "published" : "draft");

      await updateEvent(id, formData);
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
      <h1 className="text-2xl font-bold text-gray-900">編輯活動</h1>

      <Card>
        <CardHeader>
          <CardTitle>活動內容</CardTitle>
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
              <Label htmlFor="event_date">活動日期</Label>
              <Input
                id="event_date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">地點</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_url">報名連結</Label>
              <Input
                id="registration_url"
                value={registrationUrl}
                onChange={(e) => setRegistrationUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>內容</Label>
              <TiptapEditor
                content={description}
                onChange={setDescription}
              />
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
