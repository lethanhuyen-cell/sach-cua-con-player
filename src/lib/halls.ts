import { Book, BookPreset } from './types';
import { getBookLineByCode } from './knowledge';

export type LibraryHallSlug =
  | 'thien-nhien-ky-thu'
  | 'chuyen-xua-va-the-gioi'
  | 'the-gioi-hom-nay'
  | 'lon-len-moi-ngay'
  | 'vuon-tri-tue';

export interface LibraryHallDefinition {
  slug: LibraryHallSlug;
  title: string;
  shortTitle: string;
  epigraph: string;
  preset: BookPreset;
  dayHeroUrl: string;
  nightHeroUrl: string;
}

export const FOYER_HERO_ART = {
  day: '/images/home/foyer-day.jpg',
  night: '/images/home/foyer-night.jpg'
} as const;

export const LIBRARY_HALLS: LibraryHallDefinition[] = [
  {
    slug: 'thien-nhien-ky-thu',
    title: 'Kệ Thiên nhiên kỳ thú',
    shortTitle: 'Thiên nhiên kỳ thú',
    epigraph: 'Vũ trụ, Trái Đất, muôn loài, khoa học',
    preset: 'moss',
    dayHeroUrl: '/images/halls/thien-nhien-ky-thu-day.jpg',
    nightHeroUrl: '/images/halls/thien-nhien-ky-thu-night.jpg'
  },
  {
    slug: 'chuyen-xua-va-the-gioi',
    title: 'Kệ Chuyện xưa và thế giới',
    shortTitle: 'Chuyện xưa và thế giới',
    epigraph: 'Lịch sử, Việt Nam, các nền văn hóa',
    preset: 'ochre',
    dayHeroUrl: '/images/halls/chuyen-xua-va-the-gioi-day.jpg',
    nightHeroUrl: '/images/halls/chuyen-xua-va-the-gioi-night.jpg'
  },
  {
    slug: 'the-gioi-hom-nay',
    title: 'Kệ Thế giới hôm nay',
    shortTitle: 'Thế giới hôm nay',
    epigraph: 'Kinh tế, xã hội, phát minh, công nghệ',
    preset: 'ochre',
    dayHeroUrl: '/images/halls/the-gioi-hom-nay-day.jpg',
    nightHeroUrl: '/images/halls/the-gioi-hom-nay-night.jpg'
  },
  {
    slug: 'lon-len-moi-ngay',
    title: 'Kệ Lớn lên mỗi ngày',
    shortTitle: 'Lớn lên mỗi ngày',
    epigraph: 'Cơ thể, cảm xúc, tình bạn, kỹ năng sống',
    preset: 'rosewood',
    dayHeroUrl: '/images/halls/lon-len-moi-ngay-day.jpg',
    nightHeroUrl: '/images/halls/lon-len-moi-ngay-night.jpg'
  },
  {
    slug: 'vuon-tri-tue',
    title: 'Kệ Vườn trí tuệ',
    shortTitle: 'Vườn trí tuệ',
    epigraph: 'Văn học, nghệ thuật, triết học, tư duy',
    preset: 'lavender',
    dayHeroUrl: '/images/halls/vuon-tri-tue-day.jpg',
    nightHeroUrl: '/images/halls/vuon-tri-tue-night.jpg'
  }
];

const LEGACY_SLUG_MAP: Record<string, LibraryHallSlug> = {
  'khoa-hoc-tu-nhien': 'thien-nhien-ky-thu',
  'lich-su-van-hoa': 'chuyen-xua-va-the-gioi',
  'am-thuc-nep-nha': 'lon-len-moi-ngay',
  'ky-nang-lon-khon': 'lon-len-moi-ngay',
  'van-hoc-dong-thoai': 'vuon-tri-tue',
  'nghe-thuat-tho-nhac': 'vuon-tri-tue'
};

export function getHallBySlug(slug: string): LibraryHallDefinition | undefined {
  return LIBRARY_HALLS.find((h) => h.slug === slug);
}

export function resolveLegacyHallSlug(slug: string): LibraryHallSlug | undefined {
  return LEGACY_SLUG_MAP[slug];
}

