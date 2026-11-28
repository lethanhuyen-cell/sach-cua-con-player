import {
  AudienceFilterKey,
  getBookLineByCode,
  getConceptBySlug,
  matchesAudienceFilter
} from './knowledge';
import { isEpisodeReadingOnly } from './presets';
import {
  BookLineCode,
  HydratedBook,
  HydratedEpisode,
  LocalEpisodeProgress,
  LocalReadingProgress
} from './types';

export interface RecommendationContext {
  books: HydratedBook[];
  progressMap: Record<string, LocalEpisodeProgress>;
  readingProgressMap: Record<string, LocalReadingProgress>;
  favorites: string[];
  openedEpisodeIds: string[];
  audienceFilter: AudienceFilterKey;
  isNight: boolean;
}

export interface RecommendedBookItem {
  book: HydratedBook;
  score: number;
  reason: string;
}

export interface RecommendedEpisodeItem {
  book: HydratedBook;
  episode: HydratedEpisode;
  score: number;
  reason: string;
}

export interface LibraryRecommendationsResult {
  books: RecommendedBookItem[];
  episodes: RecommendedEpisodeItem[];
  hasUserActivity: boolean;
}

const MAX_REASON_LEN = 55;
const MAX_BOOKS = 6;
const MAX_EPISODES = 6;

