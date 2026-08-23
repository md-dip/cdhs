import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard } from "@/components/admin/AdminShell";
import { useSettings, useUpdateSettings } from "@/lib/queries/settings";

export const Route = createFileRoute("/tt-prodhan/settings")({
  component: SettingsPage,
});

const fields: { name: string; label: string; type?: "textarea"; full?: boolean }[] = [
  { name: "nameBn", label: "প্রতিষ্ঠানের নাম (বাংলা)" },
  { name: "nameEn", label: "প্রতিষ্ঠানের নাম (ইংরেজি)" },
  { name: "address", label: "ঠিকানা" },
  { name: "phone", label: "মোবাইল" },
  { name: "email", label: "ইমেইল" },
  { name: "eiin", label: "ইআইআইএন" },
  { name: "founded", label: "প্রতিষ্ঠার সাল" },
  { name: "motto", label: "প্রতিষ্ঠানের মূলমন্ত্র", full: true },
  { name: "classroomCount", label: "শ্রেণিকক্ষ সংখ্যা (এক নজরে বিদ্যালয়)" },
  { name: "passRate", label: "পাসের হার % (এক নজরে বিদ্যালয়)" },
  {
    name: "glanceBn",
    label: "এক নজরে বিদ্যালয় — বিবরণ (বাংলা)",
    type: "textarea",
    full: true,
  },
  {
    name: "glanceEn",
    label: "এক নজরে বিদ্যালয় — বিবরণ (ইংরেজি, না দিলে স্বয়ংক্রিয় অনুবাদ দেখানো হবে)",
    type: "textarea",
    full: true,
  },
  { name: "missionBn", label: "আমাদের লক্ষ্য (বাংলা)", type: "textarea", full: true },
  {
    name: "missionEn",
    label: "আমাদের লক্ষ্য (ইংরেজি, না দিলে স্বয়ংক্রিয় অনুবাদ দেখানো হবে)",
    type: "textarea",
    full: true,
  },
  { name: "headName", label: "প্রধান শিক্ষকের নাম" },
  { name: "headTitle", label: "প্রধান শিক্ষকের পদবি" },
  { name: "headPhoto", label: "প্রধান শিক্ষকের ছবির লিংক (মিডিয়া লাইব্রেরি থেকে)", full: true },
  { name: "headMessageBn", label: "প্রধান শিক্ষকের বাণী (বাংলা)", type: "textarea", full: true },
  {
    name: "headMessageEn",
    label: "প্রধান শিক্ষকের বাণী (ইংরেজি, না দিলে স্বয়ংক্রিয় অনুবাদ দেখানো হবে)",
    type: "textarea",
    full: true,
  },
];

function SettingsPage() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [draft, setDraft] = useState<Record<string, string>>({ ...settings });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-deep">সাধারণ সেটিংস</h1>
        <p className="text-sm text-muted-foreground">
          প্রতিষ্ঠানের নাম, ঠিকানা, যোগাযোগ ও প্রধান শিক্ষকের তথ্য এখান থেকে পরিবর্তন করুন।
        </p>
      </div>
      <AdminCard title="প্রতিষ্ঠানের তথ্য">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateSettings.mutate(draft, {
              onSuccess: () => toast.success("সেটিংস সংরক্ষিত হয়েছে"),
              onError: (err) => toast.error(err.message || "সংরক্ষণ ব্যর্থ হয়েছে"),
            });
          }}
        >
          {fields.map((f) => (
            <div key={f.name} className={f.full ? "md:col-span-2" : ""}>
              <label className="mb-1 block text-sm font-medium" htmlFor={f.name}>
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  rows={5}
                  value={draft[f.name] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              ) : (
                <input
                  id={f.name}
                  value={draft[f.name] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}
