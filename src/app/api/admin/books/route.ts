import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAdminLibrary, upsertBook } from '@/lib/repository';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }
  const data = await getAdminLibrary();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const book = await upsertBook(body);
    return NextResponse.json({ ok: true, book });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể lưu Bộ sách.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
