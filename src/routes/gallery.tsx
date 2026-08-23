import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/site/Layout";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
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
  const { tx } = useT();
  const gallery = usePublished("gallery");
  return (
    <Layout>
      <PageHeader
        title={tx("ছবির গ্যালারি")}
        subtitle={tx("বিদ্যালয়ের বিভিন্ন কার্যক্রম ও আয়োজনের ছবি।")}
      />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-2 lg:grid-cols-3">
        {gallery.map((g) => (
          <figure key={g.id} className="surface-card overflow-hidden">
            <img
              src={String(g["src"])}
              alt={tx(String(g["caption"]))}
              loading="lazy"
              className="h-56 w-full object-cover"
            />
            <figcaption className="px-4 py-3 text-sm font-medium text-brand-deep">
              {tx(String(g["caption"]))}
            </figcaption>
          </figure>
        ))}
      </div>
    </Layout>
  );
}
