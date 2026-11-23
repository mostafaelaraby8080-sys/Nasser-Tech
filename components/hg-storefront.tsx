"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, BadgeCheck, ExternalLink, Headphones, MapPin, Menu, Phone, Search, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { CATEGORIES, type Product } from "@/lib/catalog";

const logoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-11-23%20at%206.11.38%20AM-Fr85Zm33RMQ6rwTW9pR34DXimaggtX.jpeg";
const bannerUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-11-23%20at%206.11.38%20AM-xIEg7RHHvcEvfC2OQJYBKy7MuX3PSi.jpeg";
const fetcher = async (url: string): Promise<Product[]> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("تعذر تحميل المنتجات");
  return response.json();
};
const money = (value: number) => `${Number(value || 0).toLocaleString("ar-EG")} ج.م`;

export function HgStorefront() {
  const { data: products, error, isLoading } = useSWR<Product[]>("/api/products", fetcher);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const availableProducts = useMemo(() => (products ?? []).filter((product) => product.available !== false), [products]);
  const shownProducts = useMemo(() => availableProducts.filter((product) => {
    const categoryMatches = activeCategory === "all" || product.category === activeCategory;
    const queryMatches = `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return categoryMatches && queryMatches;
  }), [availableProducts, activeCategory, query]);
  const orderProduct = (product: Product) => {
    const text = `مرحباً، أريد الاستفسار عن ${product.name} بسعر ${money(product.price)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="store" dir="rtl">
      <div className="announcement"><Zap size={14} fill="currentColor" /> عروض مميزة على الأجهزة الكهربائية والأدوات المنزلية — اختار اللي يناسبك</div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="HG — الصفحة الرئيسية"><img src={logoUrl} alt="شعار HG لتجارة وتوزيع الأجهزة الكهربائية" /></a>
        <nav className="main-nav" aria-label="التنقل الرئيسي">
          <a className="nav-active" href="#home">الرئيسية</a><a href="#products">المنتجات</a><a href="#about">عن HG</a><a href="#contact">تواصل معنا</a>
        </nav>
        <a className="header-contact" href="#products"><ShoppingBag size={17} /> تسوق الآن <ArrowLeft size={15} /></a>
        <a className="mobile-menu" href="#products" aria-label="تصفح المنتجات"><Menu /></a>
      </header>

      <section className="hero" id="home">
        <img className="hero-banner" src={bannerUrl} alt="واجهة متجر HG لتجارة وتوزيع الأجهزة الكهربائية" />
        <div className="hero-copy">
          <span className="eyebrow"><span /> بيتك يستاهل الأفضل</span>
          <h1>كل اللي بيتك محتاجه<br /><span>من مكان واحد</span></h1>
          <p>أجهزة كهربائية أصلية، اختيارات كتير وأسعار على قد إيدك. اختار اللي يناسبك وإحنا معاك خطوة بخطوة.</p>
          <a className="gold-button" href="#products">اكتشف منتجاتنا <ArrowLeft size={17} /></a>
          <div className="hero-note"><ShieldCheck size={18} /> جودة تثق فيها وخدمة تليق بيك</div>
        </div>
        <div className="hero-art"><img src={logoUrl} alt="HG للأجهزة الكهربائية" /></div>
        <div className="hero-index"><span>01</span><i /> 03</div>
      </section>

      <section className="benefits" id="about" aria-label="مميزات التسوق">
        <div className="benefit"><span className="benefit-icon"><Truck /></span><span><strong>توصيل لحد باب البيت</strong><small>بكل سهولة وأمان</small></span></div>
        <div className="benefit"><span className="benefit-icon"><BadgeCheck /></span><span><strong>منتجات أصلية</strong><small>ضمان وجودة معتمدة</small></span></div>
        <div className="benefit"><span className="benefit-icon"><Headphones /></span><span><strong>خدمة تساعدك</strong><small>إحنا معاك قبل وبعد الشراء</small></span></div>
        <div className="benefit"><span className="benefit-icon"><MapPin /></span><span><strong>قريبين منك</strong><small>زورنا في فرع HG</small></span></div>
      </section>

      <section className="catalog-section" id="products">
        <div className="section-heading"><div><span className="section-kicker">اختار اللي يناسبك</span><h2>تسوق <span>منتجاتنا</span></h2></div><p>أجهزة كهربائية وأدوات منزلية<br />علشان كل ركن في بيتك يبقى أحلى.</p></div>
        <div className="catalog-tools">
          <div className="category-tabs" role="group" aria-label="تصفية حسب الفئة">
            <button aria-pressed={activeCategory === "all"} className={activeCategory === "all" ? "category-tab selected" : "category-tab"} onClick={() => setActiveCategory("all")}>كل المنتجات</button>
            {CATEGORIES.map((category) => <button key={category.key} aria-pressed={activeCategory === category.key} className={activeCategory === category.key ? "category-tab selected" : "category-tab"} onClick={() => setActiveCategory(category.key)}>{category.label}</button>)}
          </div>
          <label className="search-box"><Search size={17} /><span className="sr-only">ابحث عن منتج</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بتدور على إيه؟" /></label>
        </div>
        <div className="results-meta"><span>{activeCategory === "all" ? "كل المنتجات" : CATEGORIES.find((category) => category.key === activeCategory)?.label}</span><span>{availableProducts.length} منتج</span></div>
        {isLoading ? <div className="catalog-message" role="status"><span className="loading-dot" /> بنجهزلك المنتجات...</div> : error ? <div className="catalog-message" role="alert">حصلت مشكلة في تحميل المنتجات. حاول تاني بعد شوية.</div> : shownProducts.length ? (
          <div className="product-grid">
            {shownProducts.map((product) => <article className="shop-card" key={product._id ?? `${product.name}-${product.category}`}>
              <div className="shop-card-image">{product.badge && <span className="product-badge">{product.badge}</span>}{product.image ? <img src={product.image} alt={product.name} loading="lazy" /> : <div className="image-empty"><Zap /></div>}<span className="quick-view"><ArrowUpLeft size={17} /></span></div>
              <div className="shop-card-body"><span className="product-category">{CATEGORIES.find((category) => category.key === product.category)?.label ?? product.category}</span><h3>{product.name}</h3><p>{product.description}</p>{product.specs?.length ? <div className="product-specs">{product.specs.slice(0, 2).map((spec) => <span key={spec}>{spec}</span>)}</div> : <div className="product-specs"><span>منتج أصلي</span><span>جودة مضمونة</span></div>}<div className="shop-card-footer"><strong>{money(product.price)}</strong><button onClick={() => orderProduct(product)} aria-label={`اسأل عن ${product.name} على واتساب`}>اطلب الآن <ArrowLeft size={14} /></button></div></div>
            </article>)}
          </div>
        ) : <div className="catalog-message"><ShoppingBag size={25} /><strong>{query ? "ملقيناش المنتج ده" : "قريباً هتلاقوا منتجاتنا هنا"}</strong><span>{query ? "جرب كلمة بحث تانية أو اختار فئة مختلفة." : "بنضيف تشكيلتنا الجديدة دلوقتي — تابعونا قريب."}</span></div>}
      </section>

      <section className="contact-banner" id="contact"><div><span className="section-kicker">محتاج مساعدة؟</span><h2>اختيارك الصح يبدأ <span>بسؤال</span></h2><p>فريق HG جاهز يساعدك تختار الجهاز الأنسب ليك.</p><div className="store-contact-details"><a href="https://maps.google.com/?q=دمياط+الشارع+الحربي+بجوار+ماركت+الكيكي" target="_blank" rel="noreferrer"><MapPin size={17} /><span>دمياط، الشارع الحربي بجوار ماركت الكيكي</span></a><a href="tel:01286066660"><Phone size={16} /><span dir="ltr">0128 6066 660</span></a><a href="tel:0572333232"><Phone size={16} /><span dir="ltr">057 / 233 3232</span></a></div></div><a className="gold-button" href="https://wa.me/201286066660" target="_blank" rel="noreferrer">كلمنا على واتساب <ArrowLeft size={17} /></a></section>
      <footer className="site-footer"><a className="footer-brand" href="#home"><img src={logoUrl} alt="HG" /></a><span>© {new Date().getFullYear()} HG — لتجارة وتوزيع الأجهزة الكهربائية والأدوات المنزلية</span><div className="footer-links"><a href="https://www.facebook.com/profile.php?id=61594662582257" target="_blank" rel="noreferrer" aria-label="صفحة HG على فيسبوك"><ExternalLink size={16} /> فيسبوك</a><a href="/admin">لوحة الإدارة</a><a href="#home">العودة للأعلى ↑</a></div></footer>
    </main>
  );
}
