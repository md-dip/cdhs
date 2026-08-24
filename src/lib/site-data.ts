import schoolBuilding from "@/assets/school-building.jpg";
import classroom from "@/assets/classroom.jpg";
import assembly from "@/assets/assembly.jpg";
import headmaster from "@/assets/headmaster.jpg";
import logo from "@/assets/logo.png";

export const images = { schoolBuilding, classroom, assembly, headmaster, logo };

export const school = {
  name: "ছাতনী ঢেকড়া উচ্চ বিদ্যালয়",
  nameEn: "CHHATNI DHEKRA HIGH SCHOOL",
  address: "ছাতনী ঢেকড়া, আদমদীঘি, বগুড়া",
  phone: "০১৭২৬২৬০৯৯৬",
  email: "info@chhatnidekhrahs.edu.bd",
  eiin: "১১৯১১৯",
  founded: "১৯৬৯",
  board: "রাজশাহী",
  shift: "দিবা (একক)",
  motto: "শিক্ষাই আলো, শিক্ষাই মুক্তি",
  hours: "শনিবার – বৃহস্পতিবার, সকাল ১০টা – বিকাল ৪টা",
};

export const navItems = [
  { to: "/", label: "প্রচ্ছদ", labelEn: "Home" },
  { to: "/about", label: "প্রতিষ্ঠান পরিচিতি", labelEn: "About" },
  { to: "/notices", label: "নোটিশ বোর্ড", labelEn: "Notices" },
  { to: "/routine", label: "রুটিন", labelEn: "Routine" },
  { to: "/academics", label: "একাডেমিক তথ্য", labelEn: "Academics" },
  { to: "/teachers", label: "শিক্ষকমণ্ডলী", labelEn: "Teachers" },
  { to: "/committee", label: "পরিচালনা পর্ষদ", labelEn: "Committee" },
  { to: "/gallery", label: "গ্যালারি", labelEn: "Gallery" },
  { to: "/contact", label: "যোগাযোগ", labelEn: "Contact" },
] as const;

export const slides = [
  { src: schoolBuilding, caption: "আমাদের বিদ্যালয় ভবন", captionEn: "Our school building" },
  { src: classroom, caption: "শ্রেণিকক্ষে পাঠদান", captionEn: "Teaching in the classroom" },
  { src: assembly, caption: "প্রাত্যহিক সমাবেশ", captionEn: "Daily assembly" },
];

export const facilities = [
  "সমৃদ্ধ পাঠাগার ও পাঠকক্ষ",
  "বিজ্ঞান গবেষণাগার",
  "মাল্টিমিডিয়া শ্রেণিকক্ষ ও কম্পিউটার ল্যাব",
  "বিস্তৃত খেলার মাঠ",
  "ছাত্রী কমনরুম ও বিশুদ্ধ পানির ব্যবস্থা",
  "স্কাউট, বিএনসিসি ও সাংস্কৃতিক কার্যক্রম",
];

// The "www." variants of these .gov.bd domains serve an invalid/mismatched TLS
// certificate (browsers block them outright); the bare domains have a valid cert.
// educationboard.gov.bd doesn't serve HTTPS at all, valid cert or not — http only.
export const importantSites = [
  { label: "শিক্ষা মন্ত্রণালয়", href: "https://moedu.gov.bd" },
  { label: "মাউশি", href: "https://dshe.gov.bd" },
  { label: "শিক্ষা বোর্ড", href: "http://educationboard.gov.bd" },
  { label: "এনসিটিবি", href: "https://nctb.gov.bd" },
];

export const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