function truncateReason(raw: string, maxLen = MAX_REASON_LEN): string {
  const clean = raw.normalize('NFC').trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > Math.floor(maxLen * 0.55) ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

function collectBookAndEpisodeLines(
  book: HydratedBook,
  ep?: HydratedEpisode
): BookLineCode[] {
  const lines: BookLineCode[] = [];
  if (ep?.knowledgeMeta?.primaryLine) lines.push(ep.knowledgeMeta.primaryLine);
  if (ep?.knowledgeMeta?.secondaryLines) lines.push(...ep.knowledgeMeta.secondaryLines);
  if (book.knowledgeMeta?.primaryLine) lines.push(book.knowledgeMeta.primaryLine);
  if (book.knowledgeMeta?.secondaryLines) lines.push(...book.knowledgeMeta.secondaryLines);
  return Array.from(new Set(lines));
}

function collectConcepts(book: HydratedBook, ep?: HydratedEpisode): string[] {
  return Array.from(
    new Set([
      ...(ep?.knowledgeMeta?.crossCuttingConcepts || []),
      ...(book.knowledgeMeta?.crossCuttingConcepts || [])
    ])
  );
}

/**
 * Động cơ gợi ý Tự thích ứng (Hybrid):
 * Kết hợp dữ liệu hành vi đọc/nghe trên thiết bị với tuyển chọn của Chủ thư viện (/admin).
 */
export function buildLibraryRecommendations(
  ctx: RecommendationContext
): LibraryRecommendationsResult {
  const visibleBooks = ctx.books.filter((b) =>
    matchesAudienceFilter(b, ctx.audienceFilter)
  );
  if (visibleBooks.length === 0) {
    return { books: [], episodes: [], hasUserActivity: false };
  }

  const favoriteSet = new Set(ctx.favorites);
  const openedSet = new Set(ctx.openedEpisodeIds);
  const interactedEpIds = new Set<string>();
  const completedEpIds = new Set<string>();
  const interactionRecency = new Map<string, number>();

  for (const book of ctx.books) {
    for (const ep of book.episodes) {
      const audioProg = ctx.progressMap[ep.id];
      const readProg = ctx.readingProgressMap[ep.id];
      const isFav = favoriteSet.has(ep.id);
      const isOpened = openedSet.has(ep.id);

      const audioActive = Boolean(audioProg && (audioProg.positionSeconds > 0 || audioProg.completed));
      const readActive = Boolean(readProg && (readProg.scrollPercent > 0 || readProg.completed));

      if (audioProg?.completed || readProg?.completed) {
        completedEpIds.add(ep.id);
      }
      if (audioActive || readActive || isFav || isOpened) {
        interactedEpIds.add(ep.id);
        const ts = Math.max(audioProg?.updatedAt || 0, readProg?.updatedAt || 0, isFav ? 1 : 0);
        interactionRecency.set(ep.id, ts);
      }
    }
  }

  const hasUserActivity = interactedEpIds.size > 0;
  const engagedLineCodes = new Set<BookLineCode>();
  const engagedConcepts = new Set<string>();
  const activeUnfinishedBookIds = new Set<string>();
  const nextUpEpIds = new Set<string>();
  const curiosityTargets = new Map<
    string,
    { sourceEpisode: HydratedEpisode; bridgeQuestion: string; priority: number }
  >();

  for (const book of ctx.books) {
    let latestInteractedIdx = -1;
    let latestRecency = -1;

    book.episodes.forEach((ep, idx) => {
      if (!interactedEpIds.has(ep.id)) return;

      for (const code of collectBookAndEpisodeLines(book, ep)) {
        engagedLineCodes.add(code);
      }
      for (const concept of collectConcepts(book, ep)) {
        engagedConcepts.add(concept);
      }

      const recency = interactionRecency.get(ep.id) || 0;
      const priority = recency + (favoriteSet.has(ep.id) ? 1e12 : 0);
      if (recency >= latestRecency) {
        latestRecency = recency;
        latestInteractedIdx = idx;
      }

      for (const trail of ep.knowledgeMeta?.curiosityTrails || []) {
        const existing = curiosityTargets.get(trail.targetEpisodeId);
        if (!existing || priority > existing.priority) {
          curiosityTargets.set(trail.targetEpisodeId, {
            sourceEpisode: ep,
            bridgeQuestion: trail.bridgeQuestion,
            priority
          });
        }
      }
    });

    if (latestInteractedIdx >= 0) {
      const hasUnfinished = book.episodes.some((ep) => !completedEpIds.has(ep.id));
      if (hasUnfinished) {
        activeUnfinishedBookIds.add(book.id);
      }

      const forwardNext = book.episodes
        .slice(latestInteractedIdx + 1)
        .find((ep) => !completedEpIds.has(ep.id) && !interactedEpIds.has(ep.id));
      const fallbackNext =
        forwardNext ||
        book.episodes.find((ep) => !completedEpIds.has(ep.id) && !interactedEpIds.has(ep.id));
      if (fallbackNext) {
        nextUpEpIds.add(fallbackNext.id);
      }
    }
  }

  // 1. Score Books
  const scoredBooks: RecommendedBookItem[] = visibleBooks.map((book) => {
    const meta = book.knowledgeMeta;
    const adminBookCurated = meta?.isRecommended === true;
    const hasCuratedChildEp = book.episodes.some(
      (ep) => ep.knowledgeMeta?.isRecommended === true
    );

    let score = 0;
    if (adminBookCurated) score += 45;
    if (hasCuratedChildEp) score += 15;

    const isActiveUnfinished = activeUnfinishedBookIds.has(book.id);
    const primaryLineMatch = Boolean(
      meta?.primaryLine && engagedLineCodes.has(meta.primaryLine)
    );
    const secondaryLineMatch = Boolean(
      meta?.secondaryLines?.some((code) => engagedLineCodes.has(code))
    );
    const matchedConceptSlug = (meta?.crossCuttingConcepts || []).find((c) =>
      engagedConcepts.has(c)
    );
    const containsTrailTarget = book.episodes.some((ep) =>
      curiosityTargets.has(ep.id)
    );

    if (hasUserActivity) {
      if (isActiveUnfinished) score += 35;
      if (primaryLineMatch) score += 25;
      else if (secondaryLineMatch) score += 18;
      if (matchedConceptSlug) score += 18;
      if (containsTrailTarget) score += 28;
    }

    if (ctx.isNight && meta?.listeningRhythm === 'wind_down') score += 12;
    if (!ctx.isNight && meta?.listeningRhythm === 'curious_evening') score += 10;

    let reason = '';
    if (hasUserActivity && (isActiveUnfinished || containsTrailTarget || primaryLineMatch || matchedConceptSlug)) {
      if (containsTrailTarget && !isActiveUnfinished) {
        reason = 'Nối mạch khám phá từ truyện bạn đã nghe';
      } else if (isActiveUnfinished) {
        reason = 'Tiếp nối bộ sách bạn đang mở';
      } else if (primaryLineMatch && meta?.primaryLine) {
        const lineTitle = getBookLineByCode(meta.primaryLine)?.title;
        reason = lineTitle ? `Cùng mạch ${lineTitle}` : 'Cùng dòng sách bạn đang nghe';
      } else if (matchedConceptSlug) {
        const cLabel = getConceptBySlug(matchedConceptSlug)?.label;
        reason = cLabel ? `Cùng chủ đề ${cLabel}` : 'Cùng khái niệm bạn quan tâm';
      }
    }

    if (!reason && meta?.recommendedNote) {
      reason = meta.recommendedNote;
    }
    if (!reason && adminBookCurated) {
      reason = 'Thư viện chọn lọc';
    }
    if (!reason) {
      reason = ctx.isNight
        ? 'Nhịp kể êm dịu trước giờ ngủ'
        : 'Gợi ý mở đầu từ Thư viện';
    }

    return {
      book,
      score,
      reason: truncateReason(reason)
    };
  });

  scoredBooks.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const orderA = a.book.knowledgeMeta?.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.book.knowledgeMeta?.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.book.sortOrder - b.book.sortOrder;
  });

  // 2. Score Episodes
  const uncompletedCandidates: RecommendedEpisodeItem[] = [];
  const completedCandidates: RecommendedEpisodeItem[] = [];

  for (const book of visibleBooks) {
    for (const ep of book.episodes) {
      const epMeta = ep.knowledgeMeta;
      const trailMatch = curiosityTargets.get(ep.id);
      const epCurated = epMeta?.isRecommended === true;
      const isNextUp = nextUpEpIds.has(ep.id);

      const epConcepts = collectConcepts(book, ep);
      const matchedConceptSlug = hasUserActivity
        ? epConcepts.find((c) => engagedConcepts.has(c))
        : undefined;
      const hasSecondaryLineMatch =
        hasUserActivity &&
        Boolean(epMeta?.secondaryLines?.some((c) => engagedLineCodes.has(c)));

      let score = 0;
      if (trailMatch) score += 60;
      if (epCurated) score += 50;
      if (isNextUp) score += 42;
      if (hasUserActivity && (matchedConceptSlug || hasSecondaryLineMatch)) score += 30;

      const epRhythm = epMeta?.listeningRhythm || book.knowledgeMeta?.listeningRhythm;
      const hasAudio = !isEpisodeReadingOnly(ep);
      if (
        (ctx.isNight && (epRhythm === 'wind_down' || hasAudio)) ||
        (!ctx.isNight && epRhythm === 'curious_evening')
      ) {
        score += 15;
      }
      if (hasAudio) score += 4;
      if (book.knowledgeMeta?.isRecommended) score += 2;

      let reason = '';
      if (trailMatch) {
        reason = `Nối mạch từ Tập ${trailMatch.sourceEpisode.episodeCode}: ${trailMatch.sourceEpisode.title}`;
      } else if (epCurated) {
        reason = epMeta?.recommendedNote || 'Thư viện đề cử';
      } else if (isNextUp) {
        reason = 'Tập tiếp nối mạch truyện đang mở';
      } else if (matchedConceptSlug) {
        const cLabel = getConceptBySlug(matchedConceptSlug)?.label;
        reason = cLabel ? `Cùng khái niệm ${cLabel}` : 'Cùng mạch khám phá bạn đã đọc';
      } else {
        reason = ctx.isNight
          ? 'Hợp nhịp nghe êm trước giờ ngủ'
          : 'Gợi ý khám phá hôm nay';
      }

      const item: RecommendedEpisodeItem = {
        book,
        episode: ep,
        score,
        reason: truncateReason(reason)
      };

      if (completedEpIds.has(ep.id)) {
        completedCandidates.push(item);
      } else {
        uncompletedCandidates.push(item);
      }
    }
  }

  const compareEpisodes = (a: RecommendedEpisodeItem, b: RecommendedEpisodeItem) => {
    if (b.score !== a.score) return b.score - a.score;
    const orderA = a.episode.knowledgeMeta?.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.episode.knowledgeMeta?.recommendedOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    if (a.episode.sortOrder !== b.episode.sortOrder) {
      return a.episode.sortOrder - b.episode.sortOrder;
    }
    return a.book.sortOrder - b.book.sortOrder;
  };

  uncompletedCandidates.sort(compareEpisodes);
  completedCandidates.sort(compareEpisodes);

  const candidatePool =
    uncompletedCandidates.length >= 4
      ? uncompletedCandidates
      : [...uncompletedCandidates, ...completedCandidates];

  const selectedEpisodes: RecommendedEpisodeItem[] = [];
  const bookPickCounts = new Map<string, number>();
  const maxPerBook = visibleBooks.length >= 2 ? 3 : MAX_EPISODES;

  // Pick top episodes respecting per-book cap and preferring variety across books
  const remaining = [...candidatePool];
  while (selectedEpisodes.length < MAX_EPISODES && remaining.length > 0) {
    const lastBookId =
      selectedEpisodes.length > 0
        ? selectedEpisodes[selectedEpisodes.length - 1].book.id
        : null;

    let pickIdx = remaining.findIndex(
      (item) =>
        (bookPickCounts.get(item.book.id) || 0) < maxPerBook &&
        item.book.id !== lastBookId
    );
    if (pickIdx === -1) {
      pickIdx = remaining.findIndex(
        (item) => (bookPickCounts.get(item.book.id) || 0) < maxPerBook
      );
    }
    if (pickIdx === -1) break;

    const [chosen] = remaining.splice(pickIdx, 1);
    selectedEpisodes.push(chosen);
    bookPickCounts.set(chosen.book.id, (bookPickCounts.get(chosen.book.id) || 0) + 1);
  }

  return {
    books: scoredBooks.slice(0, MAX_BOOKS),
    episodes: selectedEpisodes,
    hasUserActivity
  };
}
