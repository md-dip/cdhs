import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader, Panel } from "@/components/site/Layout";
import { school, images, facilities } from "@/lib/site-data";
import {
  collectionQueryOptions,
  pageBySlugQueryOptions,
  usePublished,
} from "@/lib/queries/collections";
import { useSettings } from "@/lib/queries/settings";
import { useT } from "@/lib/i18n";

const title = "প্রতিষ্ঠান পরিচিতি | ছাতনী ঢেকড়া উচ্চ বিদ্যালয়";
const description =
  "১৯৬৫ সালে প্রতিষ্ঠিত ছাতনী ঢেকড়া উচ্চ বিদ্যালয়ের ইতিহাস, সুযোগ-সুবিধা ও মৌলিক তথ্য।";

const HISTORY_FALLBACK =
  "১৯৬৫ সালে এলাকার শিক্ষানুরাগী ব্যক্তিবর্গের ঐকান্তিক প্রচেষ্টায় ছাতনী দেখরা উচ্চ বিদ্যালয় প্রতিষ্ঠিত হয়। প্রতিষ্ঠাকালে দুটি টিনশেড কক্ষে পাঠদান শুরু হলেও আজ বিদ্যালয়টি একটি ত্রিতল একাডেমিক ভবন, প্রশাসনিক ভবন ও বিস্তৃত খেলার মাঠসহ পূর্ণাঙ্গ শিক্ষাপ্রতিষ্ঠানে রূপ নিয়েছে।\n\nবর্তমানে ষষ্ঠ থেকে দশম শ্রেণি পর্যন্ত বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা শাখায় পাঠদান চলছে। বিদ্যালয়ের শিক্ষার্থীরা প্রতি বছর এসএসসি পরীক্ষায় ঈর্ষণীয় ফলাফল অর্জন করে এবং ক্রীড়া ও সাংস্কৃতিক প্রতিযোগিতায় উপজেলা পর্যায়ে নিয়মিত অংশ নেয়।";

const MISSION_FALLBACK =
  "মানসম্মত শিক্ষা, নৈতিক মূল্যবোধ ও ডিজিটাল দক্ষতার সমন্বয়ে দেশপ্রেমিক ও দায়িত্বশীল নাগরিক গড়ে তোলা।";

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    const [page] = await Promise.all([
      context.queryClient.ensureQueryData(pageBySlugQueryOptions("about")),
      context.queryClient.ensureQueryData(
        collectionQueryOptions("gallery", { onlyPublished: true }),
      ),
    ]);
    return { page };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: About,
});

function About() {
  const { tx, n, bt } = useT();
  const settings = useSettings();
  const founded = settings["founded"] || school.founded;
  const { page } = Route.useLoaderData();
  const historyBn = String(page?.["body"] || "") || HISTORY_FALLBACK;
  const historyEn = String(page?.["bodyEn"] || "");
  const missionBn = String(settings["missionBn"] || MISSION_FALLBACK);
  const missionEn = String(settings["missionEn"] || "");
  const gallery = usePublished("gallery");
  const coverPhoto = gallery.find((g) => g["showOnAbout"] === "on");
  const coverSrc = String(coverPhoto?.["src"] || "") || images.schoolBuilding;
  const coverAlt = coverPhoto ? tx(String(coverPhoto["caption"] ?? "")) : tx(school.name);
  return (
    <Layout>
      <PageHeader title={tx("প্রতিষ্ঠান পরিচিতি")} subtitle={tx(school.address)} />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <img
            src={coverSrc}
            alt={coverAlt}
            className="h-[320px] w-full rounded-lg object-cover shadow-[var(--shadow-card)]"
          />
          <Panel title={tx("সংক্ষিপ্ত ইতিহাস")}>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {bt(historyBn, historyEn)}
            </p>
          </Panel>
          <Panel title={tx("সুযোগ-সুবিধা")}>
            <ul className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              {facilities.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-gold">◆</span>
                  {tx(f)}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="space-y-6">
          <Panel title={tx("মৌলিক তথ্য")}>
            <dl className="-mt-2 divide-y divide-border text-sm">
              {[
                [tx("প্রতিষ্ঠানের নাম"), tx(school.name)],
                [tx("ঠিকানা"), tx(school.address)],
                [tx("ইআইআইএন"), n(school.eiin)],
                [tx("স্থাপিত"), n(founded)],
                [tx("শিক্ষা বোর্ড"), tx(school.board)],
                [tx("শিফট"), tx(school.shift)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-muted-foreground">{k}</dt>
                  <dd className="text-end font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
          <Panel title={tx("আমাদের লক্ষ্য")}>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {bt(missionBn, missionEn)}
            </p>
          </Panel>
        </aside>
      </div>
    </Layout>
  );
}
