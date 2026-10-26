"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  ShieldCheck,
  MessageCircle,
  SlidersHorizontal,
} from "lucide-react";
import {
  FILTERS,
  isAvailable,
  matchesFilter,
  type FilterKey,
  type Product,
} from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

const whatsapp = "201050942509";
const slides = [
  "/bg/slide-1.jpg",
  "/bg/slide-2.jpg",
  "/bg/slide-3.jpg",
  "/bg/slide-4.jpg",
];
const landline = "0572257760";
const mobile = "01050942509";
const phone = "+201050942509";
const tiktok = "https://www.tiktok.com/@nasser.tech?_r=1&_t=ZS-9AdApOW4tpn";
const facebook = "https://www.facebook.com/share/1Hz5n1NimX/";
const designerUrl =
  "https://www.facebook.com/profile.php?id=61594662582257&locale=ar_AR";
// حط هنا https://m.me/<اسم-أو-ID-الصفحة> لما تعرفه؛ لحد وقتها بيفتح صفحة الفيسبوك (فيها زرار Message)
const messenger = facebook;
const ic = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  "aria-hidden": true,
} as const;
const WhatsAppIcon = () => (
  <svg {...ic}>
    <path d="M3 21l1.65-4.8A9 9 0 1 1 8 19.5L3 21z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-.8.8c-1-.4-1.8-1.2-2.2-2.2l.8-.8-1-2L9 9.5z" />
  </svg>
);
const PhoneIcon = () => (
  <svg {...ic}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const TikTokIcon = () => (
  <svg {...ic}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
const MessengerIcon = () => (
  <svg {...ic}>
    <path d="M12 3C6.9 3 3 6.8 3 11.5c0 2.6 1.2 4.9 3.1 6.4V21l2.9-1.6c.9.2 1.9.4 2.9.4 5.1 0 9-3.8 9-8.5S17.1 3 12 3z" />
    <path d="M7 13.5l3.5-3.7 2 2 3.5-2.8-3.5 3.8-2-2-3.5 2.7z" />
  </svg>
);
const FacebookIcon = () => (
  <svg {...ic}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const instagram =
  "https://www.instagram.com/nasser_tech?psln=MWZndDBrejBob3FqNQ==";
const InstagramIcon = () => (
  <svg {...ic}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r=".6" />
  </svg>
);
const allContacts = [
  {
    key: "wa",
    label: "واتساب",
    sub: "ردّ سريع على طلبك",
    href: `https://wa.me/${whatsapp}`,
    Icon: WhatsAppIcon,
  },
  {
    key: "tel",
    label: "اتصال",
    sub: "أرضي أو موبايل",
    href: `tel:${phone}`,
    Icon: PhoneIcon,
  },
  {
    key: "tt",
    label: "تيك توك",
    sub: "تابع جديدنا",
    href: tiktok,
    Icon: TikTokIcon,
  },
  {
    key: "ms",
    label: "ماسنجر",
    sub: "ابعتلنا رسالة",
    href: messenger,
    Icon: MessengerIcon,
  },
  {
    key: "ig",
    label: "انستجرام",
    sub: "شوف أحدث المنتجات",
    href: instagram,
    Icon: InstagramIcon,
  },
  {
    key: "fb",
    label: "فيسبوك",
    sub: "صفحتنا الرسمية",
    href: facebook,
    Icon: FacebookIcon,
  },
];
const contacts = allContacts.filter((c) => c.key !== "ms" && c.key !== "wa");
const floats = allContacts.filter(
  (c) => c.key === "wa" || c.key === "tel" || c.key === "ms",
);
type CartItem = { id: string; name: string; price: number; qty: number };
const CART_KEY = "nasser_cart";
const strips = ["/bg/strip-1.jpg", "/bg/strip-2.jpg", "/bg/strip-3.jpg"];

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [callOpen, setCallOpen] = useState(false);
  const linkProps = (key: string, href: string) =>
    key === "tel"
      ? {
          href: "#",
          onClick: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            setCallOpen(true);
          },
        }
      : { href, target: "_blank", rel: "noopener noreferrer" };
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);
  const visible = useMemo(
    () =>
      products
        .filter(
          (p) =>
            matchesFilter(p, filter) &&
            p.name.toLowerCase().includes(query.toLowerCase()),
        )
        // المنتجات المتاحة الأول والمنتهية في الآخر
        .sort((a, b) => Number(isAvailable(b)) - Number(isAvailable(a))),
    [products, filter, query],
  );
  // ===== السلة =====
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartReady, setCartReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(saved)) setCart(saved);
    } catch {}
    setCartReady(true);
  }, []);
  useEffect(() => {
    if (!cartReady) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart, cartReady]);
  const cartCount = cart.reduce((n, i) => n + i.qty, 0);
  const cartTotal = cart.reduce((n, i) => n + i.qty * i.price, 0);
  const addToCart = (product: Product) => {
    const id = product._id || product.name;
    setCart((c) =>
      c.some((i) => i.id === id)
        ? c.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i))
        : [...c, { id, name: product.name, price: product.price, qty: 1 }],
    );
    setCartOpen(true);
  };
  const changeQty = (id: string, delta: number) =>
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  const removeItem = (id: string) =>
    setCart((c) => c.filter((i) => i.id !== id));
  const checkout = () => {
    if (!cart.length) return;
    const lines = cart.map(
      (i) =>
        `- ${i.name} × ${i.qty} = ${(i.qty * i.price).toLocaleString("ar-EG")} ج.م`,
    );
    const text = `مرحبًا ناصر تك، أريد طلب:\n${lines.join("\n")}\nالإجمالي: ${cartTotal.toLocaleString("ar-EG")} ج.م`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    if (!window.open(url, "_blank", "noopener,noreferrer"))
      window.location.href = url;
  };

  return (
    <main dir="rtl" className="store-shell">
      <div className="top-strip">خدمة عملاء متاحة يوميًا</div>
      <div className="logo-band">
        <span className="logo-line" />
        <Image
          src="/bg/logo-crop.jpg"
          alt="Nasser Tech"
          width={900}
          height={560}
          priority
          className="logo-wide"
        />
        <span className="logo-line" />
      </div>
      <div className="header-band" aria-hidden="true">
        <div className="band-track">
          {[...strips, ...strips].map((src, i) => (
            <div
              className="band-frame"
              key={i}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="band-shade" />
      </div>{" "}
      <header className="site-header">
        <nav>
          <a href="#products">المنتجات</a>
          <a href="#why">ليه ناصر تك؟</a>
          <a href="#contact">تواصل معنا</a>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            aria-label="سلة التسوق"
            className="icon-button cart-button"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag aria-hidden="true" />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </header>
      <div className="hero-wrap">
        <div className="hero-bg" aria-hidden="true">
          {slides.map((src, i) => (
            <div
              className="hero-slide"
              key={src}
              style={{
                backgroundImage: `url(${src})`,
                animationDelay: `${i * 6}s`,
              }}
            />
          ))}
          <div className="hero-bg-shade" />
        </div>
        <section id="home" className="hero">
          <div className="hero-copy">
            <p className="eyebrow">ناصر تك / اختيارات أذكى</p>
            <h1>
              تقنية تشبهك.
              <br />
              <em>وأداء يكمّلك.</em>
            </h1>
            <p className="hero-text">
              لابتوبات وإكسسوارات مختارة بعناية، بمواصفات واضحة وتجربة طلب بسيطة
              من أول نقرة.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#products">
                تصفح المنتجات
              </a>
              <a className="button quiet" href="#why">
                ليه ناصر تك؟ <span>←</span>
              </a>
            </div>
            <div className="hero-meta">
              <span>
                <b>01</b> فحص دقيق
              </span>
              <span>
                <b>02</b> سعر واضح
              </span>
              <span>
                <b>03</b> طلب سريع
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-photo" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-card">
              <span>اختياراتنا</span>
              <strong>
                أجهزة مجددة
                <br />
                بضمان
              </strong>
              <small>جودة مختبرة بعناية</small>
            </div>
            <div className="floating-tag">
              ثقة <b>100%</b>
            </div>
          </div>
        </section>
      </div>
      <section className="trust-row">
        <div>
          <ShieldCheck /> منتجات مختبرة
        </div>
        <div>
          <MessageCircle /> اطلب على واتساب
        </div>
        <div>
          <SlidersHorizontal /> أسعار مناسبة
        </div>
      </section>
      <section id="products" className="products-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">اكتشف مجموعتنا</p>
            <h2>منتجات حسب احتياجك</h2>
          </div>
          <div className="filter-panel">
            <label className="search">
              <Search aria-hidden="true" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج..."
                aria-label="ابحث عن منتج"
              />
            </label>
            <div className="filters">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  className={filter === f.key ? "active" : ""}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {loading ? (
          <div className="empty">بنجهز المنتجات...</div>
        ) : (
          <div className="product-grid">
            {visible.map((product) => (
              <ProductCard
                key={product._id || product.name}
                product={product}
                onOrder={addToCart}
              />
            ))}
          </div>
        )}
        {!loading && visible.length === 0 && (
          <div className="empty">مفيش منتجات متاحة دلوقتي.</div>
        )}
      </section>
      <section id="why" className="why">
        <p className="eyebrow">ناصر تك</p>
        <h2>
          مش مجرد جهاز.
          <br />
          <em>دي بداية جديدة.</em>
        </h2>
        <p>
          بنساعدك تختار الأنسب لاحتياجك وميزانيتك، وبنخلي الطلب أسهل ما يكون —
          رسالة واحدة على واتساب.
        </p>
        <a
          className="button primary"
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
        >
          كلمنا على واتساب
        </a>
      </section>
      <section id="contact" className="contact">
        <p className="eyebrow">ناصر تك</p>
        <h2>تواصل معنا</h2>
        <p className="contact-sub">
          اختار الطريقة الأسهل ليك وهنرد عليك في أسرع وقت.
        </p>
        <div className="contact-grid">
          {contacts.map(({ key, label, sub, href, Icon }) => (
            <a
              key={key}
              {...linkProps(key, href)}
              className={`contact-card c-${key}`}
            >
              <span className="c-icon">
                <Icon />
              </span>
              <b>{label}</b>
              <small>{sub}</small>
            </a>
          ))}
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-main">
          <strong>ناصر تك</strong>
          <span>أجهزة عملية. اختيارات أذكى.</span>
          <span>© 2026 Nasser Tech</span>
        </div>
        <div className="designer">
          تصميم وتطوير :{" "}
          <a href={designerUrl} target="_blank" rel="noopener noreferrer">
            Webcraft Studio
          </a>
        </div>
        <div className="footer-social">
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="انستجرام"
            title="انستجرام"
          >
            <InstagramIcon />
          </a>
          <a
            href={tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="تيك توك"
            title="تيك توك"
          >
            <TikTokIcon />
          </a>
          <a
            href={facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="فيسبوك"
            title="فيسبوك"
          >
            <FacebookIcon />
          </a>
        </div>
      </footer>
      <aside className="float-contact" aria-label="تواصل سريع">
        {floats.map(({ key, label, href, Icon }) => (
          <a
            key={key}
            {...linkProps(key, href)}
            aria-label={label}
            title={label}
            className={`fc c-${key}`}
          >
            <Icon />
          </a>
        ))}
      </aside>
      {cartOpen && (
        <div
          className="call-modal"
          role="dialog"
          aria-modal="true"
          aria-label="سلة التسوق"
          onClick={() => setCartOpen(false)}
        >
          <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cart-head">
              <h3>سلة التسوق</h3>
              <button
                type="button"
                className="cart-close"
                aria-label="إغلاق"
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="cart-empty">السلة فاضية، ضيف منتج بزرار «اطلب الآن».</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <b>{item.name}</b>
                        <small>
                          {item.price.toLocaleString("ar-EG")} ج.م للقطعة
                        </small>
                      </div>
                      <div className="qty">
                        <button
                          type="button"
                          aria-label="زيادة"
                          onClick={() => changeQty(item.id, 1)}
                        >
                          <Plus />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          type="button"
                          aria-label="تقليل"
                          onClick={() => changeQty(item.id, -1)}
                        >
                          <Minus />
                        </button>
                        <button
                          type="button"
                          aria-label="حذف من السلة"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>الإجمالي</span>
                  <span>{cartTotal.toLocaleString("ar-EG")} ج.م</span>
                </div>
                <div className="cart-actions">
                  <button
                    type="button"
                    className="button primary"
                    onClick={checkout}
                  >
                    <MessageCircle aria-hidden="true" /> إتمام الطلب على واتساب
                  </button>
                  <button
                    type="button"
                    className="cart-clear"
                    onClick={() => setCart([])}
                  >
                    تفريغ السلة
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {callOpen && (
        <div
          className="call-modal"
          role="dialog"
          aria-modal="true"
          aria-label="اختار رقم الاتصال"
          onClick={() => setCallOpen(false)}
        >
          <div className="call-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>اتصل بينا</h3>
            <a href={`tel:${landline}`}>
              <b>رقم أرضي</b>
              <span dir="ltr">{landline}</span>
            </a>
            <a href={`tel:${mobile}`}>
              <b>رقم موبايل</b>
              <span dir="ltr">{mobile}</span>
            </a>
            <button type="button" onClick={() => setCallOpen(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
