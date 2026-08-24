import { useSyncExternalStore } from "react";
import { BN_EN, BN_EN_ENTRIES } from "./dictionary";

export type Lang = "bn" | "en";

// Deliberately not persisted anywhere (no localStorage) — every fresh load of
// the site starts in Bengali. Switching to English only lasts for the current
// visit; reloading or coming back later always starts Bengali again.
let lang: Lang = "bn";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function setLang(next: Lang) {
  lang = next;
  if (typeof window !== "undefined") {
    document.documentElement.lang = next;
  }
  emit();
}

export function toggleLang() {
  setLang(lang === "bn" ? "en" : "bn");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useLang(): Lang {
  return useSyncExternalStore(
    subscribe,
    () => lang,
    () => "bn" as Lang,
  );
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

export function toEnDigits(value: string) {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

export function toBnDigits(value: string) {
  return value.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

const BN_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

/**
 * "২৪ আগস্ট, ২০২৬" for right now, in Asia/Dhaka (not the admin's device timezone) — matches
 * the format admins already type into date fields by hand, so tx()/n() display it correctly.
 */
export function formatTodayBn(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = toBnDigits(get("day"));
  const month = BN_MONTHS[Number(get("month")) - 1] ?? "";
  const year = toBnDigits(get("year"));
  return `${day} ${month}, ${year}`;
}

export function translate(text: string): string {
  if (!text) return text;
  const trimmed = text.trim();
  const exact = BN_EN[trimmed];
  if (exact) return exact;
  let out = trimmed;
  for (const [bn, en] of BN_EN_ENTRIES) {
    if (out.includes(bn)) out = out.split(bn).join(en);
  }
  return toEnDigits(out);
}

export function useT() {
  const current = useLang();
  return {
    lang: current,
    isEn: current === "en",
    t: (bn: string, en: string) => (current === "en" ? en : bn),
    n: (value: string | number) =>
      current === "en" ? toEnDigits(String(value)) : toBnDigits(String(value)),
    tx: (value: string) => (current === "en" ? translate(String(value)) : String(value)),
    // For admin-entered bilingual content (a Bengali version plus an optional
    // English one): use the real English text if the admin wrote it, otherwise
    // fall back to auto-translating the Bengali rather than showing nothing.
    bt: (bn: string, en: string) => (current === "en" ? en || translate(bn) : bn),
  };
}
