import { MongoClient, ObjectId } from "mongodb";
import { normalizeCategory, type Product as SharedProduct } from "@/lib/catalog";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
  mongoUri?: string;
};

export function getMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!globalForMongo.mongoClient || globalForMongo.mongoUri !== uri) {
    globalForMongo.mongoClient = new MongoClient(uri);
    globalForMongo.mongoUri = uri;
  }
  return globalForMongo.mongoClient;
}

export const productsCollection = () =>
  getMongoClient().db("nasser-tech").collection<Product>("products");

export type Product = Omit<SharedProduct, "_id"> & {
  _id?: string;
  createdAt: Date;
};

export async function getProducts() {
  await ensureMongo();
  return productsCollection().find({}).sort({ createdAt: -1 }).toArray();
}

export function serializeProduct(product: Product) {
  return { ...product, _id: product._id?.toString() };
}

export function isValidCategory(value: unknown): value is Product["category"] {
  return typeof value === "string" &&
    ["electrical-appliances", "home-tools"].includes(value);
}

// بيرجّع بيانات المنتج نضيفة (من غير createdAt) — بتستخدم في الإضافة والتعديل
export function normalizeProduct(
  input: Partial<Product>,
): Omit<Product, "createdAt"> {
  if (
    !input.name ||
    !isValidCategory(input.category) ||
    !input.description ||
    !input.image
  )
    throw new Error("بيانات المنتج غير مكتملة");
  const price = Number(input.price);
  if (!Number.isFinite(price) || price <= 0) throw new Error("السعر غير صالح");
  const oldPrice = Number(input.oldPrice);
  const badge = input.badge?.trim();
  return {
    name: input.name.trim(),
    category: input.category,
    price,
    ...(Number.isFinite(oldPrice) && oldPrice > 0 ? { oldPrice } : {}),
    description: input.description.trim(),
    image: input.image.trim(),
    ...(badge ? { badge } : {}),
    specs: Array.isArray(input.specs)
      ? input.specs.map((x) => String(x).trim()).filter(Boolean)
      : [],
    isNew: Boolean(input.isNew),
    offer: Boolean(input.offer),
    available: input.available !== false,
  };
}

export async function ensureMongo() {
  await getMongoClient().connect();
}

export function publicProduct(product: Product) {
  return {
    ...serializeProduct(product),
    category: normalizeCategory(String(product.category)),
  };
}

export function productId(id: string) {
  return id;
}

export function toObjectId(id: string) {
  return new ObjectId(id);
}
