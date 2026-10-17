import { NextResponse } from "next/server";
import {
  getProducts,
  normalizeProduct,
  productsCollection,
  publicProduct,
  ensureMongo,
  toObjectId,
} from "@/lib/mongodb";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products.map(publicProduct));
}

export async function POST(request: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  try {
    const product = normalizeProduct(await request.json());
    await ensureMongo();
    const result = await productsCollection().insertOne(product);
    return NextResponse.json(
      { ...product, _id: result.insertedId.toString() },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر حفظ المنتج" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
  await ensureMongo();
  await productsCollection().deleteOne({ _id: toObjectId(id) as never });
  return NextResponse.json({ ok: true });
}
