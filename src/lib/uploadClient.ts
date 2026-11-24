export interface UploadResult {
  publicUrl: string;
  fileSizeBytes: number;
  mimeType: string;
}

export async function uploadMediaWithProgress(params: {
  file: File;
  kind: 'audio' | 'image';
  bookSlug?: string;
  onProgress?: (percent: number) => void;
}): Promise<UploadResult> {
  const { file, kind, bookSlug = 'general', onProgress } = params;

  // Step 1: Check upload mode & validate size/MIME on server
  const initRes = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind,
      mimeType: file.type,
      fileSizeBytes: file.size,
      fileName: file.name,
      bookSlug
    })
  });

  const initData = await initRes.json().catch(() => ({}));
  if (!initRes.ok) {
    throw new Error(initData.error || 'Tệp không hợp lệ hoặc vượt quá giới hạn dung lượng.');
  }

  // Step 2A: Direct Presigned PUT to Cloudflare R2 with real XHR progress
  if (initData.mode === 'r2' && initData.uploadUrl && initData.publicUrl) {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', initData.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable && onProgress) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(100);
          resolve();
        } else {
          reject(new Error(`Tải lên đám mây gián đoạn (mã ${xhr.status}).`));
        }
      };
      xhr.onerror = () => reject(new Error('Mất kết nối mạng trong lúc tải tệp lên.'));
      xhr.send(file);
    });

    return {
      publicUrl: initData.publicUrl,
      fileSizeBytes: file.size,
      mimeType: file.type
    };
  }

  // Step 2B: Local FormData upload with real XHR progress
  return new Promise<UploadResult>((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('kind', kind);
    form.append('bookSlug', bookSlug);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/upload');
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && json.publicUrl) {
          onProgress?.(100);
          resolve({
            publicUrl: json.publicUrl,
            fileSizeBytes: json.fileSizeBytes || file.size,
            mimeType: json.mimeType || file.type
          });
        } else {
          reject(new Error(json.error || 'Tải tệp thất bại.'));
        }
      } catch {
        reject(new Error('Phản hồi máy chủ không hợp lệ khi tải tệp.'));
      }
    };
    xhr.onerror = () => reject(new Error('Mất kết nối mạng khi tải tệp lên.'));
    xhr.send(form);
  });
}

export function measureAudioFileDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const objectUrl = URL.createObjectURL(file);
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };
      audio.onloadedmetadata = () => {
        const dur = Number.isFinite(audio.duration) ? Math.round(audio.duration) : 0;
        cleanup();
        resolve(dur);
      };
      audio.onerror = () => {
        cleanup();
        resolve(0);
      };
      audio.src = objectUrl;
    } catch {
      resolve(0);
    }
  });
}
