
import { CabinStatus, Role } from "./types";

export const CABIN_DEFINITIONS = [
  { name: "شوکا", icon: "Mountain" },
  { name: "میچکا", icon: "Bird" },
  { name: "پاپلی", icon: "Flower" },
  { name: "اوپاچ", icon: "Cloud" },
  { name: "زیک", icon: "Feather" },
  { name: "سرخدار", icon: "TreePine" },
  { name: "شمشاد", icon: "TreeDeciduous" },
  { name: "مرال", icon: "Crown" },
  { name: "نمازین", icon: "Sun" }
];

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: "مدیریت کل",
  [Role.RECEPTION]: "پذیرش",
  [Role.HOUSEKEEPING]: "خانه‌داری",
  [Role.MAINTENANCE]: "تاسیسات و فنی",
  [Role.WAREHOUSE]: "انبارداری",
  [Role.ACCOUNTANT]: "حسابداری",
  [Role.SUPERVISOR]: "سرپرست شیفت",
};

export const ROLE_THEMES: Record<Role, string> = {
  [Role.ADMIN]: "brand",
  [Role.RECEPTION]: "blue",
  [Role.HOUSEKEEPING]: "emerald",
  [Role.MAINTENANCE]: "orange",
  [Role.WAREHOUSE]: "teal",
  [Role.ACCOUNTANT]: "indigo",
  [Role.SUPERVISOR]: "slate",
};

export const STATUS_LABELS: Record<CabinStatus, string> = {
  [CabinStatus.OCCUPIED]: "پر (مهمان دارد)",
  [CabinStatus.EMPTY_DIRTY]: "خالی (نظافت نشده)",
  [CabinStatus.EMPTY_CLEAN]: "خالی (آماده)",
  [CabinStatus.ISSUE_TECH]: "مشکل فنی",
  [CabinStatus.ISSUE_CLEAN]: "مشکل نظافتی",
  [CabinStatus.UNDER_MAINTENANCE]: "در حال بررسی",
};

export const STATUS_COLORS: Record<CabinStatus, string> = {
  [CabinStatus.OCCUPIED]: "bg-red-50 text-red-900 border-red-200",
  [CabinStatus.EMPTY_DIRTY]: "bg-orange-50 text-orange-900 border-orange-200",
  [CabinStatus.EMPTY_CLEAN]: "bg-emerald-50 text-emerald-900 border-emerald-200",
  [CabinStatus.ISSUE_TECH]: "bg-slate-900 text-white border-slate-700",
  [CabinStatus.ISSUE_CLEAN]: "bg-amber-50 text-amber-900 border-amber-200",
  [CabinStatus.UNDER_MAINTENANCE]: "bg-blue-50 text-blue-900 border-blue-200",
};

export const CLEANING_ITEMS = [
    "شست‌وشوی ظروف و نظافت سینک",
    "پُر بودن مایع ظرفشویی و دستشویی",
    "شست‌وشوی سرویس بهداشتی و شیرآلات",
    "خالی بودن سطل زباله‌ها",
    "بررسی روتختی، روبالشی و لوازم خواب",
    "عدم وجود تار عنکبوت (سقف/سرویس)",
    "بررسی بوی مطبوع کلبه",
    "تکمیل ظروف کلبه و یخچال",
    "موجودی: کبریت، چای، ملحفه، نمک، فلفل",
    "نظافت مبل، فرش و کف اتاق",
    "نظافت پرده و شیشه‌ها",
    "نظافت یخچال و عدم برفک‌زدگی",
    "گردگیری کامل (تلویزیون، میز، آینه)",
    "نظافت دمپایی و جا کفشی",
    "تکمیل هیزم، زغال و نفت",
    "نظافت حیاط، کتری، قوری و باربیکیو"
];
