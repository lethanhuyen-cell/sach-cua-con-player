import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  checkLoginRateLimit,
  clearLoginFailures,
  createAdminToken,
  getConfiguredAdminPassword,
  isAdminAuthenticated,
  recordLoginFailure
} from '@/lib/auth';
import { bumpAdminSessionVersion, getAdminSessionVersion } from '@/lib/repository';

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'local-client'
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limit = checkLoginRateLimit(ip);
  if (!limit.allowed) {
    const mins = Math.ceil(limit.retryAfterSeconds / 60);
    return NextResponse.json(
      {
        error: `Tạm khóa đăng nhập quản trị sau 5 lần nhập sai. Vui lòng thử lại sau ${mins} phút.`
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');

  if (password !== getConfiguredAdminPassword()) {
    const fail = recordLoginFailure(ip);
    if (fail.locked) {
      return NextResponse.json(
        {
          error: 'Bạn đã nhập sai 5 lần liên tiếp. Hệ thống tạm khóa đăng nhập trong 15 phút.'
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: `Mật khẩu quản trị chưa đúng (còn ${fail.remainingAttempts} lần thử).`
      },
      { status: 401 }
    );
  }

  clearLoginFailures(ip);
  const version = await getAdminSessionVersion();
  const token = createAdminToken(version);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const allDevices = url.searchParams.get('all') === '1';

  if (allDevices && (await isAdminAuthenticated())) {
    await bumpAdminSessionVersion();
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
