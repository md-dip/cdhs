import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MapPin, Phone, Mail, Clock, School } from "lucide-react";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { school } from "@/lib/site-data";
import { useSettings } from "@/lib/queries/settings";
import { useT } from "@/lib/i18n";

const title = "যোগাযোগ | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "বিদ্যালয় অফিসের ঠিকানা, ফোন, ই-মেইল ও অফিস সময়সূচি এবং বার্তা পাঠানোর ফরম।";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Contact,
});

const field =
  "mt-1.5 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Contact() {
  const { tx, n } = useT();
  const settings = useSettings();
  const [mapLoaded, setMapLoaded] = useState(false);
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    toast.success(tx("আপনার বার্তা পাঠানো হয়েছে।"));
    e.currentTarget.reset();
  }

  return (
    <Layout>
      <PageHeader
        title={tx("যোগাযোগ")}
        subtitle={tx("যেকোনো তথ্যের প্রয়োজনে বিদ্যালয় অফিসে যোগাযোগ করুন।")}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-2">
        <Panel title={tx("যোগাযোগের তথ্য")}>
          <ul className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <School className="mt-0.5 size-4 shrink-0 text-brand" />
              <span className="font-medium text-foreground">
                {tx(settings["nameBn"] || school.name)}
              </span>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
              {tx(settings["address"] || school.address)}
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand" />
              {n(settings["phone"] || school.phone)}
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand" />
              {settings["email"] || school.email}
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand" />
              {tx(settings["officeHours"] || school.hours)}
            </li>
          </ul>
          <div className="mt-5 overflow-hidden rounded-md border border-border">
            {mapLoaded ? (
              <iframe
                title={tx("বিদ্যালয়ের অবস্থান")}
                src="https://www.google.com/maps?cid=9805689754168255060&output=embed"
                width="100%"
                height="260"
                className="block"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <button
                type="button"
                onClick={() => setMapLoaded(true)}
                className="flex h-[260px] w-full flex-col items-center justify-center gap-2 bg-secondary/60 text-sm text-muted-foreground hover:bg-secondary"
              >
                <MapPin className="size-6 text-brand" />
                {tx("মানচিত্র দেখতে ক্লিক করুন")}
              </button>
            )}
          </div>
          <a
            href="https://maps.app.goo.gl/ztPYx13AS4FGoqZq7"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-xs font-medium text-brand hover:text-brand-deep"
          >
            {tx("গুগল ম্যাপে দেখুন")}
          </a>
        </Panel>

        <Panel title={tx("বার্তা পাঠান")}>
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm">
              {tx("আপনার নাম")}
              <input required name="name" className={field} />
            </label>
            <label className="block text-sm">
              {tx("মোবাইল / ই-মেইল")}
              <input required name="contact" className={field} />
            </label>
            <label className="block text-sm">
              {tx("বার্তা")}
              <textarea required name="message" rows={5} className={field} />
            </label>
            <button
              type="submit"
              className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground hover:bg-brand-deep"
            >
              {tx("পাঠিয়ে দিন")}
            </button>
          </form>
        </Panel>
      </div>
    </Layout>
  );
}
