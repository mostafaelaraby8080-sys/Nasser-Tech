import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_SECRET || "nasser-tech-preview-secret-change-me",
);
const password = process.env.ADMIN_PASSWORD || "admin123";

export async function isAdmin() {
  const token = (await cookies()).get("nasser_admin")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function createAdminToken(input: string) {
  if (input !== password) return null;
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}
