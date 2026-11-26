import { Book, BookPreset } from './types';

export type LibraryHallSlug =
  | 'khoa-hoc-tu-nhien'
  | 'am-thuc-nep-nha'
  | 'van-hoc-dong-thoai'
  | 'lich-su-van-hoa'
  | 'nghe-thuat-tho-nhac'
  | 'ky-nang-lon-khon';

export interface LibraryHallDefinition {
  slug: LibraryHallSlug;
  title: string;
  shortTitle: string;
  epigraph: string;
  preset: BookPreset;
}

export const LIBRARY_HALLS: LibraryHallDefinition[] = [
  {
    slug: 'khoa-hoc-tu-nhien',
    title: 'Gian Khoa học & Tự nhiên',
    shortTitle: 'Khoa học & Tự nhiên',
    epigraph: 'Cây cỏ, muông thú, bầu trời và thế giới tự nhiên.',
    preset: 'moss'
  },
  {
    slug: 'am-thuc-nep-nha',
    title: 'Gian Ẩm thực & Nếp nhà',
    shortTitle: 'Ẩm thực & Nếp nhà',
    epigraph: 'Chuyện căn bếp, món ngon và đời sống hằng ngày.',
    preset: 'ochre'
  },
  {
    slug: 'van-hoc-dong-thoai',
    title: 'Gian Văn học',
    shortTitle: 'Văn học',
    epigraph: 'Truyện đồng thoại, truyện ngắn và tiểu thuyết thiếu nhi.',
    preset: 'rosewood'
  },
  {
    slug: 'lich-su-van-hoa',
    title: 'Gian Lịch sử & Văn hóa',
    shortTitle: 'Lịch sử & Văn hóa',
    epigraph: 'Chuyện xưa, con người và những vùng đất.',
    preset: 'ochre'
  },
  {
    slug: 'nghe-thuat-tho-nhac',
    title: 'Gian Nghệ thuật',
    shortTitle: 'Nghệ thuật',
    epigraph: 'Hội họa, âm nhạc và thơ ca.',
    preset: 'lavender'
  },
  {
    slug: 'ky-nang-lon-khon',
    title: 'Gian Kỹ năng sống',
    shortTitle: 'Kỹ năng sống',
    epigraph: 'Những điều nhỏ giúp mình tự lập và thấu hiểu.',
    preset: 'moss'
  }
];

export function getHallBySlug(slug: string): LibraryHallDefinition | undefined {
  return LIBRARY_HALLS.find((h) => h.slug === slug);
}

const LEGACY_HALL_PREFIXES: Record<LibraryHallSlug, string[]> = {
  'khoa-hoc-tu-nhien': ['khoa học & tự nhiên'],
  'am-thuc-nep-nha': ['ẩm thực & nếp nhà'],
  'van-hoc-dong-thoai': ['văn học', 'văn học & đồng thoại'],
  'lich-su-van-hoa': ['lịch sử & văn hóa'],
  'nghe-thuat-tho-nhac': ['nghệ thuật', 'nghệ thuật & thơ nhạc'],
  'ky-nang-lon-khon': ['kỹ năng sống', 'kỹ năng & lớn khôn']
};

function matchHallPrefix(raw: string): LibraryHallDefinition | undefined {
  const norm = raw.normalize('NFC').trim().toLowerCase();
  if (!norm) return undefined;
  for (const h of LIBRARY_HALLS) {
    const aliases = LEGACY_HALL_PREFIXES[h.slug] || [];
    if (
      norm === h.shortTitle.toLowerCase() ||
      norm === h.title.toLowerCase() ||
      aliases.includes(norm)
    ) {
      return h;
    }
  }
  return undefined;
}

/**
 * Tự động ánh xạ mỗi Bộ sách (tương thích cả nhãn cũ và nhãn ngắn mới) vào Gian chính.
 */
