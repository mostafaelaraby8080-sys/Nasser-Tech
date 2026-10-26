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

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ error: "غير مصرح" }, { status: 401 });

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products.map(publicProduct));
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const product = { ...normalizeProduct(await request.json()), createdAt: new Date() };
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

// تعديل منتج موجود (من غير حذفه وإضافته من جديد)
export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
  try {
    const data = normalizeProduct(await request.json());
    // الحقول الاختيارية اللي اتفضّت بتتشال من المنتج
    const unset: Record<string, ""> = {};
    if (data.oldPrice === undefined) unset.oldPrice = "";
    if (data.badge === undefined) unset.badge = "";
    await ensureMongo();
    const result = await productsCollection().updateOne(
      { _id: toObjectId(id) as never },
      {
        $set: data,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      } as never,
    );
    if (!result.matchedCount)
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    return NextResponse.json({ ...data, _id: id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر تعديل المنتج" },
      { status: 400 },
    );
  }
}

// تغيير سريع لحالة التوفر (متاح / منتهي)
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
  try {
    const { available } = await request.json();
    await ensureMongo();
    const result = await productsCollection().updateOne(
      { _id: toObjectId(id) as never },
      { $set: { available: available !== false } },
    );
    if (!result.matchedCount)
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    return NextResponse.json({ ok: true, available: available !== false });
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الحالة" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "معرّف المنتج مطلوب" }, { status: 400 });
  await ensureMongo();
  await productsCollection().deleteOne({ _id: toObjectId(id) as never });
  return NextResponse.json({ ok: true });
}
