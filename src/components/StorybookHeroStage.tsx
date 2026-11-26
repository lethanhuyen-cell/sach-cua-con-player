'use client';

import React, { useEffect, useState } from 'react';
import { CoverFocalPoint } from '@/lib/types';
import { focalPointClass } from '@/lib/presets';
import { BookCover } from './BookCover';
import { CloseIcon } from './Icons';

export type HeroStageVariant = 'immersive' | 'bookplate';

interface StorybookHeroStageProps {
  src?: string | null;
  alt: string;
  focalPoint?: CoverFocalPoint;
  washBg?: string;
  variant?: HeroStageVariant;
  roundedClass?: string;
  paddingXClass?: string;
  children?: React.ReactNode;
}

/**
 * Sân Khấu Tranh Mở Đầu Đa Tầng (GEMINI.md — Botanical Paper Edition):
 * - `immersive` (Sảnh sách, Kệ sách, Tủ sách): Tranh không gian 3:4 mở rộng tràn sát hai mép khung 480px
 *   như bước thẳng vào căn phòng gỗ sồi; chân tranh tan sương nhẹ đón thẻ định danh nổi bên dưới.
 * - `bookplate` (Bộ sách, Tập truyện): Khung ấn bản bo viền giấy kem 6px (passe-partout) rộng 100% cột,
 *   ôm liền cả tranh bìa 3:4 và bệ tiêu đề / điều khiển vào chung một tấm thẻ tác phẩm sang trọng.
 * - Tuyệt đối 0 chữ, 0 nhãn, 0 nút đè lên mặt nhân vật/chi tiết tranh 3:4.
 * - Chạm vào tranh mở xem phóng to toàn màn hình (Lightbox).
 */
export function StorybookHeroStage({
  src,
  alt,
  focalPoint = 'center',
  washBg,
  variant = 'bookplate',
  roundedClass = 'rounded-[9px]',
  paddingXClass = 'px-3.5',
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
      {variant === 'immersive' ? (
        <section className="pb-1">
          <div className="relative w-full">
            {hasValidImage ? (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label={`Chạm để xem toàn màn hình: ${alt}`}
                style={{ backgroundColor: washBg || 'var(--bg-surface)' }}
                className="block relative w-full aspect-[3/4] overflow-hidden select-none"
              >
                <img
                  src={src!}
                  alt={alt}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover ${focalPointClass(focalPoint)} block select-none`}
                />
                <div
                  aria-hidden="true"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0) 74%, var(--bg-canvas) 100%)'
                  }}
                  className="absolute inset-0 pointer-events-none"
                />
              </button>
            ) : (
              <div className={paddingXClass}>
                <BookCover src={src || ''} alt={alt} focalPoint={focalPoint} className="rounded-[12px]" />
              </div>
            )}
          </div>

          {children && (
            <div className={`px-4 ${hasValidImage ? '-mt-5' : 'mt-3'} relative z-10`}>
              <div
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)',
                  boxShadow: '0 8px 24px -6px rgba(20, 26, 22, 0.14)'
                }}
                className="rounded-[12px] px-3.5 py-2.5"
              >
                {children}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section
          style={{
            background: washBg
              ? `linear-gradient(180deg, ${washBg} 0%, var(--bg-canvas) 100%)`
              : 'transparent'
          }}
          className={`${paddingXClass} pt-3 pb-1.5`}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)',
              boxShadow: '0 10px 28px -8px rgba(20, 26, 22, 0.10)'
            }}
            className="w-full rounded-[14px] p-1.5"
          >
            {hasValidImage ? (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label={`Chạm để xem toàn màn hình: ${alt}`}
                style={{
                  border: '1px solid var(--border-hairline)',
                  backgroundColor: 'var(--bg-surface)'
                }}
                className={`block w-full aspect-[3/4] ${roundedClass} overflow-hidden transition active:scale-[0.99]`}
              >
                <img
                  src={src!}
                  alt={alt}
                  onError={() => setImgError(true)}
                  className={`w-full h-full object-cover ${focalPointClass(focalPoint)} block select-none`}
                />
              </button>
            ) : (
              <BookCover src={src || ''} alt={alt} focalPoint={focalPoint} className={roundedClass} />
            )}

            {children && <div className="px-2.5 pt-3 pb-2">{children}</div>}
          </div>
        </section>
      )}

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