const LEGACY_HALL_PREFIXES: Record<LibraryHallSlug, string[]> = {
  'thien-nhien-ky-thu': [
    'thiên nhiên kỳ thú',
    'kệ thiên nhiên kỳ thú',
    'gian thiên nhiên kỳ thú',
    'khoa học & tự nhiên',
    'gian khoa học & tự nhiên',
    'kệ khoa học & tự nhiên'
  ],
  'chuyen-xua-va-the-gioi': [
    'chuyện xưa và thế giới',
    'kệ chuyện xưa và thế giới',
    'gian chuyện xưa và thế giới',
    'lịch sử & văn hóa',
    'gian lịch sử & văn hóa',
    'kệ lịch sử & văn hóa'
  ],
  'the-gioi-hom-nay': [
    'thế giới hôm nay',
    'kệ thế giới hôm nay',
    'gian thế giới hôm nay',
    'kinh tế & công nghệ',
    'phát minh & công nghệ'
  ],
  'lon-len-moi-ngay': [
    'lớn lên mỗi ngày',
    'kệ lớn lên mỗi ngày',
    'gian lớn lên mỗi ngày',
    'kỹ năng sống',
    'kỹ năng & lớn khôn',
    'gian kỹ năng sống',
    'kệ kỹ năng sống',
    'ẩm thực & nếp nhà',
    'gian ẩm thực & nếp nhà',
    'kệ ẩm thực & nếp nhà'
  ],
  'vuon-tri-tue': [
    'vườn trí tuệ',
    'kệ vườn trí tuệ',
    'gian vườn trí tuệ',
    'văn học',
    'văn học & đồng thoại',
    'gian văn học',
    'kệ văn học',
    'nghệ thuật',
    'nghệ thuật & thơ nhạc',
    'gian nghệ thuật',
    'kệ nghệ thuật'
  ]
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
 * Tự động ánh xạ mỗi Bộ sách (tương thích cả nhãn cũ và 5 kệ mới) vào Kệ chính.
 */
export function resolveBookHall(
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'> & Partial<Pick<Book, 'knowledgeMeta'>>
): LibraryHallDefinition {
  const genreNorm = (book.genreTag || '').normalize('NFC').trim();
  const mainSegment = genreNorm.split('·')[0].split('+')[0].trim();
  const matchedMain = matchHallPrefix(mainSegment);
  if (matchedMain) return matchedMain;

  if (book.knowledgeMeta?.primaryLine) {
    const lineDef = getBookLineByCode(book.knowledgeMeta.primaryLine);
    const hallFromLine = lineDef ? getHallBySlug(lineDef.defaultHallSlug) : undefined;
    if (hallFromLine) return hallFromLine;
  }

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
    hay.includes('thiên nhiên') ||
    hay.includes('khoa học') ||
    hay.includes('tự nhiên') ||
    hay.includes('sinh học') ||
    hay.includes('vũ trụ') ||
    hay.includes('trái đất') ||
    hay.includes('muôn loài')
  ) {
    return LIBRARY_HALLS[0];
  }

  if (
    hay.includes('chuyện xưa') ||
    hay.includes('lịch sử') ||
    hay.includes('văn hóa') ||
    hay.includes('việt nam') ||
    hay.includes('danh nhân')
  ) {
    return LIBRARY_HALLS[1];
  }

  if (
    hay.includes('thế giới hôm nay') ||
    hay.includes('kinh tế') ||
    hay.includes('xã hội') ||
    hay.includes('phát minh') ||
    hay.includes('công nghệ')
  ) {
    return LIBRARY_HALLS[2];
  }

  if (
    hay.includes('lớn lên') ||
    hay.includes('cơ thể') ||
    hay.includes('cảm xúc') ||
    hay.includes('tình bạn') ||
    hay.includes('kỹ năng') ||
    hay.includes('lớn khôn') ||
    hay.includes('thói quen') ||
    hay.includes('ẩm thực') ||
    hay.includes('bếp') ||
    hay.includes('nếp nhà') ||
    hay.includes('ăn vụng') ||
    hay.includes('món ăn') ||
    hay.includes('đời sống')
  ) {
    return LIBRARY_HALLS[3];
  }

  if (
    hay.includes('vườn trí tuệ') ||
    hay.includes('văn học') ||
    hay.includes('nghệ thuật') ||
    hay.includes('triết học') ||
    hay.includes('tư duy') ||
    hay.includes('thơ') ||
    hay.includes('nhạc') ||
    hay.includes('hội họa') ||
    hay.includes('đồng thoại')
  ) {
    return LIBRARY_HALLS[4];
  }

  return LIBRARY_HALLS[4];
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
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'> & Partial<Pick<Book, 'knowledgeMeta'>>
): LibraryHallDefinition[] {
  const parsed = parseAdminHallGenre(book.genreTag || '');
  const primary = resolveBookHall(book);
  const halls: LibraryHallDefinition[] = [primary];

  if (parsed.secondaryHallSlug && parsed.secondaryHallSlug !== primary.slug) {
    const secondary = getHallBySlug(parsed.secondaryHallSlug);
    if (secondary) halls.push(secondary);
  } else if (book.knowledgeMeta?.secondaryLines && book.knowledgeMeta.secondaryLines.length > 0) {
    for (const secCode of book.knowledgeMeta.secondaryLines) {
      const lineDef = getBookLineByCode(secCode);
      const secHall = lineDef ? getHallBySlug(lineDef.defaultHallSlug) : undefined;
      if (secHall && !halls.some((h) => h.slug === secHall.slug)) {
        halls.push(secHall);
        break;
      }
    }
  }
  return halls;
}

export function formatBookDisplayGenre(
  book: Pick<Book, 'genreTag' | 'title' | 'subtitle'> & Partial<Pick<Book, 'knowledgeMeta'>>
): string {
  const halls = resolveBookHalls(book);
  if (book.knowledgeMeta?.primaryLine) {
    const primaryLine = getBookLineByCode(book.knowledgeMeta.primaryLine);
    if (primaryLine) {
      return `${halls[0].shortTitle} · ${primaryLine.title}`;
    }
  }
  if (halls.length >= 2) {
    return `${halls[0].shortTitle} · ${halls[1].shortTitle}`;
  }
  return halls[0].shortTitle;
}
