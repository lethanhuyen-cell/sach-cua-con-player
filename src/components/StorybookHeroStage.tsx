'use client';

import React, { useEffect, useState } from 'react';
import { CoverFocalPoint } from '@/lib/types';
import { focalPointClass } from '@/lib/presets';
import { BookCover } from './BookCover';
import { CloseIcon } from './Icons';

interface StorybookHeroStageProps {
  src?: string | null;
  alt: string;
  focalPoint?: CoverFocalPoint;
  washBg?: string;
  roundedClass?: string;
  children?: React.ReactNode;
}

/**
 * Khung Tranh Sách In 2/3 Màn Hình Đầu Tiên (Framed Storybook Plate — GEMINI.md):
 * - Chiếm ~2/3 chiều cao màn hình đầu tiên (kết hợp cùng thanh Sticky 42-44px),
 *   giữ nguyên vẹn tỷ lệ gốc 3:4 không cắt xén chi tiết tranh trên mọi cỡ màn hình.
 * - Tuyệt đối 0 chữ, 0 nhãn, 0 nút đè lên mặt tranh 3:4.
 * - Chạm vào tranh mở xem phóng to toàn màn hình (Lightbox).
 * - Phần 1/3 bên dưới hiển thị tiêu đề / nút hành động và hé lộ mạch nội dung cuộn bên dưới.
 */
export function StorybookHeroStage({
  src,
  alt,
  focalPoint = 'center',
  washBg,
  roundedClass = 'rounded-[8px]',
  children
}: StorybookHeroStageProps) {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  useEffect(() => {
    if (!isZoomOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isZoomOpen]);

  const hasValidImage = Boolean(src && !imgError);

  return (
    <>
      <section
        style={{
          backgroundColor: washBg || 'transparent',
          borderBottom: washBg ? '1px solid var(--border-hairline)' : undefined
        }}
        className="px-3.5 pt-2.5 pb-3.5"
      >
        <div style={{ width: 'min(100%, calc(58dvh * 0.75))' }} className="mx-auto">
          {hasValidImage ? (
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              aria-label={`Chạm để xem toàn màn hình: ${alt}`}
              style={{
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)'
              }}
              className={`block w-full aspect-[3/4] ${roundedClass} overflow-hidden shadow-sm transition active:scale-[0.99]`}
            >
              <img
                src={src!}
                alt={alt}
                onError={() => setImgError(true)}
                className={`w-full h-full object-cover ${focalPointClass(focalPoint)} block select-none`}
              />
            </button>
          ) : (
            <BookCover src={src} alt={alt} focalPoint={focalPoint} className={roundedClass} />
          )}
        </div>

        {children && <div className="mt-3">{children}</div>}
      </section>

      {isZoomOpen && hasValidImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setIsZoomOpen(false)}
          style={{ backgroundColor: 'rgba(12, 16, 14, 0.94)' }}
          className="fixed inset-0 z-50 flex flex-col justify-between p-4"
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              aria-label="Đóng xem tranh"
              onClick={() => setIsZoomOpen(false)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-[#EFE9DC] bg-white/10"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div
            className="flex-1 flex items-center justify-center overflow-hidden py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src!}
              alt={alt}
              onClick={() => setIsZoomOpen(false)}
              className="max-h-[84dvh] max-w-full object-contain rounded-[8px] cursor-zoom-out select-none"
            />
          </div>

          <div className="h-4" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
