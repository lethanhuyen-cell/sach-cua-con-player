import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export const MAX_AUDIO_BYTES = 60 * 1024 * 1024; // 60 MB (DEC-06, NFR-011)
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB (DEC-06, NFR-011)

const ALLOWED_AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/x-m4a',
  'audio/aac',
  'audio/wav'
]);

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

export function validateMediaUpload(
  kind: 'audio' | 'image',
  mimeType: string,
  fileSizeBytes: number
): { valid: boolean; error?: string } {
  if (kind === 'audio') {
    if (!ALLOWED_AUDIO_TYPES.has(mimeType.toLowerCase())) {
      return {
        valid: false,
        error: 'Định dạng âm thanh không hợp lệ. Chỉ hỗ trợ tệp MP3 hoặc M4A/AAC.'
      };
    }
    if (fileSizeBytes > MAX_AUDIO_BYTES) {
      return {
        valid: false,
        error: 'Tệp âm thanh vượt quá giới hạn tối đa 60MB/tệp.'
      };
    }
    return { valid: true };
  }

  if (!ALLOWED_IMAGE_TYPES.has(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: 'Định dạng hình ảnh không hợp lệ. Chỉ hỗ trợ JPG, PNG hoặc WebP.'
    };
  }
  if (fileSizeBytes > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: 'Hình ảnh vượt quá giới hạn tối đa 5MB/tệp.'
    };
  }
  return { valid: true };
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL
  );
}

export async function createR2PresignedUpload(params: {
  kind: 'audio' | 'image';
  bookSlug: string;
  fileName: string;
  mimeType: string;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const ext = (params.fileName.split('.').pop() || (params.kind === 'audio' ? 'mp3' : 'jpg'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const randomId = crypto.randomBytes(8).toString('hex');
  const safeBook = (params.bookSlug || 'general').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  const key = `books/${safeBook}/${params.kind}-${Date.now()}-${randomId}.${ext}`;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
  });

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: params.mimeType
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 900 });
  const basePublic = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!.replace(/\/$/, '');
  return {
    uploadUrl,
    publicUrl: `${basePublic}/${key}`,
    key
  };
}
