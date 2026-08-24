import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Layout, PageHeader } from "@/components/site/Layout";
import { collectionQueryOptions, usePublished, type Row } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

const title = "ছবির গ্যালারি | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "বিদ্যালয়ের ভবন, শ্রেণিকক্ষ, সমাবেশ ও নানা আয়োজনের ছবি।";

export const Route = createFileRoute("/gallery")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(collectionQueryOptions("gallery", { onlyPublished: true })),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const { bt } = useT();
  const gallery = usePublished("gallery");
  const [selected, setSelected] = useState<Row | null>(null);

  // Escape to close, and stop the page from scrolling behind the open lightbox.
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [selected]);

  return (
    <Layout>
      <PageHeader
        title={bt("ছবির গ্যালারি", "Photo gallery")}
        subtitle={bt(
          "বিদ্যালয়ের বিভিন্ন কার্যক্রম ও আয়োজনের ছবি।",
          "Photos from the school's various activities and events.",
        )}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g) => {
          const caption = bt(String(g["caption"] ?? ""), String(g["captionEn"] ?? ""));
          return (
            <figure key={g.id} className="surface-card overflow-hidden">
              <button
                type="button"
                onClick={() => setSelected(g)}
                aria-label={caption}
                className="group relative block w-full"
              >
                <img
                  src={String(g["src"])}
                  alt={caption}
                  loading="lazy"
                  className="h-56 w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-brand-deep/0 opacity-0 transition group-hover:bg-brand-deep/30 group-hover:opacity-100">
                  <ZoomIn className="size-8 text-white drop-shadow" />
                </span>
              </button>
              <figcaption className="px-4 py-3 text-sm font-medium text-brand-deep">
                {caption}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label={bt("বন্ধ করুন", "Close")}
            className="absolute right-4 top-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <X className="size-5" />
          </button>
          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] max-w-[90vw] flex-col items-center"
          >
            <img
              src={String(selected["src"])}
              alt={bt(String(selected["caption"] ?? ""), String(selected["captionEn"] ?? ""))}
              className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="mt-3 text-center text-sm font-medium text-white">
              {bt(String(selected["caption"] ?? ""), String(selected["captionEn"] ?? ""))}
            </figcaption>
          </figure>
        </div>
      ) : null}
    </Layout>
  );
}
