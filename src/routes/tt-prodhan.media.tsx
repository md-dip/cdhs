import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { AdminCard } from "@/components/admin/AdminShell";
import { useCollection, useCreateRow, useDeleteRow } from "@/lib/queries/collections";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const Route = createFileRoute("/tt-prodhan/media")({
  component: MediaLibrary,
});

function MediaLibrary() {
  const media = useCollection("media");
  const createRow = useCreateRow("media");
  const deleteRow = useDeleteRow("media");
  const [name, setName] = useState("");
  const [src, setSrc] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);
    if (uploadError) {
      setUploading(false);
      toast.error(uploadError.message || "আপলোড ব্যর্থ হয়েছে");
      return;
    }
    const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(path);
    createRow.mutate(
      {
        name: file.name,
        storage_path: path,
        url: publicUrl.publicUrl,
        mime_type: file.type,
        size_bytes: file.size,
      },
      {
        onSuccess: () => toast.success("ফাইল মিডিয়া লাইব্রেরিতে যুক্ত হয়েছে"),
        onError: (err) => toast.error(err.message || "সংরক্ষণ ব্যর্থ হয়েছে"),
      },
    );
    setUploading(false);
  };

  const del = (m: (typeof media)[number]) => {
    if (!window.confirm(`"${String(m["name"])}" স্থায়ীভাবে মুছে ফেলবেন? এটি ফিরিয়ে আনা যাবে না।`))
      return;
    deleteRow.mutate(m.id, {
      onSuccess: async () => {
        if (m["storage_path"]) {
          await getSupabaseBrowserClient()
            .storage.from("media")
            .remove([String(m["storage_path"])]);
        }
        toast.success("মুছে ফেলা হয়েছে");
      },
      onError: (err) => toast.error(err.message || "মুছে ফেলা ব্যর্থ হয়েছে"),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">মিডিয়া লাইব্রেরি</h1>
        <p className="text-sm text-muted-foreground">
          ওয়েবসাইটে ব্যবহৃত সকল ছবি ও ফাইল প্রথমে এখানে আপলোড করতে হবে, পরে প্রয়োজন অনুযায়ী
          ব্যবহার করা যাবে।
        </p>
      </div>

      <AdminCard
        title="নতুন ফাইল আপলোড"
        subtitle="ডিভাইস থেকে ছবি নির্বাচন করুন অথবা লিংক যুক্ত করুন"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-6 text-sm text-muted-foreground hover:bg-secondary">
            <Upload className="size-5" />
            {uploading ? "আপলোড হচ্ছে..." : "ছবি নির্বাচন করুন"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!src.trim()) return;
              createRow.mutate(
                { name: name || "external-file", url: src },
                {
                  onSuccess: () => {
                    setName("");
                    setSrc("");
                    toast.success("লিংক যুক্ত হয়েছে");
                  },
                  onError: (err) => toast.error(err.message || "সংরক্ষণ ব্যর্থ হয়েছে"),
                },
              );
            }}
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ফাইলের নাম"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              placeholder="ছবি / গুগল ড্রাইভ লিংক"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              যুক্ত করুন
            </button>
          </form>
        </div>
      </AdminCard>

      <AdminCard title="সকল ফাইল" subtitle={`মোট ${media.length} টি ফাইল`}>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <figure key={m.id} className="overflow-hidden rounded-md border border-border">
              <img
                src={String(m["url"])}
                alt={String(m["name"])}
                className="h-32 w-full object-cover"
                loading="lazy"
              />
              <figcaption className="flex items-center justify-between gap-2 p-2 text-xs">
                <span className="truncate">{String(m["name"])}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(String(m["url"]));
                    toast.success("লিংক কপি হয়েছে");
                  }}
                  className="shrink-0 rounded border border-input px-1.5 py-0.5"
                >
                  কপি
                </button>
                <button
                  type="button"
                  onClick={() => del(m)}
                  className="shrink-0 text-destructive"
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 className="size-4" />
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
