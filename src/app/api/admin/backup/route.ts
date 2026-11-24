import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { buildBackupExportPayload } from '@/lib/repository';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }

  const payload = await buildBackupExportPayload();
  const dateTag = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="thu-vien-doi-mo-backup-${dateTag}.json"`
    }
  });
}
