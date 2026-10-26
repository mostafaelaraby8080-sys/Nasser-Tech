"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  LockKeyhole,
  ArrowRight,
  Pencil,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  CATEGORIES,
  categoryLabel,
  isAvailable,
  type Product,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const empty = {
  name: "",
  category: "laptops" as Product["category"],
  price: "",
  oldPrice: "",
  description: "",
  image: "",
  badge: "",
  specs: "",
  isNew: false,
  offer: false,
  available: true,
};
type FormState = typeof empty;

// يصغّر الصورة ويحوّلها JPEG خفيف عشان تتحفظ بسرعة ومتتقلش على الموقع
function fileToDataUrl(file: File, maxSize = 1000, quality = 0.82) {
  return new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const load = () =>
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  useEffect(() => {
    load();
  }, []);

  // المنتج بالشكل اللي هيظهر بيه في المتجر (معاينة مباشرة)
  const previewProduct: Product = useMemo(
    () => ({
      name: form.name,
      category: form.category,
      price: Number(form.price) || 0,
      oldPrice: Number(form.oldPrice) || undefined,
      description: form.description,
      image: form.image,
      badge: form.badge.trim() || undefined,
      specs: form.specs
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      isNew: form.isNew,
      offer: form.offer,
      available: form.available,
    }),
    [form],
  );

  function sessionExpired() {
    setLogged(false);
    setMessage("انتهت الجلسة، سجّل الدخول من جديد");
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setLogged(true);
      setMessage("");
    } else setMessage("كلمة المرور غير صحيحة");
  }
  async function pickImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("اختار ملف صورة بس");
      return;
    }
    try {
      const image = await fileToDataUrl(file);
      setForm((f) => ({ ...f, image }));
      setMessage("");
    } catch {
      setMessage("تعذر قراءة الصورة، جرّب صورة تانية");
    }
  }
  function startEdit(p: Product) {
    setEditingId(p._id ?? null);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      description: p.description,
      image: p.image,
      badge: p.badge ?? "",
      specs: (p.specs ?? []).join(", "),
      isNew: Boolean(p.isNew),
      offer: Boolean(p.offer),
      available: isAvailable(p),
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
    setMessage("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setMessage("اختار صورة المنتج الأول");
      return;
    }
    const body = JSON.stringify({
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined,
      specs: form.specs
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    });
    setBusy("save");
    try {
      const r = await fetch(
        editingId ? `/api/products?id=${editingId}` : "/api/products",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body,
        },
      );
      if (r.ok) {
        setMessage(editingId ? "تم حفظ التعديلات" : "تمت إضافة المنتج");
        setEditingId(null);
        setForm(empty);
        await load();
      } else if (r.status === 401) sessionExpired();
      else setMessage((await r.json()).error || "تعذر حفظ المنتج");
    } catch {
      setMessage("تعذر الاتصال، حاول تاني");
    } finally {
      setBusy("");
    }
  }
  async function toggleAvailable(p: Product) {
    if (!p._id) return;
    const next = !isAvailable(p);
    setBusy(p._id);
    try {
      const r = await fetch(`/api/products?id=${p._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: next }),
      });
      if (r.ok) {
        setProducts((list) =>
          list.map((x) => (x._id === p._id ? { ...x, available: next } : x)),
        );
        if (editingId === p._id) setForm((f) => ({ ...f, available: next }));
        setMessage(next ? "المنتج بقى متاح" : "المنتج بقى منتهي");
      } else if (r.status === 401) sessionExpired();
      else setMessage((await r.json()).error || "تعذر تحديث الحالة");
    } catch {
      setMessage("تعذر الاتصال، حاول تاني");
    } finally {
      setBusy("");
    }
  }
  async function remove(p: Product) {
    if (!p._id) return;
    // ضغطة أولى = تأكيد، ضغطة تانية = حذف فعلي (من غير نافذة confirm)
    if (confirmId !== p._id) {
      setConfirmId(p._id);
      setTimeout(() => setConfirmId((c) => (c === p._id ? null : c)), 4000);
      return;
    }
    setConfirmId(null);
    setBusy(p._id);
    try {
      const r = await fetch(`/api/products?id=${p._id}`, { method: "DELETE" });
      if (r.ok) {
        if (editingId === p._id) cancelEdit();
        setMessage("تم حذف المنتج");
        await load();
      } else if (r.status === 401) sessionExpired();
      else setMessage((await r.json()).error || "تعذر حذف المنتج");
    } catch {
      setMessage("تعذر الاتصال، حاول تاني");
    } finally {
      setBusy("");
    }
  }
  if (!logged)
    return (
      <main dir="rtl" className="admin-page">
        <Link href="/" className="back-link">
          <ArrowRight /> العودة للمتجر
        </Link>
        <form className="admin-login" onSubmit={login}>
          <LockKeyhole />
          <h1>دخول الإدارة</h1>
          <p>أدخل كلمة المرور لإدارة منتجات ناصر تك.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            required
          />
          <button className="button primary">دخول آمن</button>
          {message && <small className="error">{message}</small>}
        </form>
      </main>
    );
  return (
    <main dir="rtl" className="admin-page">
      <div className="admin-top">
        <div>
          <p className="eyebrow">لوحة التحكم</p>
          <h1>إدارة المنتجات</h1>
        </div>
        <Link href="/" className="button quiet">
          مشاهدة المتجر
        </Link>
      </div>
      <div className="admin-grid">
        <form className="admin-form" onSubmit={save}>
          <h2>
            {editingId ? <Pencil /> : <Plus />}{" "}
            {editingId ? "تعديل المنتج" : "إضافة منتج"}
          </h2>
          {editingId && (
            <div className="edit-banner">
              أنت بتعدّل منتج موجود — التعديل بيتحفظ على نفس المنتج.
              <button type="button" onClick={cancelEdit}>
                <X /> إلغاء التعديل
              </button>
            </div>
          )}
          {[
            ["name", "اسم المنتج"],
            ["price", "السعر"],
            ["oldPrice", "السعر قبل الخصم (اختياري — لو كتبته المنتج يظهر في العروض)"],
            ["badge", "شارة اختيارية"],
            ["specs", "المواصفات — افصل بفاصلة"],
          ].map(([key, label]) => (
            <input
              key={key}
              value={form[key as "name" | "price" | "oldPrice" | "badge" | "specs"]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              inputMode={key === "price" || key === "oldPrice" ? "numeric" : undefined}
              required={key === "name" || key === "price"}
            />
          ))}
          <label className="image-picker">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                pickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="معاينة الصورة" />
            ) : (
              <span>اختار صورة المنتج من الجهاز أو المعرض</span>
            )}
          </label>
          {form.image && (
            <button
              type="button"
              className="button quiet"
              onClick={() => setForm({ ...form, image: "" })}
            >
              {editingId ? "تغيير الصورة" : "إزالة الصورة"}
            </button>
          )}
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value as Product["category"],
              })
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="وصف قصير"
            required
          />
          <div className="admin-flags">
            <label className="flag-row">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              <span>
                المنتج <b>{form.available ? "متاح" : "منتهي"}</b>
              </span>
            </label>
            <label className="flag-row">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              />
              <span>يظهر في فلتر «جديد»</span>
            </label>
            <label className="flag-row">
              <input
                type="checkbox"
                checked={form.offer}
                onChange={(e) => setForm({ ...form, offer: e.target.checked })}
              />
              <span>يظهر في فلتر «عروض»</span>
            </label>
          </div>
          <div className="admin-preview">
            <p>
              <Eye /> معاينة — كده هيظهر في المتجر
            </p>
            <ProductCard product={previewProduct} preview />
          </div>
          <button className="button primary" disabled={busy === "save"}>
            {busy === "save"
              ? "جارٍ الحفظ..."
              : editingId
                ? "حفظ التعديلات"
                : "حفظ المنتج"}
          </button>
          {message && <small>{message}</small>}
        </form>
        <section className="admin-list">
          <h2>
            المنتجات الحالية <span>{products.length}</span>
          </h2>
          {message && <small className="admin-msg">{message}</small>}
          {products.length === 0 && (
            <p className="admin-empty">
              مفيش منتجات دلوقتي. ضيف منتج من النموذج.
            </p>
          )}
          {products.map((p) => {
            const available = isAvailable(p);
            return (
              <div
                className={`admin-item${editingId === p._id ? " editing" : ""}`}
                key={p._id || p.name}
              >
                <div>
                  <strong>{p.name}</strong>
                  <small>
                    {categoryLabel(p.category)} ·{" "}
                    {p.price.toLocaleString("ar-EG")} ج.م
                  </small>
                  <span className={`stock-pill ${available ? "in" : "out"}`}>
                    {available ? "متاح" : "منتهي"}
                  </span>
                </div>
                <div className="admin-actions">
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => startEdit(p)}
                    disabled={!p._id}
                  >
                    <Pencil /> تعديل
                  </button>
                  <button
                    type="button"
                    className="stock-btn"
                    onClick={() => toggleAvailable(p)}
                    disabled={!p._id || busy === p._id}
                  >
                    {available ? "تحديد كمنتهي" : "تحديد كمتاح"}
                  </button>
                  <button
                    type="button"
                    className={`delete-btn${confirmId === p._id ? " confirm" : ""}`}
                    onClick={() => remove(p)}
                    disabled={!p._id || busy === p._id}
                    aria-label={`حذف ${p.name}`}
                  >
                    <Trash2 />{" "}
                    {busy === p._id
                      ? "..."
                      : confirmId === p._id
                        ? "تأكيد الحذف؟"
                        : "حذف"}
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
