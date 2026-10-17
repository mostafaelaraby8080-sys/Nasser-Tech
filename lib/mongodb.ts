import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured");

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };
export const mongoClient = globalForMongo.mongoClient ?? new MongoClient(uri);
if (process.env.NODE_ENV !== "production")
  globalForMongo.mongoClient = mongoClient;

export const productsCollection = () =>
  mongoClient.db("nasser-tech").collection<Product>("products");

export type Product = {
  _id?: string;
  name: string;
  category: "laptops" | "accessories";
  price: number;
  oldPrice?: number;
  description: string;
  image: string;
  badge?: string;
  specs?: string[];
  createdAt: Date;
};

export const demoProducts: Product[] = [
  {
    name: "Dell Latitude 5580",
    category: "laptops",
    price: 12900,
    oldPrice: 14500,
    description: "لابتوب عملي بمعالج Core i7 وأداء ثابت للعمل والدراسة.",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=85",
    badge: "الأكثر مبيعًا",
    specs: ["Core i7", "RAM 16GB", "SSD 512GB"],
    createdAt: new Date(),
  },
  {
    name: "Lenovo ThinkPad T480",
    category: "laptops",
    price: 11400,
    description: "تصميم متين وبطارية ممتازة للاستخدام اليومي.",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
    specs: ["Core i5", "RAM 8GB", "SSD 256GB"],
    createdAt: new Date(),
  },
  {
    name: "Wireless Mouse M185",
    category: "accessories",
    price: 450,
    description: "ماوس لاسلكي خفيف وسلس للاستخدام المكتبي.",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=85",
    badge: "جديد",
    specs: ["لاسلكي", "عمر طويل"],
    createdAt: new Date(),
  },
  {
    name: "Laptop Backpack",
    category: "accessories",
    price: 700,
    description: "شنطة لابتوب مبطنة بمساحات عملية.",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    specs: ["حتى 15.6 بوصة", "مقاومة للماء"],
    createdAt: new Date(),
  },
];

export async function getProducts() {
  const col = productsCollection();
  const meta = mongoClient.db("nasser-tech").collection("meta");
  // أول مرة بس: لو القاعدة فاضية نحط المنتجات التجريبية جوه القاعدة نفسها عشان تتحذف من لوحة الإدارة
  const seeded = await meta.findOne({ _id: "seeded" } as never);
  if (!seeded) {
    if ((await col.countDocuments()) === 0)
      await col.insertMany(demoProducts.map((p) => ({ ...p })) as never);
    await meta.updateOne(
      { _id: "seeded" } as never,
      { $set: { at: new Date() } },
      { upsert: true },
    );
  }
  return col.find({}).sort({ createdAt: -1 }).toArray();
}

export function serializeProduct(product: Product) {
  return { ...product, _id: product._id?.toString() };
}

export function isValidCategory(value: unknown): value is Product["category"] {
  return value === "laptops" || value === "accessories";
}

export function normalizeProduct(input: Partial<Product>): Product {
  if (
    !input.name ||
    !isValidCategory(input.category) ||
    !input.description ||
    !input.image
  )
    throw new Error("بيانات المنتج غير مكتملة");
  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("السعر غير صالح");
  return {
    name: input.name.trim(),
    category: input.category,
    price,
    oldPrice: input.oldPrice ? Number(input.oldPrice) : undefined,
    description: input.description.trim(),
    image: input.image.trim(),
    badge: input.badge?.trim(),
    specs: input.specs ?? [],
    createdAt: new Date(),
  };
}

export async function ensureMongo() {
  await mongoClient.connect();
}

export function publicProduct(product: Product) {
  return serializeProduct(product);
}

export function productId(id: string) {
  return id;
}

export function toObjectId(id: string) {
  return new ObjectId(id);
}
