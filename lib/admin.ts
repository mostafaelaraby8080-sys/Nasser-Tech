import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";

// لازم تحدد ADMIN_PASSWORD و ADMIN_SECRET في متغيرات البيئة (Vercel / .env.local)
// من غيرهم تسجيل الدخول بيتقفل بدل ما يشتغل بكلمة مرور افتراضية.
const isProd = process.env.NODE_ENV === "production";

function getSecret() {
  const value =
    process.env.ADMIN_SECRET || (isProd ? "" : "dev-only-secret-not-for-production");
  return value.length >= 16 ? new TextEncoder().encode(value) : null;
}

function passwordMatches(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 8) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin() {
  const secret = getSecret();
  const token = (await cookies()).get("nasser_admin")?.value;
  if (!secret || !token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function createAdminToken(input: string) {
  const secret = getSecret();
  if (!secret || !passwordMatches(input)) return null;
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
