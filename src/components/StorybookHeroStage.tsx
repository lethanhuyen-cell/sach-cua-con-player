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
 * Sân Khấu Tranh Mở Đầu Đa Tầng & Sách Tranh Mở Đôi (GEMINI.md — Botanical Paper Edition):
 * - Điện thoại (< 768px):
 *   + `immersive` (Sảnh, Kệ, Tủ sách): Tranh tràn sát hai mép khung, chân tranh tan sương đón thẻ nổi.
 *   + `bookplate` (Bộ sách, Tập truyện): Khung ấn bản bo viền giấy kem 6px ôm liền tranh & tiêu đề.
 * - Máy tính & iPad (>= 768px):
 *   + Tự động định hình thành Trang Trái của cuốn sách mở đôi (Passe-partout Art Plate 8px) đặt song song
 *     cùng Trang Phải chứa danh sách kệ / mục lục / văn bản.
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
        <section className="pb-1 md:pb-0">
          <div className="md:rounded-[16px] md:p-2 md:bg-[var(--bg-elevated)] md:border md:border-[var(--border-hairline)] md:shadow-[0_10px_28px_-8px_rgba(20,26,22,0.10)]">
            <div className="relative w-full">
              {hasValidImage ? (
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  aria-label={`Chạm để xem toàn màn hình: ${alt}`}
                  style={{ backgroundColor: washBg || 'var(--bg-surface)' }}
                  className="block relative w-full aspect-[3/4] overflow-hidden select-none md:rounded-[10px] md:border md:border-[var(--border-hairline)] transition active:scale-[0.99]"
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
                    className="absolute inset-0 pointer-events-none md:hidden"
                  />
                </button>
              ) : (
                <div className={`${paddingXClass} md:px-0`}>
                  <BookCover
                    src={src || ''}
                    alt={alt}
                    focalPoint={focalPoint}
                    className="rounded-[12px] md:rounded-[10px]"
                  />
                </div>
              )}
            </div>

            {children && (
              <div
                className={`px-4 ${
                  hasValidImage ? '-mt-5' : 'mt-3'
                } relative z-10 md:mt-0 md:px-2.5 md:pt-3 md:pb-1.5`}
              >
                <div className="rounded-[12px] px-3.5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-[0_8px_24px_-6px_rgba(20,26,22,0.14)] md:rounded-none md:p-0 md:bg-transparent md:border-0 md:shadow-none">
                  {children}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className={`relative ${paddingXClass} pt-3 pb-1.5 md:p-0`}>
          {washBg && (
            <div
              aria-hidden="true"
              style={{
                background: `linear-gradient(180deg, ${washBg} 0%, var(--bg-canvas) 100%)`
              }}
              className="absolute inset-0 pointer-events-none md:hidden"
            />
          )}
          <div className="relative z-10 w-full rounded-[14px] md:rounded-[16px] p-1.5 md:p-2 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] shadow-[0_10px_28px_-8px_rgba(20,26,22,0.10)]">
            {hasValidImage ? (
              <button
                type="button"
                onClick={() => setIsZoomOpen(true)}
                aria-label={`Chạm để xem toàn màn hình: ${alt}`}
                className={`block w-full aspect-[3/4] ${roundedClass} md:rounded-[10px] overflow-hidden bg-[var(--bg-surface)] border border-[var(--border-hairline)] transition active:scale-[0.99]`}
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
