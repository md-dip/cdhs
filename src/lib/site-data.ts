import schoolBuilding from "@/assets/school-building.jpg";
import classroom from "@/assets/classroom.jpg";
import assembly from "@/assets/assembly.jpg";
import headmaster from "@/assets/headmaster.jpg";
import logo from "@/assets/logo.png";

export const images = { schoolBuilding, classroom, assembly, headmaster, logo };

export const school = {
  name: "ছাতনী ঢেকড়া উচ্চ বিদ্যালয়",
  nameEn: "CHHATNI DEKHRA HIGH SCHOOL",
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
  { src: schoolBuilding, caption: "আমাদের বিদ্যালয় ভবন" },
  { src: classroom, caption: "শ্রেণিকক্ষে পাঠদান" },
  { src: assembly, caption: "প্রাত্যহিক সমাবেশ" },
];

export const stats = [
  { value: "৮৪২", label: "শিক্ষার্থী", labelEn: "Students" },
  { value: "২৭", label: "শিক্ষক ও কর্মচারী", labelEn: "Teachers & Staff" },
  { value: "১৮", label: "শ্রেণিকক্ষ", labelEn: "Classrooms" },
  { value: "৯৭", label: "পাসের হার (%)", labelEn: "Pass rate (%)" },
];

export const results = [
  { year: "২০২৫", exam: "এসএসসি", appeared: "১৪৮", passed: "১৪৩", gpa5: "২১" },
  { year: "২০২৪", exam: "এসএসসি", appeared: "১৩৯", passed: "১৩১", gpa5: "১৭" },
  { year: "২০২৩", exam: "এসএসসি", appeared: "১৪৫", passed: "১৩৪", gpa5: "১৪" },
];

export const classSeats = [
  { name: "ষষ্ঠ শ্রেণি", seats: "১২০", group: "সাধারণ" },
  { name: "সপ্তম শ্রেণি", seats: "১২০", group: "সাধারণ" },
  { name: "অষ্টম শ্রেণি", seats: "১২০", group: "সাধারণ" },
  { name: "নবম শ্রেণি", seats: "১৫০", group: "বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা" },
  { name: "দশম শ্রেণি", seats: "১৫০", group: "বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা" },
];

export const books = [
  ["বাংলা ১ম পত্র", "১০১"],
  ["বাংলা ২য় পত্র", "১০২"],
  ["ইংরেজি ১ম পত্র", "১০৭"],
  ["ইংরেজি ২য় পত্র", "১০৮"],
  ["গণিত", "১০৯"],
  ["পদার্থবিজ্ঞান", "১২৭"],
  ["রসায়ন", "১৩৭"],
  ["জীববিজ্ঞান", "১৩৮"],
  ["ইসলাম ও নৈতিক শিক্ষা", "১৫০"],
  ["বাংলাদেশ ও বিশ্বপরিচয়", "১৫৪"],
  ["ব্যবসায় উদ্যোগ", "১৪৬"],
  ["তথ্য ও যোগাযোগ প্রযুক্তি", "১৫৪"],
];

export const admissionSteps = [
  "শিক্ষাবর্ষ ও শ্রেণি নির্বাচন করে সকল তথ্য সঠিকভাবে পূরণ করুন।",
  "আবেদন ফরম ডাউনলোড করে যে বিষয়ে ভর্তি হবেন তা চিহ্নিত করুন।",
  "প্রিন্ট কপি, জন্ম নিবন্ধন ও পূর্ববর্তী শ্রেণির ফলাফলসহ অফিসে জমা দিন।",
  "আবেদন যাচাই শেষে অনুমোদিত হলে ভর্তি রোল প্রদান করা হবে।",
];

export const facilities = [
  "সমৃদ্ধ পাঠাগার ও পাঠকক্ষ",
  "বিজ্ঞান গবেষণাগার",
  "মাল্টিমিডিয়া শ্রেণিকক্ষ ও কম্পিউটার ল্যাব",
  "বিস্তৃত খেলার মাঠ",
  "ছাত্রী কমনরুম ও বিশুদ্ধ পানির ব্যবস্থা",
  "স্কাউট, বিএনসিসি ও সাংস্কৃতিক কার্যক্রম",
];

export const importantSites = [
  { label: "শিক্ষা মন্ত্রণালয়", href: "https://www.moedu.gov.bd" },
  { label: "মাউশি", href: "https://www.dshe.gov.bd" },
  { label: "শিক্ষা বোর্ড", href: "https://www.educationboard.gov.bd" },
  { label: "এনসিটিবি", href: "https://www.nctb.gov.bd" },
];

export const bengaliDigits = ["১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
