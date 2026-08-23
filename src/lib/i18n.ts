import { useSyncExternalStore } from "react";
import { BN_EN, BN_EN_ENTRIES } from "./dictionary";

export type Lang = "bn" | "en";

const KEY = "cdhs-lang";
let lang: Lang = "bn";
const listeners = new Set<() => void>();
let loaded = false;

function emit() {
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  queueMicrotask(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "en" || saved === "bn") {
      lang = saved;
      document.documentElement.lang = lang;
      emit();
    }
  });
}

export function setLang(next: Lang) {
  lang = next;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, next);
    document.documentElement.lang = next;
  }
  emit();
}

export function toggleLang() {
  setLang(lang === "bn" ? "en" : "bn");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureLoaded();
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
  };
}
