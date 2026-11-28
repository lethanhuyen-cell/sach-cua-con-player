'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { HydratedBook } from '@/lib/types';
import { LIBRARY_HALLS, LibraryHallDefinition } from '@/lib/halls';
import {
  BOOK_PRESETS,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';
import {
  AUDIENCE_FILTER_PILLS,
  AudienceFilterKey,
  matchesAudienceFilter
} from '@/lib/knowledge';
import {
  buildLibraryRecommendations,
  RecommendedBookItem
} from '@/lib/recommendations';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/ui/BookCover';
import { StorybookHeroStage } from '@/components/ui/StorybookHeroStage';
import { LibraryWayfinder } from '@/components/layout/LibraryWayfinder';
import {
  BookmarkIcon,
  BookOpenIcon,
  CompassIcon,
  CuratedSparkIcon,
  FeatherIcon,
  InventionSparkIcon,
  LanternIcon,
  LeafIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SunIcon
} from '@/components/ui/Icons';

function HallGlyph({ slug }: { slug: LibraryHallDefinition['slug'] }) {
  switch (slug) {
    case 'thien-nhien-ky-thu':
      return <LeafIcon size={15} />;
    case 'chuyen-xua-va-the-gioi':
      return <CompassIcon size={15} />;
    case 'the-gioi-hom-nay':
      return <InventionSparkIcon size={15} />;
    case 'lon-len-moi-ngay':
      return <LanternIcon size={15} />;
    case 'vuon-tri-tue':
      return <FeatherIcon size={15} />;
    case 'co-the-ban-se-thich':
      return <CuratedSparkIcon size={15} />;
  }
}

export function HallShelfClient({
  hall,
  booksInHall,
  litHallSlugs
}: {
  hall: LibraryHallDefinition;
  booksInHall: HydratedBook[];
  litHallSlugs: string[];
}) {
  const {
    isNight,
    toggleNight,
    favorites,
    progressMap,
    readingProgressMap,
    openedEpisodeIds,
    isEpisodeNew,
    activeEpisode,
    isPlaying,
    playEpisode,
    openUtilitySheet
  } = useLibraryPlayer();

  const [audienceFilter, setAudienceFilter] = useState<AudienceFilterKey>('ALL');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('litibook_audience_filter_v1');
      if (saved === 'ALL' || saved === 'CHILD' || saved === 'TEEN') {
        setAudienceFilter(saved);
      }
    } catch {}
  }, []);

  const handleAudienceChange = (next: AudienceFilterKey) => {
    setAudienceFilter(next);
    try {
      localStorage.setItem('litibook_audience_filter_v1', next);
    } catch {}
  };

  const isCuratedHall = hall.kind === 'curated';
  const preset = BOOK_PRESETS[hall.preset] || BOOK_PRESETS.moss;
  const washBg = isNight ? preset.nightWash : preset.dayWash;

  const curatedRecommendations = useMemo(() => {
    if (!isCuratedHall) return null;
    return buildLibraryRecommendations({
      books: booksInHall,
      progressMap,
      readingProgressMap,
      favorites,
      openedEpisodeIds,
      audienceFilter,
      isNight
    });
  }, [
    isCuratedHall,
    booksInHall,
    progressMap,
    readingProgressMap,
    favorites,
    openedEpisodeIds,
    audienceFilter,
    isNight
  ]);

  const filteredBooksInHall = useMemo(() => {
    if (isCuratedHall) {
      return curatedRecommendations?.books.map((item) => item.book) || [];
    }
    return booksInHall.filter((b) => matchesAudienceFilter(b, audienceFilter));
  }, [isCuratedHall, curatedRecommendations, booksInHall, audienceFilter]);

  const shelfRows = useMemo(() => {
    const rows: HydratedBook[][] = [];
    for (let i = 0; i < filteredBooksInHall.length; i += 3) {
      rows.push(filteredBooksInHall.slice(i, i + 3));
    }
    return rows;
  }, [filteredBooksInHall]);

  const curatedBookRows = useMemo(() => {
    if (!curatedRecommendations) return [] as RecommendedBookItem[][];
    const items = curatedRecommendations.books;
    const rows: RecommendedBookItem[][] = [];
    const chunkSize = items.length <= 2 ? 2 : 3;
    for (let i = 0; i < items.length; i += chunkSize) {
      rows.push(items.slice(i, i + chunkSize));
    }
    return rows;
  }, [curatedRecommendations]);

  const formatBookStats = (book: HydratedBook): string => {
    const isAudioBook = book.episodes.some((ep) => !isEpisodeReadingOnly(ep));
    const completedAudioCount = book.episodes.filter(
      (ep) => progressMap[ep.id]?.completed
    ).length;
    const completedReadCount = book.episodes.filter(
      (ep) => readingProgressMap[ep.id]?.completed
    ).length;

    if (isAudioBook) {
      return completedAudioCount > 0
        ? `${completedAudioCount} / ${book.episodes.length} tập đã nghe`
        : `${book.episodes.length} tập`;
    }
    return completedReadCount > 0
      ? `${completedReadCount} / ${book.episodes.length} tập đã đọc`
      : `${book.episodes.length} tập · Đọc chữ`;
  };

  const oakShelfStyle: React.CSSProperties = isNight
    ? {
        background: 'linear-gradient(180deg, #3A2F24 0%, #261E16 100%)',
        border: '1px solid #4E3E30',
        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.45)'
      }
    : {
        background: 'linear-gradient(180deg, #E2D2BA 0%, #CBB594 100%)',
        border: '1px solid #B79F7D',
        boxShadow: '0 6px 14px rgba(72, 54, 34, 0.14)'
      };

  const suggestedLitHalls = useMemo(
    () => LIBRARY_HALLS.filter((h) => h.slug !== hall.slug && litHallSlugs.includes(h.slug)),
    [hall.slug, litHallSlugs]
  );

  return (
    <div className="pb-6">
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[48px] md:h-[54px] px-2.5 sm:px-3.5 md:px-6 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="shelf" shelfBranch="hall" currentHall={hall} />

        <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
          <button
            type="button"
            onClick={() => openUtilitySheet('search')}
            aria-label="Tìm kiếm"
            style={{ color: 'var(--text-primary)' }}
            className="w-[34px] h-[34px] md:w-[36px] md:h-[36px] rounded-[8px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
          >
            <SearchIcon
              size={19}
              strokeWidth={1.85}
              className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]"
            />
          </button>
          <button
            type="button"
            onClick={() => openUtilitySheet('saved')}
            aria-label="Đã lưu"
            style={{
              color: favorites.length > 0 ? 'var(--accent-berry)' : 'var(--text-primary)'
            }}
            className="w-[34px] h-[34px] md:w-[36px] md:h-[36px] rounded-[8px] hover:bg-[var(--bg-surface)] flex items-center justify-center relative transition"
          >
            <BookmarkIcon
              size={19}
              strokeWidth={1.85}
              filled={favorites.length > 0}
              className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]"
            />
            {favorites.length > 0 && (
              <span
                aria-hidden="true"
                style={{ backgroundColor: 'var(--accent-warm)' }}
                className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5"
              />
            )}
          </button>
          <button
            type="button"
            onClick={toggleNight}
            aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
            style={{ color: 'var(--text-primary)' }}
            className="w-[34px] h-[34px] md:w-[36px] md:h-[36px] rounded-[8px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
          >
            {isNight ? (
              <SunIcon
                size={19}
                strokeWidth={1.85}
                className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]"
              />
            ) : (
              <MoonIcon
                size={19}
                strokeWidth={1.85}
                className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]"
              />
            )}
          </button>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[216px_1fr] lg:grid-cols-[236px_1fr] md:gap-6 md:px-6 md:pt-4 md:items-start">
        <div className="md:sticky md:top-[68px]">
          <StorybookHeroStage
            src={isNight ? hall.nightHeroUrl : hall.dayHeroUrl}
            alt={hall.title}
            washBg={washBg}
            variant="immersive"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    color: isCuratedHall
                      ? 'var(--accent-warm)'
                      : isNight
                        ? preset.nightAccent
                        : preset.dayAccent
                  }}
                >
                  <HallGlyph slug={hall.slug} />
                </span>
                <h1 className="text-[17px] font-bold font-editorial leading-snug">{hall.title}</h1>
              </div>
              <p className="text-[11.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {isCuratedHall
                  ? 'Gợi ý kết hợp từ mạch đọc trên thiết bị và tuyển chọn của Thư viện'
                  : hall.epigraph}
              </p>
            </div>
          </StorybookHeroStage>
        </div>

        <section aria-label="Kệ sách" className="px-3.5 md:px-0 pt-3.5 md:pt-0 space-y-5 min-w-0">
        {booksInHall.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {AUDIENCE_FILTER_PILLS.map((pill) => {
              const active = audienceFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => handleAudienceChange(pill.key)}
                  style={{
                    backgroundColor: active ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: active
                      ? '1.5px solid var(--accent-primary)'
                      : '1px solid var(--border-hairline)'
                  }}
                  className="h-7 px-2.5 rounded-full text-[11.5px] font-medium whitespace-nowrap shrink-0"
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}

        {filteredBooksInHall.length === 0 ? (
          <div className="space-y-6">
            <div>
              <div className="py-10 text-center space-y-2">
                <p
                  className="text-sm font-editorial"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {booksInHall.length === 0
                    ? 'Chưa có sách trên kệ này.'
                    : 'Chưa có bộ sách nào thuộc nhóm tuổi đang chọn trên kệ này.'}
                </p>
                {booksInHall.length > 0 && audienceFilter !== 'ALL' && (
                  <button
                    type="button"
                    onClick={() => handleAudienceChange('ALL')}
                    style={{ color: 'var(--accent-primary)' }}
                    className="text-xs font-semibold underline"
                  >
                    Xem tất cả độ tuổi trên kệ
                  </button>
                )}
              </div>
              <div style={oakShelfStyle} className="h-[10px] rounded-[4px]" />
            </div>

            {suggestedLitHalls.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <p className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                  Các kệ đã có sách
                </p>
                <div className="space-y-2">
                  {suggestedLitHalls.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/halls/${other.slug}`}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="rounded-[10px] p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-semibold font-editorial truncate">
                        {other.title}
                      </span>
                      <span
                        className="text-xs font-medium shrink-0"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Mở kệ &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isCuratedHall && curatedRecommendations ? (
          <div className="space-y-6">
            {/* TẦNG 1: BỘ SÁCH GỢI Ý TRÊN KỆ GỖ SỒI */}
            <div className="space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-[15.5px] font-bold font-editorial">Bộ sách gợi ý cho bạn</h2>
                <span
                  className="text-[11px] font-semibold tabular-nums"
                  style={{ color: 'var(--accent-warm)' }}
                >
                  {curatedRecommendations.books.length} bộ chọn lọc
                </span>
              </div>

              {curatedBookRows.map((row, rowIdx) => {
                const useTwoCols = curatedRecommendations.books.length <= 2;
                const gridColsClass = useTwoCols
                  ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 px-1'
                  : 'grid grid-cols-3 gap-3 md:gap-4 px-1';
                const emptySlots = useTwoCols
                  ? Math.max(0, 2 - row.length)
                  : Math.max(0, 3 - row.length);

                return (
                  <div key={`curated-row-${rowIdx}`}>
                    <div className={`${gridColsClass} items-end`}>
                      {row.map(({ book }) => (
                        <Link
                          key={book.id}
                          href={`/books/${book.slug}`}
                          className="block transition active:scale-[0.98]"
                        >
                          <BookCover
                            src={book.coverUrl}
                            alt={book.title}
                            focalPoint={book.coverFocalPoint}
                          />
                        </Link>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, emptyIdx) => (
                        <div key={`empty-curated-cover-${rowIdx}-${emptyIdx}`} aria-hidden="true" />
                      ))}
                    </div>

                    <div
                      aria-hidden="true"
                      style={oakShelfStyle}
                      className="h-[8px] rounded-[4px] mt-0.5"
                    />

                    <div className={`${gridColsClass} pt-2`}>
                      {row.map(({ book, reason }) => (
                        <Link key={book.id} href={`/books/${book.slug}`} className="block min-w-0">
                          <h3 className="text-[13.5px] md:text-[14px] font-semibold font-editorial line-clamp-2">
                            {book.title}
                          </h3>
                          <p
                            className="text-[11px] font-medium leading-snug line-clamp-2 mt-0.5"
                            style={{ color: 'var(--accent-warm)' }}
                          >
                            {reason}
                          </p>
                          <p
                            className="text-[11px] mt-0.5 tabular-nums truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {formatBookStats(book)}
                          </p>
                        </Link>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, emptyIdx) => (
                        <div key={`empty-curated-meta-${rowIdx}-${emptyIdx}`} aria-hidden="true" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TẦNG 2: TẬP TRUYỆN GỢI Ý TIẾP NỐI (4-6 THẺ NGANG 1 CHẠM) */}
            {curatedRecommendations.episodes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-[15.5px] font-bold font-editorial">
                    {isNight ? 'Tập truyện gợi ý tối nay' : 'Tập truyện gợi ý tiếp nối'}
                  </h2>
                  <span
                    className="text-[11px] font-semibold tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {curatedRecommendations.episodes.length} gợi ý
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {curatedRecommendations.episodes.map(({ book, episode, reason }) => {
                    const isItemPlaying = activeEpisode?.id === episode.id && isPlaying;
                    const durLabel = getEpisodeDurationLabel(episode, { prefixTextOnly: true });
                    const epHasAudio = !isEpisodeReadingOnly(episode);

                    return (
                      <div
                        key={episode.id}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="rounded-[10px] p-2.5 flex items-center gap-3 shadow-sm transition hover:shadow-md"
                      >
                        <Link
                          href={`/episodes/${episode.id}`}
                          className="w-[48px] shrink-0 block transition active:scale-[0.98]"
                        >
                          <BookCover
                            src={episode.effectiveCoverUrl}
                            alt={episode.title}
                            focalPoint={book.coverFocalPoint}
                          />
                        </Link>

                        <Link href={`/episodes/${episode.id}`} className="flex-1 min-w-0 space-y-0.5">
                          <p
                            className="text-[10.5px] font-semibold truncate"
                            style={{ color: 'var(--accent-warm)' }}
                          >
                            {reason}
                          </p>
                          <h3 className="text-[13.5px] font-bold font-editorial leading-snug line-clamp-1">
                            Tập {episode.episodeCode}: {episode.title}
                          </h3>
                          <p
                            className="text-[11px] truncate tabular-nums"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {book.title} · {durLabel}
                          </p>
                        </Link>

                        {epHasAudio ? (
                          <button
                            type="button"
                            aria-label={
                              isItemPlaying ? `Tạm dừng ${episode.title}` : `Nghe ${episode.title}`
                            }
                            onClick={() => playEpisode(book, episode)}
                            style={{
                              backgroundColor: isItemPlaying
                                ? 'var(--accent-primary)'
                                : 'var(--bg-surface)',
                              color: isItemPlaying
                                ? 'var(--accent-primary-fg)'
                                : 'var(--accent-primary)',
                              border: '1px solid var(--border-hairline)'
                            }}
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition"
                          >
                            {isItemPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                          </button>
                        ) : (
                          <Link
                            href={`/episodes/${episode.id}`}
                            aria-label={`Đọc ${episode.title}`}
                            style={{
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--accent-primary)',
                              border: '1px solid var(--border-hairline)'
                            }}
                            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition"
                          >
                            <BookOpenIcon size={15} />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          shelfRows.map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className="grid grid-cols-3 gap-3 md:gap-4 px-1 items-end">
                {row.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    className="block transition active:scale-[0.98]"
                  >
                    <BookCover
                      src={book.coverUrl}
                      alt={book.title}
                      focalPoint={book.coverFocalPoint}
                    />
                  </Link>
                ))}
                {Array.from({ length: Math.max(0, 3 - row.length) }).map((_, emptyIdx) => (
                  <div key={`empty-cover-${rowIdx}-${emptyIdx}`} aria-hidden="true" />
                ))}
              </div>

              <div
                aria-hidden="true"
                style={oakShelfStyle}
                className="h-[8px] rounded-[4px] mt-0.5"
              />

              <div className="grid grid-cols-3 gap-3 md:gap-4 px-1 pt-2">
                {row.map((book) => {
                  const unreadNewEps = book.episodes.filter((ep) => isEpisodeNew(ep));
                  const latestNewEp =
                    unreadNewEps.length > 0 ? unreadNewEps[unreadNewEps.length - 1] : null;
                  const progressText = formatBookStats(book);

                  return (
                    <Link key={book.id} href={`/books/${book.slug}`} className="block min-w-0">
                      <h2 className="text-[13.5px] md:text-[14px] font-semibold font-editorial line-clamp-2">
                        {book.title}
                      </h2>
                      {book.author && (
                        <p
                          className="text-[11px] truncate mt-0.5"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {book.author}
                        </p>
                      )}
                      <p
                        className="text-[11px] mt-0.5 tabular-nums truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {progressText}
                      </p>
                      {latestNewEp && (
                        <p
                          className="text-[10.5px] font-medium mt-0.5 truncate tabular-nums"
                          style={{ color: 'var(--accent-warm)' }}
                        >
                          {unreadNewEps.length > 1
                            ? `${unreadNewEps.length} tập mới · Tập ${latestNewEp.episodeCode}`
                            : `Mới: Tập ${latestNewEp.episodeCode}`}
                        </p>
                      )}
                    </Link>
                  );
                })}
                {Array.from({ length: Math.max(0, 3 - row.length) }).map((_, emptyIdx) => (
                  <div key={`empty-meta-${rowIdx}-${emptyIdx}`} aria-hidden="true" />
                ))}
              </div>
            </div>
          ))
        )}
        </section>
      </div>
    </div>
  );
}
