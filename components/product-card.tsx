/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import {
  categoryLabel,
  isAvailable,
  type Product,
} from "@/lib/catalog";

type Props = {
  product: Product;
  onOrder?: (product: Product) => void;
  // في لوحة التحكم بنستخدم img عادي عشان المعاينة تشتغل مع أي صورة
  preview?: boolean;
};

export function ProductCard({ product, onOrder, preview }: Props) {
  const available = isAvailable(product);
  const price = Number(product.price) || 0;
  const oldPrice = Number(product.oldPrice) || 0;
  return (
    <article className={`product-card${available ? "" : " sold-out"}`}>
      <div className="product-image">
        {!available ? (
          <span className="badge badge-out">منتهي</span>
        ) : product.badge ? (
          <span className="badge">{product.badge}</span>
        ) : null}
        {product.image ? (
          preview ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 800px) 100vw, 33vw"
            />
          )
        ) : (
          <div className="preview-noimg">الصورة هتظهر هنا</div>
        )}
      </div>
      <div className="product-info">
        <p className="product-category">{categoryLabel(product.category)}</p>
        <h3>{product.name || "اسم المنتج"}</h3>
        <p className="description">
          {product.description || "وصف المنتج هيظهر هنا"}
        </p>
        <div className="specs">
          {product.specs?.map((spec) => (
            <span key={spec}>{spec}</span>
          ))}
        </div>
        <div className="price-row">
          <div>
            <strong>
              {price.toLocaleString("ar-EG")} <small>ج.م</small>
            </strong>
            {oldPrice > 0 && (
              <del>{oldPrice.toLocaleString("ar-EG")} ج.م</del>
            )}
          </div>
          {available ? (
            <button
              type="button"
              onClick={() => onOrder?.(product)}
              className="order-button"
            >
              <MessageCircle aria-hidden="true" /> اطلب الآن
            </button>
          ) : (
            <button type="button" className="order-button" disabled>
              غير متاح حاليًا
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
