import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { upsertVoiceProfile } from '@/lib/repository';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const voiceProfile = await upsertVoiceProfile(body);
    return NextResponse.json({ ok: true, voiceProfile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể lưu Hồ sơ Giọng đọc.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
