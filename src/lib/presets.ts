import { BookPreset, CoverFocalPoint } from './types';

export interface PresetStyle {
  key: BookPreset;
  label: string;
  dayWash: string;
  nightWash: string;
  dayAccent: string;
  nightAccent: string;
}

export const BOOK_PRESETS: Record<BookPreset, PresetStyle> = {
  moss: {
    key: 'moss',
    label: 'Rêu Sồi',
    dayWash: '#EAEFE8',
    nightWash: '#17211B',
    dayAccent: '#354F3E',
    nightAccent: '#89A892'
  },
  ochre: {
    key: 'ochre',
    label: 'Hoàng Thổ Ấm',
    dayWash: '#F4ECDD',
    nightWash: '#241E15',
    dayAccent: '#8A632D',
    nightAccent: '#D6A14E'
  },
  rosewood: {
    key: 'rosewood',
    label: 'Gỗ Hồng',
    dayWash: '#F2E7E3',
    nightWash: '#261A18',
    dayAccent: '#914D41',
    nightAccent: '#CE7E6F'
  },
  lavender: {
    key: 'lavender',
    label: 'Hoa Chuông Tím',
    dayWash: '#ECEAF1',
    nightWash: '#1E1D27',
    dayAccent: '#585270',
    nightAccent: '#A69EC2'
  }
};

export function focalPointClass(focal: CoverFocalPoint): string {
  if (focal === 'top') return 'object-top';
  if (focal === 'bottom') return 'object-bottom';
  return 'object-center';
}

export function formatDurationShort(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 phút';
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} phút`;
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function estimateReadingMinutes(wordCount: number): string {
  const mins = Math.max(1, Math.round((wordCount || 0) / 160));
  return `~${mins} phút đọc`;
}

export function formatRelativePublishDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Mới cập nhật';
  const ts = Date.parse(isoDate);
  if (!Number.isFinite(ts)) return 'Mới cập nhật';

  const diffMs = Math.max(0, Date.now() - ts);
  const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;

  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}
