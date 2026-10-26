import { NextResponse } from "next/server";
import { createAdminToken } from "@/lib/admin";

// حماية من التخمين: 5 محاولات فاشلة كل 15 دقيقة لكل عنوان IP
const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "محاولات كتير، حاول بعد 15 دقيقة" },
      { status: 429 },
    );
  }

  const { password } = await request.json().catch(() => ({ password: "" }));
  const token = await createAdminToken(String(password || ""));
  if (!token) {
    const fresh = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS };
    fresh.count += 1;
    attempts.set(ip, fresh);
    return NextResponse.json(
      { error: "كلمة المرور غير صحيحة" },
      { status: 401 },
    );
  }
  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set("nasser_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
