import React from 'react';
import { CoverFocalPoint } from '@/lib/types';
import { focalPointClass } from '@/lib/presets';

interface BookCoverProps {
  src: string;
  alt: string;
  focalPoint?: CoverFocalPoint;
  className?: string;
}

/**
 * Clean 3:4 Botanical Paper Book Cover Frame (GEMINI.md Điều 3.1 & 3.2):
 * - 1px hairline border, subtle 7px corner radius
 * - Zero overlaid badges, stickers, or OS emojis
 */
export function BookCover({
  src,
  alt,
  focalPoint = 'center',
  className = ''
}: BookCoverProps) {
  return (
    <div
      style={{
        border: '1px solid var(--border-hairline)',
        backgroundColor: 'var(--bg-surface)'
      }}
      className={`aspect-[3/4] w-full rounded-[7px] overflow-hidden relative ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-full object-cover block ${focalPointClass(focalPoint)}`}
        />
      ) : (
        <div
          style={{ color: 'var(--text-secondary)' }}
          className="w-full h-full flex items-center justify-center p-4 text-center text-xs font-editorial italic"
        >
          {alt}
        </div>
      )}
    </div>
  );
}
