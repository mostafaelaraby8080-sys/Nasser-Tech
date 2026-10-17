import { NextResponse } from 'next/server'
import { createAdminToken } from '@/lib/admin'

export async function POST(request: Request) {
  const { password } = await request.json()
  const token = await createAdminToken(String(password || ''))
  if (!token) return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set('nasser_admin', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/' })
  return response
}
