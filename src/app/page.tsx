'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ContinueSuggestion, useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/ui/BookCover';
import { LibraryWayfinder } from '@/components/layout/LibraryWayfinder';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
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
import {
  formatBookDisplayGenre,
  FOYER_HERO_ART,
  LIBRARY_HALLS,
  LibraryHallSlug,
  resolveBookHalls
} from '@/lib/halls';
import { buildLibraryRecommendations } from '@/lib/recommendations';
import {
  BOOK_PRESETS,
  formatClock,
  formatRelativePublishDate,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';
import {
  AUDIENCE_FILTER_PILLS,
  AudienceFilterKey,
  matchesAudienceFilter
} from '@/lib/knowledge';

function getContinuePercent(item: ContinueSuggestion): number {
  if (item.mode === 'reading') {
    return Math.min(100, Math.max(0, item.scrollPercent));
  }
  if (item.durationSeconds > 0) {
    return Math.min(
      100,
      Math.round((item.progressSeconds / item.durationSeconds) * 100)
    );
  }
  return 0;
}

function HallIcon({ slug, size = 16 }: { slug: LibraryHallSlug; size?: number }) {
  switch (slug) {
    case 'thien-nhien-ky-thu':
      return <LeafIcon size={size} />;
    case 'chuyen-xua-va-the-gioi':
      return <CompassIcon size={size} />;
    case 'the-gioi-hom-nay':
      return <InventionSparkIcon size={size} />;
    case 'lon-len-moi-ngay':
      return <LanternIcon size={size} />;
    case 'vuon-tri-tue':
      return <FeatherIcon size={size} />;
    case 'co-the-ban-se-thich':
      return <CuratedSparkIcon size={size} />;
  }
}

export default function HomeLibraryPage() {
  const {
    books,
    isHydrated,
    isNight,
    toggleNight,
    favorites,
    progressMap,
    readingProgressMap,
    openedEpisodeIds,
    newEpisodesAcrossLibrary,
    activeEpisode,
    isPlaying,
    playEpisode,
    continueItems,
    openUtilitySheet,
    hasPassedGate,
    enterLibraryFromGate
  } = useLibraryPlayer();

  const [isOpeningGate, setIsOpeningGate] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isHeroZoomOpen, setIsHeroZoomOpen] = useState(false);
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

  useEffect(() => {
    if (!isHeroZoomOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsHeroZoomOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeroZoomOpen]);

  const visibleBooks = useMemo(
    () => books.filter((b) => matchesAudienceFilter(b, audienceFilter)),
    [books, audienceFilter]
  );

  const activeResumes = useMemo(() => continueItems.slice(0, 2), [continueItems]);
  const visibleNewEpisodes = useMemo(
    () =>
      newEpisodesAcrossLibrary.filter(({ book }) =>
        matchesAudienceFilter(book, audienceFilter)
      ),
    [newEpisodesAcrossLibrary, audienceFilter]
  );
  const recentArrivals = useMemo(
    () => visibleNewEpisodes.slice(0, 4),
    [visibleNewEpisodes]
  );

  // Group visible published books into the 5 thematic Halls
  const booksByHall = useMemo(() => {
    const map = new Map<LibraryHallSlug, typeof books>();
    for (const h of LIBRARY_HALLS) {
      map.set(h.slug, []);
    }
    for (const b of visibleBooks) {
      for (const hall of resolveBookHalls(b)) {
        const list = map.get(hall.slug) || [];
        if (!list.some((existing) => existing.id === b.id)) {
          list.push(b);
          map.set(hall.slug, list);
        }
      }
    }
    return map;
  }, [visibleBooks]);

  const curatedShelfData = useMemo(
    () =>
      buildLibraryRecommendations({
        books,
        progressMap,
        readingProgressMap,
        favorites,
        openedEpisodeIds,
        audienceFilter,
        isNight
      }),
    [
      books,
      progressMap,
      readingProgressMap,
      favorites,
      openedEpisodeIds,
      audienceFilter,
      isNight
    ]
  );

  const handleOpenGate = () => {
    if (isOpeningGate) return;
    setIsOpeningGate(true);
    setTimeout(() => {
      enterLibraryFromGate();
      setIsOpeningGate(false);
    }, 480);
  };

  if (!isHydrated) {
    return <div className="min-h-[80vh]" aria-hidden="true" />;
  }

  // ============================================================================
  // LỚP 1: CỔNG ĐỒI MƠ (Full-bleed 100vw × 100dvh, chữ & nút "Mời vào!" đè lên đáy tranh)
  // ============================================================================
  if (!hasPassedGate) {
    const gateArtSrc = isNight ? '/images/home/doi-mo-night.jpg' : '/images/home/doi-mo-day.jpg';
    return (
      <div
        className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none bg-[#101612] transition-all duration-500 ${
          isOpeningGate ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
        }`}
      >
        <img
          src={gateArtSrc}
          alt="Thư viện Đồi Mơ"
          className="w-full h-full object-cover object-center block select-none"
        />

        {/* Subtle Top Vignette for Day/Night Toggle Clarity */}
        <div
          aria-hidden="true"
          style={{
            background: 'linear-gradient(180deg, rgba(10,14,11,0.34) 0%, rgba(10,14,11,0) 100%)'
          }}
          className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        />

        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Giao diện ban ngày' : 'Giao diện ban đêm'}
          style={{
            backgroundColor: 'rgba(18, 24, 20, 0.52)',
            border: '1px solid rgba(248, 245, 238, 0.30)',
            color: '#F8F5EE'
          }}
          className="w-9 h-9 md:w-10 md:h-10 rounded-full backdrop-blur-md flex items-center justify-center absolute top-[max(14px,env(safe-area-inset-top))] right-4 md:top-5 md:right-6 z-20 shadow-sm transition hover:scale-105"
        >
          {isNight ? (
            <SunIcon size={18} strokeWidth={1.85} />
          ) : (
            <MoonIcon size={18} strokeWidth={1.85} />
          )}
        </button>

        {isNight && (
          <>
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle, rgba(212,172,110,0.42) 0%, rgba(212,172,110,0) 72%)'
              }}
              className="lantern-aura absolute top-[30%] left-[20%] w-20 h-20 rounded-full"
            />
            <div
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle, rgba(212,172,110,0.36) 0%, rgba(212,172,110,0) 72%)',
                animationDelay: '1.8s'
              }}
              className="lantern-aura absolute top-[28%] right-[18%] w-16 h-16 rounded-full"
            />
            <div
              aria-hidden="true"
              style={{ backgroundColor: '#F3D289' }}
              className="firefly-dot absolute bottom-[34%] left-[28%] w-1.5 h-1.5 rounded-full"
            />
            <div
              aria-hidden="true"
              style={{ backgroundColor: '#F3D289', animationDelay: '2.1s' }}
              className="firefly-dot absolute bottom-[40%] right-[26%] w-1.5 h-1.5 rounded-full"
            />
          </>
        )}

        {/* Bottom 1/3 Cinematic Scrim + Centered Title, Subtitle & "Mời vào!" CTA */}
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,11,0) 0%, rgba(10,14,11,0.58) 44%, rgba(9,13,10,0.90) 100%)'
          }}
          className="absolute inset-x-0 bottom-0 pt-16 md:pt-20 pb-[max(24px,calc(env(safe-area-inset-bottom)+16px))] md:pb-9 px-6 flex flex-col items-center text-center z-10"
        >
          <h1 className="text-[24px] sm:text-[28px] md:text-[34px] font-bold font-editorial text-[#F8F5EE] leading-snug tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Thư viện Đồi Mơ
          </h1>
          <p className="text-[13px] sm:text-[14px] md:text-[15.5px] mt-1 text-[#EFE9DC]/90 font-medium tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
            Sách đọc và nghe trước giờ đi ngủ
          </p>

          <button
            type="button"
            onClick={handleOpenGate}
            style={{
              backgroundColor: '#354F3E',
              color: '#F8F5EE',
              border: '1px solid rgba(248, 245, 238, 0.32)'
            }}
            className="mt-4 md:mt-5 h-[40px] md:h-[44px] px-7 md:px-9 rounded-full text-[13.5px] md:text-[14.5px] font-semibold inline-flex items-center justify-center gap-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.36)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>Mời vào!</span>
            <ChevronRightIcon size={17} strokeWidth={1.95} />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LỚP 2: KHÔNG GIAN CHUNG (Tạp chí Sách Tranh Giàu Hình Ảnh + Menu Ghim 2x)
  // ============================================================================
  const foyerArtSrc = isNight ? FOYER_HERO_ART.night : FOYER_HERO_ART.day;
  const foyerWashBg = isNight ? BOOK_PRESETS.moss.nightWash : BOOK_PRESETS.moss.dayWash;
  const totalPublishedEpisodes = visibleBooks.reduce((sum, b) => sum + b.episodes.length, 0);

  const resumeSummaryLabel = (() => {
    if (activeResumes.length === 0) return '';
    const lead = activeResumes[0];
    const prefix =
      activeResumes.length > 1
        ? `Đang đọc & đang nghe (${activeResumes.length})`
        : lead.kind === 'next_up'
          ? 'Tập tiếp theo'
          : lead.mode === 'reading'
            ? 'Đang đọc'
            : 'Đang nghe';
    return `${prefix} · Tập ${lead.episode.episodeCode}: ${lead.episode.title}`;
  })();

  return (
    <div className="pb-6">
      {/* Compact Sticky Pinned Menu (48px Mobile / 54px Desktop) */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[48px] md:h-[54px] px-2.5 sm:px-3.5 md:px-6 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="foyer" />

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

      {/* Scenic Hero Stage + Centered "Không gian chung" + Minimalist 1-Line Collapsible Resume */}
      <section aria-label="Không gian chung" className="md:px-6 md:pt-3.5">
        <button
          type="button"
          onClick={() => setIsHeroZoomOpen(true)}
          aria-label="Chạm để xem toàn màn hình tranh Không gian chung"
          style={{ backgroundColor: foyerWashBg }}
          className="block relative w-full h-[136px] sm:h-[156px] md:h-[180px] lg:h-[196px] md:rounded-[12px] md:border md:border-[var(--border-hairline)] overflow-hidden select-none transition active:scale-[0.995]"
        >
          <img
            src={foyerArtSrc}
            alt="Không gian chung Thư viện Đồi Mơ"
            className="w-full h-full object-cover object-center block select-none"
          />
          <div
            aria-hidden="true"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, var(--bg-canvas) 100%)'
            }}
            className="absolute inset-0 pointer-events-none"
          />
        </button>

        <div className="px-3.5 -mt-7 md:-mt-8 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-[20px] md:text-[24px] font-bold font-editorial tracking-tight">
            Không gian chung
          </h1>
          <p
            className="text-[11.5px] mt-0.5 tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {visibleBooks.length} bộ sách · {LIBRARY_HALLS.length} kệ sách · {totalPublishedEpisodes} tập
          </p>

          {/* Subtle Age-Tier Filter Bar (4–10 vs 11–15) */}
          <div
            role="group"
            aria-label="Lọc tủ sách theo độ tuổi"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="mt-2 p-0.5 rounded-full inline-flex items-center gap-0.5 max-w-full overflow-x-auto no-scrollbar"
          >
            {AUDIENCE_FILTER_PILLS.map((pill) => {
              const active = audienceFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => handleAudienceChange(pill.key)}
                  style={{
                    backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                    color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    border: active ? '1px solid var(--border-hairline)' : '1px solid transparent'
                  }}
                  className={`h-[26px] px-2.5 rounded-full text-[11px] whitespace-nowrap transition ${
                    active ? 'font-semibold shadow-sm' : 'font-medium hover:opacity-85'
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Ultra-Minimalist 1-Line Collapsible "Đang đọc / Đang nghe" Trigger */}
          {activeResumes.length > 0 && (
            <div className="mt-2 w-full max-w-[720px] flex flex-col items-center">
              <button
                type="button"
                aria-expanded={isResumeOpen}
                onClick={() => setIsResumeOpen((prev) => !prev)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--accent-primary)'
                }}
                className="h-[30px] px-3.5 rounded-full text-[11.5px] font-semibold inline-flex items-center gap-1.5 max-w-[min(100%,500px)] shadow-sm transition hover:opacity-90"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: 'var(--accent-warm)' }}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                />
                <span className="truncate">{resumeSummaryLabel}</span>
                <ChevronDownIcon
                  size={13}
                  strokeWidth={1.9}
                  className={`shrink-0 transition-transform ${isResumeOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isResumeOpen && (
                <div className="mt-2.5 w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 text-left">
                  {activeResumes.map((resumeItem) => {
                    const isResumeAudio = resumeItem.mode === 'audio';
                    const isResumePlaying = Boolean(
                      isResumeAudio && activeEpisode?.id === resumeItem.episode.id && isPlaying
                    );
                    const resumePct = getContinuePercent(resumeItem);
                    const epHasAudio = !isEpisodeReadingOnly(resumeItem.episode);
                    const modeTag =
                      resumeItem.kind === 'next_up'
                        ? 'Tập tiếp theo'
                        : resumeItem.mode === 'reading'
                          ? `Đang đọc · ${resumePct}%`
                          : `Đang nghe · ${resumePct}%`;

                    return (
                      <div
                        key={`${resumeItem.mode}-${resumeItem.book.id}-${resumeItem.episode.id}`}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="rounded-[10px] p-2.5 flex items-center gap-2.5 shadow-sm"
                      >
                        <Link
                          href={`/episodes/${resumeItem.episode.id}`}
                          className="w-[44px] shrink-0 block"
                        >
                          <BookCover
                            src={resumeItem.episode.effectiveCoverUrl}
                            alt={resumeItem.episode.title}
                            focalPoint={resumeItem.book.coverFocalPoint}
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider block truncate tabular-nums"
                            style={{ color: 'var(--accent-warm)' }}
                          >
                            {modeTag}
                          </span>
                          <Link href={`/episodes/${resumeItem.episode.id}`}>
                            <h2 className="text-[13.5px] font-semibold font-editorial truncate mt-0.5">
                              Tập {resumeItem.episode.episodeCode}: {resumeItem.episode.title}
                            </h2>
                          </Link>
                          <p
                            className="text-[11px] truncate tabular-nums"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {resumeItem.book.title} ·{' '}
                            {isResumeAudio && resumeItem.kind === 'in_progress'
                              ? `${formatClock(resumeItem.progressSeconds)} / ${formatClock(
                                  resumeItem.durationSeconds
                                )}`
                              : getEpisodeDurationLabel(resumeItem.episode, {
                                  preferredDurationSeconds: resumeItem.durationSeconds
                                })}
                          </p>
                        </div>

                        {isResumeAudio && epHasAudio ? (
                          <button
                            type="button"
                            aria-label={isResumePlaying ? 'Tạm dừng' : 'Nghe tiếp'}
                            onClick={() => playEpisode(resumeItem.book, resumeItem.episode)}
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-primary-fg)'
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          >
                            {isResumePlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
                          </button>
                        ) : (
                          <Link
                            href={`/episodes/${resumeItem.episode.id}`}
                            aria-label={`Đọc tiếp ${resumeItem.episode.title}`}
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-primary-fg)'
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          >
                            <BookOpenIcon size={13} />
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Compact Editorial Body */}
      <div className="px-3.5 md:px-6 mt-4 md:mt-5 space-y-5 md:space-y-6">
        {/* TẦNG 1: TỦ SÁCH NỔI BẬT */}
        {visibleBooks.length > 0 && (
          <section aria-label="Tủ sách nổi bật">
            <div className="flex items-baseline justify-between gap-2 mb-2.5">
              <div>
                <h2 className="text-[16px] md:text-[17.5px] font-bold font-editorial">
                  Tủ sách nổi bật
                </h2>
                <p className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
                  Chạm vào bộ sách để mở mục lục hoặc nghe, đọc ngay
                </p>
              </div>

              <Link
                href="/books"
                style={{ color: 'var(--accent-primary)' }}
                className="text-xs font-semibold inline-flex items-center gap-0.5 shrink-0 hover:underline"
              >
                <span>Tất cả ({visibleBooks.length})</span>
                <ChevronRightIcon size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-3.5">
              {visibleBooks.map((book) => {
                const audioEps = book.episodes.filter((ep) => !isEpisodeReadingOnly(ep));
                const isAudioBook = audioEps.length > 0;

                const inProgAudio = audioEps.find((ep) => {
                  const p = progressMap[ep.id];
                  return p && p.positionSeconds > 0 && !p.completed;
                });
                const firstUnheard = audioEps.find((ep) => !progressMap[ep.id]?.completed);
                const targetAudioEp = inProgAudio || firstUnheard || audioEps[0] || null;

                const inProgRead = book.episodes.find((ep) => {
                  const rp = readingProgressMap[ep.id];
                  return rp && rp.scrollPercent > 0 && !rp.completed;
                });
                const firstUnread = book.episodes.find(
                  (ep) => !readingProgressMap[ep.id]?.completed
                );
                const targetReadEp = inProgRead || firstUnread || book.episodes[0] || null;

                const completedAudio = book.episodes.filter(
                  (ep) => progressMap[ep.id]?.completed
                ).length;
                const completedRead = book.episodes.filter(
                  (ep) => readingProgressMap[ep.id]?.completed
                ).length;

                const statsLabel = isAudioBook
                  ? completedAudio > 0
                    ? `${completedAudio}/${book.episodes.length} tập đã nghe`
                    : `${book.episodes.length} tập · Sách nói & Đọc chữ`
                  : completedRead > 0
                    ? `${completedRead}/${book.episodes.length} tập đã đọc`
                    : `${book.episodes.length} tập · Sách đọc chữ`;

                const isBookPlaying = Boolean(
                  targetAudioEp && activeEpisode?.id === targetAudioEp.id && isPlaying
                );

                return (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="rounded-[11px] p-2.5 md:p-3 flex gap-3 items-center shadow-sm transition hover:shadow-md"
                  >
                    <Link
                      href={`/books/${book.slug}`}
                      className="w-[68px] sm:w-[74px] md:w-[80px] shrink-0 block transition active:scale-[0.98]"
                    >
                      <BookCover
                        src={book.coverUrl}
                        alt={book.title}
                        focalPoint={book.coverFocalPoint}
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.05em] block truncate"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        {formatBookDisplayGenre(book)}
                      </span>

                      <Link href={`/books/${book.slug}`}>
                        <h3 className="text-[14.5px] md:text-[15.5px] font-bold font-editorial leading-snug line-clamp-2">
                          {book.title}
                        </h3>
                      </Link>

                      {(book.subtitle || book.description) && (
                        <p
                          className="text-[11.5px] line-clamp-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {book.subtitle || book.description}
                        </p>
                      )}

                      <p
                        className="text-[11px] font-medium tabular-nums truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {book.ageRange ? `${book.ageRange} · ` : ''}
                        {statsLabel}
                      </p>

                      <div className="pt-0.5 flex flex-wrap items-center gap-1.5">
                        {isAudioBook && targetAudioEp ? (
                          <button
                            type="button"
                            onClick={() => playEpisode(book, targetAudioEp)}
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-primary-fg)'
                            }}
                            className="h-7 px-2.5 rounded-[7px] text-[11.5px] font-semibold inline-flex items-center gap-1 tabular-nums transition active:scale-[0.98]"
                          >
                            {isBookPlaying ? <PauseIcon size={11} /> : <PlayIcon size={11} />}
                            <span>
                              {isBookPlaying
                                ? 'Đang phát'
                                : inProgAudio
                                  ? `Nghe tiếp Tập ${targetAudioEp.episodeCode}`
                                  : `Nghe Tập ${targetAudioEp.episodeCode}`}
                            </span>
                          </button>
                        ) : (
                          targetReadEp && (
                            <Link
                              href={`/episodes/${targetReadEp.id}`}
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'var(--accent-primary-fg)'
                              }}
                              className="h-7 px-2.5 rounded-[7px] text-[11.5px] font-semibold inline-flex items-center gap-1 tabular-nums transition active:scale-[0.98]"
                            >
                              <BookOpenIcon size={12} />
                              <span>
                                {inProgRead
                                  ? `Đọc tiếp Tập ${targetReadEp.episodeCode}`
                                  : `Đọc Tập ${targetReadEp.episodeCode}`}
                              </span>
                            </Link>
                          )
                        )}

                        <Link
                          href={`/books/${book.slug}`}
                          style={{ color: 'var(--text-secondary)' }}
                          className="h-7 px-1.5 text-[11.5px] font-medium inline-flex items-center gap-0.5 hover:underline"
                        >
                          <span>Mục lục</span>
                          <ChevronRightIcon size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TẦNG 2: CÁC KỆ SÁCH (Lưới 2×3 Mobile, 3×2 Tablet & Desktop) */}
        <section aria-label="Các kệ sách">
          <div className="mb-2.5">
            <h2 className="text-[16px] md:text-[17.5px] font-bold font-editorial">
              Các kệ sách
            </h2>
            <p className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
              5 không gian chủ đề và 1 kệ gợi ý dành riêng cho bạn
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 md:gap-3.5">
            {LIBRARY_HALLS.map((hall) => {
              const isCurated = hall.kind === 'curated';
              const hallBooks = isCurated
                ? curatedShelfData.books.map((item) => item.book)
                : booksByHall.get(hall.slug) || [];
              const isLit = isCurated
                ? curatedShelfData.books.length > 0 || curatedShelfData.episodes.length > 0
                : hallBooks.length > 0;
              const totalEps = isCurated
                ? curatedShelfData.episodes.length
                : hallBooks.reduce((sum, b) => sum + b.episodes.length, 0);
              const preset = BOOK_PRESETS[hall.preset];
              const accentColor = isCurated
                ? 'var(--accent-warm)'
                : isNight
                  ? preset.nightAccent
                  : preset.dayAccent;
              const hallArtSrc = isNight ? hall.nightHeroUrl : hall.dayHeroUrl;
              const cardBg = isCurated
                ? isNight
                  ? '#242019'
                  : '#FBF6EC'
                : 'var(--bg-elevated)';
              const cardBorder = isCurated
                ? isNight
                  ? '1.5px solid rgba(212, 172, 110, 0.42)'
                  : '1.5px solid rgba(158, 123, 67, 0.45)'
                : '1px solid var(--border-hairline)';

              return (
                <Link
                  key={hall.slug}
                  href={`/halls/${hall.slug}`}
                  style={{
                    backgroundColor: cardBg,
                    border: cardBorder
                  }}
                  className="group rounded-[10px] overflow-hidden flex flex-col shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  <div
                    style={{
                      backgroundColor: isNight ? preset.nightWash : preset.dayWash,
                      borderBottom: '1px solid var(--border-hairline)'
                    }}
                    className="w-full aspect-[4/3] overflow-hidden relative"
                  >
                    <img
                      src={hallArtSrc}
                      alt={hall.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center block select-none transition duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-1">
                        <span
                          style={{
                            color: isLit ? accentColor : 'var(--text-secondary)'
                          }}
                          className="shrink-0 mt-0.5"
                        >
                          <HallIcon slug={hall.slug} size={13} />
                        </span>
                        <h3 className="text-[13px] md:text-[14px] font-bold font-editorial leading-snug line-clamp-2">
                          {hall.shortTitle}
                        </h3>
                      </div>

                      <p
                        className="text-[10.5px] md:text-[11px] mt-0.5 line-clamp-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {hall.epigraph}
                      </p>
                    </div>

                    <div
                      style={{ borderTop: '1px solid var(--border-hairline)' }}
                      className="mt-2 pt-1.5 flex items-center justify-between gap-1 text-[10.5px] tabular-nums"
                    >
                      <span
                        className="font-semibold truncate"
                        style={{
                          color: isLit ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {isLit
                          ? isCurated
                            ? `${curatedShelfData.books.length} bộ · ${totalEps} tập gợi ý`
                            : `${hallBooks.length} bộ · ${totalEps} tập`
                          : 'Sắp có sách'}
                      </span>

                      <span
                        style={{ color: isLit ? 'var(--accent-warm)' : 'var(--text-secondary)' }}
                        className="font-semibold inline-flex items-center gap-0.5 shrink-0"
                      >
                        <span>{isLit ? 'Mở' : 'Xem'}</span>
                        <ChevronRightIcon size={11} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TẦNG 3: TẬP TRUYỆN MỚI LÊN KỆ (Thẻ ngang gọn giảm chiều cao cuộn) */}
        {recentArrivals.length > 0 && (
          <section aria-label="Mới lên kệ">
            <div className="flex items-baseline justify-between gap-2 mb-2.5">
              <div>
                <h2 className="text-[16px] md:text-[17.5px] font-bold font-editorial">
                  Tập truyện mới lên kệ
                </h2>
                <p className="text-[11.5px]" style={{ color: 'var(--text-secondary)' }}>
                  Những câu chuyện vừa được cập nhật trong thư viện
                </p>
              </div>
              <span
                className="text-[11.5px] font-semibold tabular-nums shrink-0"
                style={{ color: 'var(--accent-warm)' }}
              >
                {visibleNewEpisodes.length} tập mới
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentArrivals.map(({ book, episode }) => {
                const isItemPlaying = activeEpisode?.id === episode.id && isPlaying;
                const durLabel = getEpisodeDurationLabel(episode);
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
                      className="w-[48px] sm:w-[52px] shrink-0 block transition active:scale-[0.98]"
                    >
                      <BookCover
                        src={episode.effectiveCoverUrl}
                        alt={episode.title}
                        focalPoint={book.coverFocalPoint}
                      />
                    </Link>

                    <Link href={`/episodes/${episode.id}`} className="flex-1 min-w-0 space-y-0.5">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wider truncate"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        Mới · {formatRelativePublishDate(episode.publishedAt)}
                      </p>
                      <h3 className="text-[13.5px] font-bold font-editorial leading-snug truncate">
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
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
                      >
                        {isItemPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
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
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition"
                      >
                        <BookOpenIcon size={13} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="pt-1 flex justify-center">
          <Link
            href="/books"
            style={{ color: 'var(--text-secondary)' }}
            className="text-xs font-medium inline-flex items-center gap-1 hover:underline py-1"
          >
            <span>Mở toàn bộ Tủ sách ({books.length} bộ)</span>
            <ChevronRightIcon size={13} />
          </Link>
        </div>
      </div>

      {/* Fullscreen Lightbox for Scenic Foyer Artwork */}
      {isHeroZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Không gian chung Thư viện Đồi Mơ"
          onClick={() => setIsHeroZoomOpen(false)}
          style={{ backgroundColor: 'rgba(12, 16, 14, 0.94)' }}
          className="fixed inset-0 z-50 flex flex-col justify-between p-4"
        >
          <div className="flex items-center justify-end">
            <button
              type="button"
              aria-label="Đóng xem tranh"
              onClick={() => setIsHeroZoomOpen(false)}
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
              src={foyerArtSrc}
              alt="Không gian chung Thư viện Đồi Mơ"
              onClick={() => setIsHeroZoomOpen(false)}
              className="max-h-[84dvh] max-w-full object-contain rounded-[8px] cursor-zoom-out select-none"
            />
          </div>

          <div className="h-4" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
