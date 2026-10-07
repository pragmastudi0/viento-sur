import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { sessionClient } from '@/lib/supabase/server';
export async function GET(request: NextRequest) {
  const origin = process.env.SITE_URL || request.nextUrl.origin;
  const params = request.nextUrl.searchParams;
  const token_hash = params.get('token_hash');
  const type = params.get('type');
  const code = params.get('code');
  const client = await sessionClient();
  if (token_hash && (type === 'recovery' || type === 'invite')) {
    const { error } = await client.auth.verifyOtp({ token_hash, type: type as EmailOtpType });
    if (!error) return NextResponse.redirect(new URL('/admin/recuperar', origin));
  } else if (code) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/admin/recuperar', origin));
  }
  return NextResponse.redirect(new URL('/admin/login', origin));
}
