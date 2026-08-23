import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { TeacherCard } from "@/components/site/TeacherCard";
import { collectionQueryOptions, usePublished } from "@/lib/queries/collections";
import { useT } from "@/lib/i18n";

const title = "শিক্ষকমণ্ডলী | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description = "বিদ্যালয়ের সকল শিক্ষক ও কর্মচারীবৃন্দের তালিকা।";

export const Route = createFileRoute("/teachers")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      collectionQueryOptions("teachers", { onlyPublished: true }),
    ),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Teachers,
});

function Teachers() {
  const { tx } = useT();
  const teachers = usePublished("teachers");
  return (
    <Layout>
      <PageHeader
        title={tx("শিক্ষকমণ্ডলী")}
        subtitle={tx("বিদ্যালয়ের সকল শিক্ষক ও কর্মচারীবৃন্দের তালিকা।")}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Panel title={tx("শিক্ষকমণ্ডলী ও কর্মচারী")}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teachers.map((tc) => (
              <TeacherCard key={tc.id} teacher={tc} />
            ))}
          </div>
        </Panel>
      </div>
    </Layout>
  );
}
