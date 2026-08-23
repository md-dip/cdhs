import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudSection } from "@/components/admin/CrudSection";
import { getSection } from "@/lib/admin-config";

export const Route = createFileRoute("/tt-prodhan/$section")({
  component: SectionPage,
});

function SectionPage() {
  const { section } = Route.useParams();
  const config = getSection(section);

  if (!config) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-lg font-semibold">অপশনটি পাওয়া যায়নি</h1>
        <Link to="/tt-prodhan" className="mt-2 inline-block text-sm text-primary underline">
          ড্যাশবোর্ডে ফিরে যান
        </Link>
      </div>
    );
  }

  // key forces a fresh CrudSection instance per section — otherwise switching
  // sections reuses the same component and its internal form state (draft,
  // editing row, etc.) can carry stale field values from the previous
  // section's schema into an update for a table that doesn't have them.
  return <CrudSection key={config.key} config={config} />;
}
