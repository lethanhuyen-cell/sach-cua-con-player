import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { createR2PresignedUpload, isR2Configured, validateMediaUpload } from '@/lib/r2';

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';

  // Mode 1: JSON request asking for Cloudflare R2 Presigned PUT URL (or telling client to use local FormData)
  if (contentType.includes('application/json')) {
    const body = await req.json();
    const kind = body.kind === 'audio' ? 'audio' : 'image';
    const mimeType = String(body.mimeType || '');
    const fileSizeBytes = Number(body.fileSizeBytes || 0);
    const fileName = String(body.fileName || 'upload.bin');
    const bookSlug = String(body.bookSlug || 'general');

    const check = validateMediaUpload(kind, mimeType, fileSizeBytes);
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    if (isR2Configured()) {
      const presigned = await createR2PresignedUpload({
        kind,
        bookSlug,
        fileName,
        mimeType
      });
      return NextResponse.json({ mode: 'r2', ...presigned });
    }

    return NextResponse.json({ mode: 'local' });
  }

  // Mode 2: Local multipart FormData upload -> writes to public/uploads/books/{bookSlug}/
  try {
    const form = await req.formData();
    const file = form.get('file');
    const kind = form.get('kind') === 'audio' ? 'audio' : 'image';
    const bookSlug = String(form.get('bookSlug') || 'general')
      .replace(/[^a-z0-9-]/gi, '-')
      .toLowerCase();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Không nhận được tệp tải lên.' }, { status: 400 });
    }

    const check = validateMediaUpload(kind, file.type, file.size);
    if (!check.valid) {
      return NextResponse.json({ error: check.error }, { status: 400 });
    }

    const ext = (file.name.split('.').pop() || (kind === 'audio' ? 'mp3' : 'jpg'))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    const fileName = `${kind}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const relDir = path.join('uploads', 'books', bookSlug);
    const absDir = path.join(process.cwd(), 'public', relDir);
    fs.mkdirSync(absDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(absDir, fileName), buffer);

    const publicUrl = `/${relDir.replace(/\\/g, '/')}/${fileName}`;
    return NextResponse.json({
      ok: true,
      publicUrl,
      fileSizeBytes: file.size,
      mimeType: file.type
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Tải tệp thất bại.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