export function resolveBookHall(
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'>
): LibraryHallDefinition {
  const genreNorm = (book.genreTag || '').normalize('NFC').trim();
  const mainSegment = genreNorm.split('·')[0].split('+')[0].trim();
  const matchedMain = matchHallPrefix(mainSegment);
  if (matchedMain) return matchedMain;

  const genreLower = genreNorm.toLowerCase();
  for (const h of LIBRARY_HALLS) {
    if (genreLower.startsWith(h.shortTitle.toLowerCase())) {
      return h;
    }
  }

  const hay = `${book.genreTag || ''} ${book.subtitle || ''} ${book.title || ''}`
    .normalize('NFC')
    .toLowerCase();

  if (
    hay.includes('khoa học') ||
    hay.includes('tự nhiên') ||
    hay.includes('thiên nhiên') ||
    hay.includes('sinh học') ||
    hay.includes('vũ trụ')
  ) {
    return LIBRARY_HALLS[0];
  }

  if (
    hay.includes('ẩm thực') ||
    hay.includes('bếp') ||
    hay.includes('nếp nhà') ||
    hay.includes('ăn vụng') ||
    hay.includes('món ăn') ||
    hay.includes('đời sống')
  ) {
    return LIBRARY_HALLS[1];
  }

  if (hay.includes('lịch sử') || hay.includes('văn hóa') || hay.includes('danh nhân')) {
    return LIBRARY_HALLS[3];
  }

  if (
    hay.includes('nghệ thuật') ||
    hay.includes('thơ') ||
    hay.includes('nhạc') ||
    hay.includes('hội họa') ||
    hay.includes('khúc ru')
  ) {
    return LIBRARY_HALLS[4];
  }

  if (
    hay.includes('kỹ năng') ||
    hay.includes('lớn khôn') ||
    hay.includes('cảm xúc') ||
    hay.includes('thói quen')
  ) {
    return LIBRARY_HALLS[5];
  }

  return LIBRARY_HALLS[2];
}

export function parseAdminHallGenre(genreTag: string): {
  hallSlug: LibraryHallSlug;
  secondaryHallSlug: LibraryHallSlug | null;
  subTag: string;
} {
  const norm = (genreTag || '').normalize('NFC').trim();
  const sepIdx = norm.indexOf('·');
  const headPart = sepIdx !== -1 ? norm.slice(0, sepIdx).trim() : norm;
  const tailSubTag = sepIdx !== -1 ? norm.slice(sepIdx + 1).trim() : '';

  const plusSegments = headPart
    .split('+')
    .map((s) => s.trim())
    .filter(Boolean);

  const primaryHall = resolveBookHall({
    genreTag: plusSegments[0] || norm,
    title: '',
    subtitle: ''
  });

  let secondaryHall: LibraryHallDefinition | undefined;
  if (plusSegments.length > 1) {
    const candidate = matchHallPrefix(plusSegments[1]);
    if (candidate && candidate.slug !== primaryHall.slug) {
      secondaryHall = candidate;
    }
  }

  const matchedFirst = plusSegments[0] ? matchHallPrefix(plusSegments[0]) : undefined;
  const subTag = tailSubTag || (matchedFirst ? '' : norm);

  return {
    hallSlug: primaryHall.slug,
    secondaryHallSlug: secondaryHall ? secondaryHall.slug : null,
    subTag
  };
}

export function formatAdminHallGenre(
  hallSlug: LibraryHallSlug,
  subTag: string,
  secondaryHallSlug?: LibraryHallSlug | null
): string {
  const hall = getHallBySlug(hallSlug) || LIBRARY_HALLS[0];
  const secondary =
    secondaryHallSlug && secondaryHallSlug !== hall.slug
      ? getHallBySlug(secondaryHallSlug)
      : undefined;
  const baseLabel = secondary ? `${hall.shortTitle} + ${secondary.shortTitle}` : hall.shortTitle;

  const cleanSub = subTag.trim();
  const aliases = LEGACY_HALL_PREFIXES[hall.slug] || [hall.shortTitle.toLowerCase()];
  if (!cleanSub || aliases.includes(cleanSub.toLowerCase())) {
    return baseLabel;
  }
  return `${baseLabel} · ${cleanSub}`;
}

export function resolveBookHalls(
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'>
): LibraryHallDefinition[] {
  const parsed = parseAdminHallGenre(book.genreTag || '');
  const primary = resolveBookHall(book);
  const halls: LibraryHallDefinition[] = [primary];

  if (parsed.secondaryHallSlug && parsed.secondaryHallSlug !== primary.slug) {
    const secondary = getHallBySlug(parsed.secondaryHallSlug);
    if (secondary) halls.push(secondary);
  }
  return halls;
}

export function formatBookDisplayGenre(
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'>
): string {
  const halls = resolveBookHalls(book);
  if (halls.length >= 2) {
    return `${halls[0].shortTitle} · ${halls[1].shortTitle}`;
  }
  return halls[0].shortTitle;
}
