// ثوابت وأنواع مشتركة بين المتجر ولوحة التحكم (من غير أي اتصال بالقاعدة)
export const CATEGORIES = [
  { key: "pc", label: "PC" },
  { key: "laptops", label: "لابتوب" },
  { key: "hardware", label: "هاردوير" },
  { key: "accessories", label: "إكسسوار" },
  { key: "monitors", label: "شاشة" },
] as const;

export type Category = (typeof CATEGORIES)[number]["key"];

export const categoryLabel = (key: string) =>
  CATEGORIES.find((c) => c.key === key)?.label ?? key;

export type Product = {
  _id?: string;
  name: string;
  category: Category;
  price: number;
  oldPrice?: number | null;
  description: string;
  image: string;
  badge?: string | null;
  specs?: string[];
  isNew?: boolean;
  offer?: boolean;
  available?: boolean;
};

// فلاتر المتجر
export const FILTERS = [
  { key: "all", label: "All" },
  { key: "pc", label: "PC" },
  { key: "laptops", label: "Laptops" },
  { key: "hardware", label: "Hardware" },
  { key: "accessories", label: "Accessories" },
  { key: "monitors", label: "Monitors" },
  { key: "new", label: "New" },
  { key: "offers", label: "Offers" },
] as const;

export type FilterKey = (typeof FILTERS)[number]["key"];

// المنتج متاح إلا لو اتحدد صراحة إنه منتهي (المنتجات القديمة من غير الحقل تفضل متاحة)
export const isAvailable = (p: Product) => p.available !== false;
// "جديد": بالعلامة أو لو الشارة مكتوب فيها "جديد"
export const isNewProduct = (p: Product) =>
  Boolean(p.isNew) || p.badge?.trim() === "جديد";
// "عروض": بالعلامة أو لو السعر القديم أعلى من الحالي
export const isOfferProduct = (p: Product) =>
  Boolean(p.offer) || (Number(p.oldPrice) > 0 && Number(p.oldPrice) > p.price);

export function matchesFilter(p: Product, filter: FilterKey) {
  if (filter === "all") return true;
  if (filter === "new") return isNewProduct(p);
  if (filter === "offers") return isOfferProduct(p);
  return p.category === filter;
}
