import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Languages, Menu, X } from "lucide-react";
import { navItems, images, school as staticSchool } from "@/lib/site-data";
import { useSettings } from "@/lib/queries/settings";
import { useT, toggleLang } from "@/lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const { t, n, isEn } = useT();
  const school = {
    name: settings["nameBn"] ?? "",
    nameEn: settings["nameEn"] ?? "",
    address: settings["address"] ?? "",
    phone: settings["phone"] ?? "",
    eiin: settings["eiin"] ?? "",
    founded: settings["founded"] || staticSchool.founded,
  };
  const addressEn = "Chhatni Dhekra, Adamdighi, Bogura";

  return (
    <header>
      <div className="border-b border-border bg-muted/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5" /> {t(school.address, addressEn)}
          </span>
          <div className="inline-flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> {n(school.phone)}
            </span>
            <button
              type="button"
              onClick={toggleLang}
              aria-label={isEn ? "বাংলা ভাষায় দেখুন" : "View in English"}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold px-2.5 py-1 font-medium text-gold-foreground transition-opacity hover:opacity-90"
            >
              <Languages className="size-3.5" /> {isEn ? "বাংলা" : "English"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface">
        <div className="relative mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link to="/" className="shrink-0">
            <img src={images.logo} alt={school.name} className="size-14 shrink-0 object-contain" />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold text-brand-deep md:text-3xl">
              {isEn ? school.nameEn : school.name}
            </h1>
            <p className="mt-0.5 text-sm font-semibold tracking-wide text-brand">
              {isEn ? school.name : school.nameEn}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{t(school.address, addressEn)}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-[11px]">
              <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                {t("ইআইআইএন", "EIIN")}: {n(school.eiin)}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                {t("স্থাপিত", "Established")}: {n(school.founded)}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label={open ? t("মেনু বন্ধ করুন", "Close menu") : t("মেনু খুলুন", "Open menu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 rounded-md border border-border p-2.5 text-brand-deep transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <div className="hidden size-14 shrink-0 lg:block" />
        </div>
      </div>

      <nav className="bg-brand-deep">
        <div className="mx-auto hidden max-w-7xl flex-wrap justify-center px-2 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="px-4 py-3 text-sm font-medium text-brand-foreground/90 transition-colors hover:bg-brand"
              activeProps={{ className: "bg-brand text-brand-foreground" }}
            >
              {t(item.label, item.labelEn)}
            </Link>
          ))}
        </div>

        {open ? (
          <div className="flex flex-col px-4 py-2 lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                onClick={() => setOpen(false)}
                className="border-b border-brand-foreground/10 py-3 text-sm font-medium text-brand-foreground/90 last:border-0"
                activeProps={{ className: "text-brand-foreground" }}
              >
                {t(item.label, item.labelEn)}
              </Link>
            ))}
          </div>
        ) : null}
      </nav>
    </header>
  );
}
