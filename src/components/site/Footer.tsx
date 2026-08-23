import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import { school, images, importantSites } from "@/lib/site-data";
import { useT } from "@/lib/i18n";
import { useSettings } from "@/lib/queries/settings";

const quickLinks = [
  { to: "/notices", label: "নোটিশ বোর্ড", labelEn: "Notices" },
  { to: "/routine", label: "রুটিন", labelEn: "Routine" },
  { to: "/academics", label: "একাডেমিক তথ্য", labelEn: "Academics" },
  { to: "/committee", label: "পরিচালনা পর্ষদ", labelEn: "Committee" },
  { to: "/contact", label: "যোগাযোগ", labelEn: "Contact" },
  { to: "/tt-prodhan", label: "অ্যাডমিন লগইন", labelEn: "Admin login" },
] as const;

export function Footer() {
  const { t, n, tx, isEn } = useT();
  const settings = useSettings();
  const name = isEn ? (settings["nameEn"] ?? school.nameEn) : (settings["nameBn"] ?? school.name);

  return (
    <footer className="mt-16 bg-brand-deep text-brand-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <img src={images.logo} alt="" className="size-12 object-contain" />
          <h3 className="mt-4 text-lg font-bold">{name}</h3>
          <p className="mt-2 text-sm text-brand-foreground/70">
            {tx(settings["motto"] || school.motto)}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">{t("দ্রুত লিংক", "Quick links")}</h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-foreground/80">
            {quickLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-gold">
                  {t(l.label, l.labelEn)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">
            {t("গুরুত্বপূর্ণ ওয়েবসাইট", "Important websites")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-brand-foreground/80">
            {importantSites.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-gold">
                  {tx(s.label)}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">{t("যোগাযোগ", "Contact")}</h3>
          <ul className="mt-4 space-y-3 text-sm text-brand-foreground/80">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {t(school.address, "Chhatni Dekhra, Adamdighi, Bogura")}
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0" />
              {n(settings["phone"] ?? school.phone)}
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0" />
              {settings["email"] ?? school.email}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-foreground/15 py-4 text-center text-xs text-brand-foreground/70">
        © {n("২০২৬")} {name}. {t("সর্বস্বত্ব সংরক্ষিত", "All rights reserved")}
        <span className="mx-2 opacity-40">|</span>
        <a
          href="https://wa.me/+8801647802658"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 hover:text-gold"
        >
          {t("ডেভেলপারের সাথে যোগাযোগ", "Contact developer")}
        </a>
      </div>
    </footer>
  );
}
