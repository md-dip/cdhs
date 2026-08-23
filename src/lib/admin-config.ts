import type { CollectionKey } from "./queries/collections";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "date" | "select" | "password";
  options?: string[];
  full?: boolean;
};

export type SectionConfig = {
  key: CollectionKey;
  slug: string;
  title: string;
  subtitle: string;
  columns: { name: string; label: string }[];
  fields: Field[];
  /** Rows can be drag-reordered in the admin list; the resulting order drives the public site too. */
  orderable?: boolean;
};

const statusField: Field = {
  name: "status",
  label: "প্রকাশনার অবস্থা",
  type: "select",
  options: ["published", "unpublished"],
};

export const sections: SectionConfig[] = [
  {
    key: "notices",
    slug: "notices",
    title: "নোটিশ বোর্ড",
    subtitle: "সকল নোটিশ দেখুন, নতুন নোটিশ প্রকাশ করুন, সম্পাদনা ও মুছে ফেলুন।",
    columns: [
      { name: "title", label: "নোটিশ শিরোনাম" },
      { name: "category", label: "ক্যাটাগরি" },
      { name: "date", label: "প্রকাশের সময়" },
    ],
    fields: [
      { name: "title", label: "নোটিশ শিরোনাম", full: true },
      { name: "slug", label: "ইউআরএল (ইংরেজি অক্ষরে)" },
      { name: "category", label: "ক্যাটাগরি" },
      { name: "date", label: "প্রকাশের সময়" },
      { name: "file", label: "সংযুক্ত ফাইল / গুগল ড্রাইভ লিংক" },
      { name: "body", label: "বিস্তারিত", type: "textarea", full: true },
      statusField,
    ],
  },
  {
    key: "routines",
    slug: "routines",
    title: "ক্লাস রুটিন",
    subtitle: "শ্রেণি ও পরীক্ষার সকল রুটিন প্রকাশ ও সম্পাদনা করুন।",
    columns: [
      { name: "title", label: "রুটিনের শিরোনাম" },
      { name: "published", label: "প্রকাশকাল" },
    ],
    fields: [
      { name: "title", label: "রুটিনের শিরোনাম", full: true },
      { name: "published", label: "প্রকাশকাল" },
      { name: "file", label: "সংযুক্ত ফাইল / পিডিএফ লিংক" },
      {
        name: "rows",
        label: "রুটিন টেবিল (প্রতি লাইনে এক সারি, ঘর আলাদা করতে | ব্যবহার করুন)",
        type: "textarea",
        full: true,
      },
      statusField,
    ],
  },
  {
    key: "teachers",
    slug: "teachers",
    title: "শিক্ষকমণ্ডলী",
    subtitle:
      "নতুন শিক্ষক যোগ করুন, তথ্য সম্পাদনা ও প্রকাশনা নিয়ন্ত্রণ করুন। তালিকায় টেনে (ড্র্যাগ) ক্রম পরিবর্তন করা যাবে।",
    orderable: true,
    columns: [
      { name: "name", label: "নাম" },
      { name: "role", label: "পদবি" },
      { name: "subject", label: "বিষয়" },
    ],
    fields: [
      { name: "name", label: "নাম" },
      { name: "role", label: "পদবি" },
      { name: "subject", label: "বিষয়" },
      { name: "phone", label: "মোবাইল" },
      { name: "photo", label: "ছবির লিংক (মিডিয়া লাইব্রেরি থেকে)", full: true },
      statusField,
    ],
  },
  {
    key: "committee",
    slug: "committee",
    title: "পরিচালনা পর্ষদ",
    subtitle:
      "পর্ষদের সদস্য যোগ, সম্পাদনা ও প্রকাশনা নিয়ন্ত্রণ করুন। তালিকায় টেনে (ড্র্যাগ) ক্রম পরিবর্তন করা যাবে।",
    orderable: true,
    columns: [
      { name: "name", label: "নাম" },
      { name: "designation", label: "পদবি" },
    ],
    fields: [
      { name: "name", label: "নাম" },
      { name: "designation", label: "পদবি" },
      { name: "phone", label: "মোবাইল" },
      statusField,
    ],
  },
  {
    key: "admissions",
    slug: "admissions",
    title: "ভর্তি আবেদন",
    subtitle: "অনলাইন ভর্তি আবেদন অনুমোদন, বাতিল বা মুছে ফেলুন।",
    columns: [
      { name: "name", label: "আবেদনকারী" },
      { name: "className", label: "শ্রেণি" },
      { name: "session", label: "শিক্ষাবর্ষ" },
      { name: "applicationState", label: "অবস্থা" },
    ],
    fields: [
      { name: "name", label: "আবেদনকারীর নাম" },
      { name: "className", label: "শ্রেণি" },
      { name: "session", label: "শিক্ষাবর্ষ" },
      { name: "guardian", label: "অভিভাবকের নাম" },
      { name: "phone", label: "মোবাইল" },
      {
        name: "applicationState",
        label: "আবেদনের অবস্থা",
        type: "select",
        options: ["pending", "approved", "cancelled"],
      },
      statusField,
    ],
  },
  {
    key: "classes",
    slug: "classes",
    title: "শ্রেণি ও আসন",
    subtitle:
      "শ্রেণি যোগ করুন, আসন সংখ্যা ও ভর্তি আবেদন চালু/বন্ধ করুন। তালিকায় টেনে (ড্র্যাগ) ক্রম পরিবর্তন করা যাবে।",
    orderable: true,
    columns: [
      { name: "name", label: "শ্রেণি" },
      { name: "number", label: "শ্রেণি নম্বর" },
      { name: "seats", label: "আসন" },
      { name: "admissionOpen", label: "ভর্তি আবেদন" },
    ],
    fields: [
      { name: "name", label: "শ্রেণির নাম" },
      { name: "number", label: "শ্রেণি নম্বর (ইংরেজি)" },
      { name: "seats", label: "আসন সংখ্যা" },
      { name: "group", label: "বিভাগসমূহ" },
      { name: "rules", label: "বিষয় নির্বাচনের নিয়ম", type: "textarea", full: true },
      { name: "admissionOpen", label: "ভর্তি আবেদন", type: "select", options: ["on", "off"] },
      statusField,
    ],
  },
  {
    key: "books",
    slug: "books",
    title: "পাঠ্যপুস্তক",
    subtitle:
      "শ্রেণিভিত্তিক পাঠ্যপুস্তক ও বিষয় কোড সম্পাদনা করুন। তালিকায় টেনে (ড্র্যাগ) ক্রম পরিবর্তন করা যাবে।",
    orderable: true,
    columns: [
      { name: "name", label: "বইয়ের নাম" },
      { name: "code", label: "বিষয় কোড" },
      { name: "className", label: "শ্রেণি" },
    ],
    fields: [
      { name: "name", label: "বইয়ের নাম" },
      { name: "code", label: "বিষয় কোড" },
      { name: "className", label: "শ্রেণি" },
      statusField,
    ],
  },
  {
    key: "results",
    slug: "results",
    title: "পরীক্ষার ফলাফল",
    subtitle:
      "এসএসসি ফলাফলের তথ্য যোগ, সম্পাদনা ও প্রকাশনা নিয়ন্ত্রণ করুন। তালিকায় টেনে (ড্র্যাগ) ক্রম পরিবর্তন করা যাবে।",
    orderable: true,
    columns: [
      { name: "year", label: "সন" },
      { name: "exam", label: "পরীক্ষা" },
      { name: "appeared", label: "অংশগ্রহণ" },
      { name: "passed", label: "উত্তীর্ণ" },
      { name: "gpa5", label: "জিপিএ-৫" },
    ],
    fields: [
      { name: "year", label: "সন" },
      { name: "exam", label: "পরীক্ষার নাম" },
      { name: "appeared", label: "অংশগ্রহণকারীর সংখ্যা" },
      { name: "passed", label: "উত্তীর্ণের সংখ্যা" },
      { name: "gpa5", label: "জিপিএ-৫ প্রাপ্তের সংখ্যা" },
      statusField,
    ],
  },
  {
    key: "posts",
    slug: "posts",
    title: "পোস্ট ও সংবাদ",
    subtitle: "নতুন সংবাদ লিখুন, সম্পাদনা ও প্রকাশনা নিয়ন্ত্রণ করুন।",
    columns: [
      { name: "title", label: "শিরোনাম" },
      { name: "category", label: "ক্যাটাগরি" },
      { name: "date", label: "তারিখ" },
    ],
    fields: [
      { name: "title", label: "শিরোনাম", full: true },
      { name: "category", label: "ক্যাটাগরি" },
      { name: "date", label: "তারিখ" },
      { name: "image", label: "ছবির লিংক" },
      { name: "body", label: "বিস্তারিত", type: "textarea", full: true },
      statusField,
    ],
  },
  {
    key: "pages",
    slug: "pages",
    title: "ওয়েব পেজ",
    subtitle: "প্রতিষ্ঠানের ইতিহাস, যোগাযোগসহ সকল পেজ সম্পাদনা করুন।",
    columns: [
      { name: "title", label: "পেজ শিরোনাম" },
      { name: "slug", label: "ইউআরএল" },
    ],
    fields: [
      { name: "title", label: "পেজ শিরোনাম", full: true },
      { name: "slug", label: "পেজ ইউআরএল (ইংরেজি, স্পেস ছাড়া)" },
      { name: "image", label: "ছবির লিংক" },
      { name: "body", label: "বিস্তারিত (বাংলা)", type: "textarea", full: true },
      {
        name: "bodyEn",
        label: "বিস্তারিত (ইংরেজি, না দিলে স্বয়ংক্রিয় অনুবাদ দেখানো হবে)",
        type: "textarea",
        full: true,
      },
      statusField,
    ],
  },
  {
    key: "gallery",
    slug: "gallery",
    title: "ছবির গ্যালারি",
    subtitle: "হোমপেজ ও গ্যালারির ছবি যোগ ও সম্পাদনা করুন।",
    columns: [
      { name: "caption", label: "ক্যাপশন" },
      { name: "src", label: "ছবির লিংক" },
      { name: "showOnHome", label: "হোমপেজ স্লাইডারে দেখান" },
    ],
    fields: [
      { name: "caption", label: "ক্যাপশন", full: true },
      { name: "src", label: "ছবির লিংক (মিডিয়া লাইব্রেরি থেকে)", full: true },
      {
        name: "showOnHome",
        label: "হোমপেজ স্লাইডারে দেখান",
        type: "select",
        options: ["off", "on"],
      },
      statusField,
    ],
  },
];

export function getSection(slug: string) {
  return sections.find((s) => s.slug === slug);
}
