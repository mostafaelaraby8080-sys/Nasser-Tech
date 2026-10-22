"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, LockKeyhole, ArrowRight } from "lucide-react";
import Link from "next/link";

type Product = {
  _id?: string;
  name: string;
  category: "laptops" | "accessories";
  price: number;
  description: string;
  image: string;
  badge?: string;
  specs?: string[];
};
const empty = {
  name: "",
  category: "laptops" as const,
  price: "",
  description: "",
  image: "",
  badge: "",
  specs: "",
};

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
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");
  const load = () =>
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  useEffect(() => {
    load();
  }, []);
  async function login(e: FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (r.ok) setLogged(true);
    else setMessage("كلمة المرور غير صحيحة");
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
  async function add(e: FormEvent) {
    e.preventDefault();
    if (!form.image) {
      setMessage("اختار صورة المنتج الأول");
      return;
    }
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        specs: form.specs
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      }),
    });
    if (r.ok) {
      setForm(empty);
      setMessage("تمت إضافة المنتج");
      load();
    } else setMessage((await r.json()).error);
  }
  async function remove(p: Product) {
    if (!p._id || !confirm(`حذف "${p.name}" نهائيًا؟`)) return;
    setBusy(p._id);
    try {
      const r = await fetch(`/api/products?id=${p._id}`, { method: "DELETE" });
      if (r.ok) {
        setMessage("تم حذف المنتج");
        await load();
      } else if (r.status === 401) {
        setLogged(false);
        setMessage("انتهت الجلسة، سجّل الدخول من جديد");
      } else setMessage((await r.json()).error || "تعذر حذف المنتج");
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
        <form className="admin-form" onSubmit={add}>
          <h2>
            <Plus /> إضافة منتج
          </h2>
          {[
            ["name", "اسم المنتج"],
            ["price", "السعر"],
            ["badge", "شارة اختيارية"],
            ["specs", "المواصفات — افصل بفاصلة"],
          ].map(([key, label]) => (
            <input
              key={key}
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={label}
              required={key !== "badge" && key !== "specs"}
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
              إزالة الصورة
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
            <option value="laptops">لابتوب</option>
            <option value="accessories">إكسسوار</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="وصف قصير"
            required
          />
          <button className="button primary">حفظ المنتج</button>
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
          {products.map((p) => (
            <div className="admin-item" key={p._id || p.name}>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.category === "laptops" ? "لابتوب" : "إكسسوار"} ·{" "}
                  {p.price.toLocaleString("ar-EG")} ج.م
                </small>
              </div>
              <button
                type="button"
                className="delete-btn"
                onClick={() => remove(p)}
                disabled={!p._id || busy === p._id}
                aria-label={`حذف ${p.name}`}
              >
                <Trash2 /> {busy === p._id ? "جارٍ الحذف..." : "حذف"}
              </button>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
