import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { updateTrashState } from '@/lib/repository';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    await updateTrashState({
      entity: body.entity === 'book' ? 'book' : 'episode',
      id: String(body.id || ''),
      action: body.action
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể cập nhật Thùng rác.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
