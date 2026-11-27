'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ContinueSuggestion, useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/BookCover';
import { LibraryWayfinder } from '@/components/LibraryWayfinder';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CloseIcon,
  CompassIcon,
  FeatherIcon,
  HearthCupIcon,
  LanternIcon,
  LeafIcon,
  MoonIcon,
  MusicSparkIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SunIcon
} from '@/components/Icons';
import {
  formatBookDisplayGenre,
  FOYER_HERO_ART,
  LIBRARY_HALLS,
  LibraryHallSlug,
  resolveBookHalls
} from '@/lib/halls';
import {
  BOOK_PRESETS,
  formatClock,
  formatRelativePublishDate,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';

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
    case 'khoa-hoc-tu-nhien':
      return <LeafIcon size={size} />;
    case 'am-thuc-nep-nha':
      return <HearthCupIcon size={size} />;
    case 'van-hoc-dong-thoai':
      return <FeatherIcon size={size} />;
    case 'lich-su-van-hoa':
      return <CompassIcon size={size} />;
    case 'nghe-thuat-tho-nhac':
      return <MusicSparkIcon size={size} />;
    case 'ky-nang-lon-khon':
      return <LanternIcon size={size} />;
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

  useEffect(() => {
    if (!isHeroZoomOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsHeroZoomOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHeroZoomOpen]);

  const activeResumes = useMemo(() => continueItems.slice(0, 2), [continueItems]);
  const recentArrivals = useMemo(
    () => newEpisodesAcrossLibrary.slice(0, 4),
    [newEpisodesAcrossLibrary]
  );

  // Group published books into the 6 Halls (supporting primary + cross-disciplinary halls)
  const booksByHall = useMemo(() => {
    const map = new Map<LibraryHallSlug, typeof books>();
    for (const h of LIBRARY_HALLS) {
      map.set(h.slug, []);
    }
    for (const b of books) {
      for (const hall of resolveBookHalls(b)) {
        const list = map.get(hall.slug) || [];
        if (!list.some((existing) => existing.id === b.id)) {
          list.push(b);
          map.set(hall.slug, list);
        }
      }
    }
    return map;
  }, [books]);

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
  // LỚP 1: CỔNG ĐỒI MƠ (Full-bleed 100vw × 100dvh, chữ & nút "Bước vào" đè lên đáy tranh)
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
          className="w-11 h-11 md:w-12 md:h-12 rounded-full backdrop-blur-md flex items-center justify-center absolute top-[max(14px,env(safe-area-inset-top))] right-4 md:top-6 md:right-7 z-20 shadow-sm transition hover:scale-105"
        >
          {isNight ? (
            <SunIcon size={22} strokeWidth={1.85} />
          ) : (
            <MoonIcon size={22} strokeWidth={1.85} />
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

        {/* Bottom 1/3 Cinematic Scrim + Centered Title, Subtitle & "Bước vào" CTA */}
        <div
          style={{
            background:
              'linear-gradient(180deg, rgba(10,14,11,0) 0%, rgba(10,14,11,0.58) 44%, rgba(9,13,10,0.90) 100%)'
          }}
          className="absolute inset-x-0 bottom-0 pt-24 md:pt-32 pb-[max(30px,calc(env(safe-area-inset-bottom)+20px))] md:pb-12 px-6 flex flex-col items-center text-center z-10"
        >
          <h1 className="text-[30px] sm:text-[36px] md:text-[46px] font-bold font-editorial text-[#F8F5EE] leading-snug tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
            Thư viện Đồi Mơ
          </h1>
          <p className="text-[14px] sm:text-[15.5px] md:text-[18px] mt-1 md:mt-1.5 text-[#EFE9DC]/90 font-medium tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
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
            className="mt-5 md:mt-6 h-[48px] md:h-[54px] px-9 md:px-12 rounded-full text-[15px] md:text-[16.5px] font-semibold inline-flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(0,0,0,0.36)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <span>Bước vào</span>
            <ChevronRightIcon size={19} strokeWidth={1.95} />
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
  const totalPublishedEpisodes = books.reduce((sum, b) => sum + b.episodes.length, 0);

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
    <div className="pb-8">
      {/* Sticky Doubled Pinned Menu (72px Mobile / 86px Desktop, CAPS LOCK + 2x Icons) */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[72px] md:h-[86px] px-2.5 sm:px-3.5 md:px-7 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="foyer" />

        <div className="flex items-center gap-0.5 md:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => openUtilitySheet('search')}
            aria-label="Tìm kiếm"
            style={{ color: 'var(--text-primary)' }}
            className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-[10px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
          >
            <SearchIcon
              size={24}
              strokeWidth={1.85}
              className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
            />
          </button>

          <button
            type="button"
            onClick={() => openUtilitySheet('saved')}
            aria-label="Đã lưu"
            style={{
              color: favorites.length > 0 ? 'var(--accent-berry)' : 'var(--text-primary)'
            }}
            className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-[10px] hover:bg-[var(--bg-surface)] flex items-center justify-center relative transition"
          >
            <BookmarkIcon
              size={24}
              strokeWidth={1.85}
              filled={favorites.length > 0}
              className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
            />
            {favorites.length > 0 && (
              <span
                aria-hidden="true"
                style={{ backgroundColor: 'var(--accent-warm)' }}
                className="w-2 h-2 rounded-full absolute top-1.5 right-1.5"
              />
            )}
          </button>

          <button
            type="button"
            onClick={toggleNight}
            aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
            style={{ color: 'var(--text-primary)' }}
            className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-[10px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
          >
            {isNight ? (
              <SunIcon
                size={24}
                strokeWidth={1.85}
                className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
              />
            ) : (
              <MoonIcon
                size={24}
                strokeWidth={1.85}
                className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
              />
            )}
          </button>
        </div>
      </header>

      {/* Scenic Hero Stage + Centered "Không gian chung" + Minimalist 1-Line Collapsible Resume */}
      <section aria-label="Không gian chung" className="md:px-7 md:pt-5">
        <button
          type="button"
          onClick={() => setIsHeroZoomOpen(true)}
          aria-label="Chạm để xem toàn màn hình tranh Không gian chung"
          style={{ backgroundColor: foyerWashBg }}
          className="block relative w-full h-[236px] sm:h-[272px] md:h-[324px] lg:h-[356px] md:rounded-[16px] md:border md:border-[var(--border-hairline)] overflow-hidden select-none transition active:scale-[0.995]"
        >
          <img
            src={foyerArtSrc}
            alt="Không gian chung Thư viện Đồi Mơ"
            className="w-full h-full object-cover object-center block select-none"
          />
          <div
            aria-hidden="true"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 44%, var(--bg-canvas) 100%)'
            }}
            className="absolute inset-0 pointer-events-none"
          />
        </button>

        <div className="px-4 -mt-9 md:-mt-11 relative z-10 flex flex-col items-center text-center">
          <h1 className="text-[26px] md:text-[34px] font-bold font-editorial tracking-tight">
            Không gian chung
          </h1>
          <p
            className="text-xs md:text-[13px] mt-0.5 tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {books.length} bộ sách · {LIBRARY_HALLS.length} kệ chủ đề · {totalPublishedEpisodes} tập
          </p>

          {/* Ultra-Minimalist 1-Line Collapsible "Đang đọc / Đang nghe" Trigger */}
          {activeResumes.length > 0 && (
            <div className="mt-3 w-full max-w-[760px] flex flex-col items-center">
              <button
                type="button"
                aria-expanded={isResumeOpen}
                onClick={() => setIsResumeOpen((prev) => !prev)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--accent-primary)'
                }}
                className="h-[34px] px-4 rounded-full text-xs font-semibold inline-flex items-center gap-2 max-w-[min(100%,540px)] shadow-sm transition hover:opacity-90"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: 'var(--accent-warm)' }}
                  className="w-2 h-2 rounded-full shrink-0"
                />
                <span className="truncate">{resumeSummaryLabel}</span>
                <ChevronDownIcon
                  size={14}
                  strokeWidth={1.9}
                  className={`shrink-0 transition-transform ${isResumeOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isResumeOpen && (
                <div className="mt-3 w-full grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
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
                        className="rounded-[12px] p-3 flex items-center gap-3 shadow-sm"
                      >
                        <Link
                          href={`/episodes/${resumeItem.episode.id}`}
                          className="w-[52px] shrink-0 block"
                        >
                          <BookCover
                            src={resumeItem.episode.effectiveCoverUrl}
                            alt={resumeItem.episode.title}
                            focalPoint={resumeItem.book.coverFocalPoint}
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <span
                            className="text-[10.5px] font-bold uppercase tracking-wider block truncate tabular-nums"
                            style={{ color: 'var(--accent-warm)' }}
                          >
                            {modeTag}
                          </span>
                          <Link href={`/episodes/${resumeItem.episode.id}`}>
                            <h2 className="text-[14px] font-semibold font-editorial truncate mt-0.5">
                              Tập {resumeItem.episode.episodeCode}: {resumeItem.episode.title}
                            </h2>
                          </Link>
                          <p
                            className="text-[11.5px] truncate tabular-nums"
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
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          >
                            {isResumePlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                          </button>
                        ) : (
                          <Link
                            href={`/episodes/${resumeItem.episode.id}`}
                            aria-label={`Đọc tiếp ${resumeItem.episode.title}`}
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-primary-fg)'
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          >
                            <BookOpenIcon size={15} />
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

      {/* Main Rich Visual Body (Full 1040px Editorial Spread) */}
      <div className="px-4 md:px-7 mt-6 md:mt-8 space-y-8 md:space-y-10">
        {/* TẦNG 1: TỦ SÁCH NỔI BẬT (Trưng bày Bìa Bộ Sách 3:4 cỡ lớn) */}
        {books.length > 0 && (
          <section aria-label="Tủ sách nổi bật">
            <div className="flex items-baseline justify-between gap-2 mb-3.5">
              <div>
                <h2 className="text-[18.5px] md:text-[22px] font-bold font-editorial">
                  Tủ sách nổi bật
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Chạm vào bộ sách để mở mục lục hoặc nghe, đọc ngay
                </p>
              </div>

              <Link
                href="/books"
                style={{ color: 'var(--accent-primary)' }}
                className="text-xs font-semibold inline-flex items-center gap-1 shrink-0 hover:underline"
              >
                <span>Tất cả ({books.length})</span>
                <ChevronRightIcon size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {books.map((book) => {
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
                    className="rounded-[14px] p-3.5 md:p-4 flex gap-4 items-center shadow-sm transition hover:shadow-md"
                  >
                    <Link
                      href={`/books/${book.slug}`}
                      className="w-[98px] sm:w-[110px] md:w-[122px] shrink-0 block transition active:scale-[0.98]"
                    >
                      <BookCover
                        src={book.coverUrl}
                        alt={book.title}
                        focalPoint={book.coverFocalPoint}
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <span
                        className="vn-eyebrow block truncate"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        {formatBookDisplayGenre(book)}
                      </span>

                      <Link href={`/books/${book.slug}`}>
                        <h3 className="text-[16.5px] md:text-[18.5px] font-bold font-editorial leading-snug line-clamp-2">
                          {book.title}
                        </h3>
                      </Link>

                      {(book.subtitle || book.description) && (
                        <p
                          className="text-xs line-clamp-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {book.subtitle || book.description}
                        </p>
                      )}

                      <p
                        className="text-[11.5px] font-medium tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {statsLabel}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-2">
                        {isAudioBook && targetAudioEp ? (
                          <button
                            type="button"
                            onClick={() => playEpisode(book, targetAudioEp)}
                            style={{
                              backgroundColor: 'var(--accent-primary)',
                              color: 'var(--accent-primary-fg)'
                            }}
                            className="h-8 px-3.5 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums transition active:scale-[0.98]"
                          >
                            {isBookPlaying ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
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
                              className="h-8 px-3.5 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums transition active:scale-[0.98]"
                            >
                              <BookOpenIcon size={13} />
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
                          className="h-8 px-2 text-xs font-medium inline-flex items-center gap-0.5 hover:underline"
                        >
                          <span>Mục lục</span>
                          <ChevronRightIcon size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TẦNG 2: KHÁM PHÁ 6 KỆ SÁCH BẰNG TRANH MÀU NƯỚC THẬT (Ngày / Đêm) */}
        <section aria-label="Các kệ sách">
          <div className="mb-3.5">
            <h2 className="text-[18.5px] md:text-[22px] font-bold font-editorial">
              Khám phá các kệ sách
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Mỗi kệ là một không gian tranh màu nước riêng theo từng chủ đề
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {LIBRARY_HALLS.map((hall) => {
              const hallBooks = booksByHall.get(hall.slug) || [];
              const isLit = hallBooks.length > 0;
              const totalEps = hallBooks.reduce((sum, b) => sum + b.episodes.length, 0);
              const preset = BOOK_PRESETS[hall.preset];
              const accentColor = isNight ? preset.nightAccent : preset.dayAccent;
              const hallArtSrc = isNight ? hall.nightHeroUrl : hall.dayHeroUrl;

              const cardContent = (
                <>
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

                  <div className="p-3 md:p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          style={{
                            color: isLit ? accentColor : 'var(--text-secondary)'
                          }}
                          className="shrink-0"
                        >
                          <HallIcon slug={hall.slug} size={15} />
                        </span>
                        <h3 className="text-[14.5px] md:text-[16px] font-bold font-editorial leading-snug truncate">
                          {hall.shortTitle}
                        </h3>
                      </div>

                      <p
                        className="text-[11.5px] mt-1 line-clamp-2 leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {hall.epigraph}
                      </p>
                    </div>

                    <div
                      style={{ borderTop: '1px solid var(--border-hairline)' }}
                      className="mt-2.5 pt-2 flex items-center justify-between gap-1 text-[11px] tabular-nums"
                    >
                      <span
                        className="font-semibold"
                        style={{
                          color: isLit ? 'var(--text-primary)' : 'var(--text-secondary)'
                        }}
                      >
                        {isLit ? `${hallBooks.length} bộ · ${totalEps} tập` : 'Sắp có sách'}
                      </span>

                      {isLit && (
                        <span
                          style={{ color: 'var(--accent-warm)' }}
                          className="font-semibold inline-flex items-center gap-0.5 shrink-0"
                        >
                          <span>Mở kệ</span>
                          <ChevronRightIcon size={12} />
                        </span>
                      )}
                    </div>
                  </div>
                </>
              );

              if (!isLit) {
                return (
                  <div
                    key={hall.slug}
                    aria-disabled="true"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      opacity: 0.78
                    }}
                    className="rounded-[12px] overflow-hidden flex flex-col select-none"
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={hall.slug}
                  href={`/halls/${hall.slug}`}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="group rounded-[12px] overflow-hidden flex flex-col shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        </section>

        {/* TẦNG 3: TẬP TRUYỆN MỚI LÊN KỆ (Thẻ Tranh 3:4 Cỡ Lớn, Mặt Bìa Sạch 100%) */}
        {recentArrivals.length > 0 && (
          <section aria-label="Mới lên kệ">
            <div className="flex items-baseline justify-between gap-2 mb-3.5">
              <div>
                <h2 className="text-[18.5px] md:text-[22px] font-bold font-editorial">
                  Tập truyện mới lên kệ
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Những câu chuyện vừa được cập nhật trong thư viện
                </p>
              </div>
              <span
                className="text-xs font-semibold tabular-nums shrink-0"
                style={{ color: 'var(--accent-warm)' }}
              >
                {newEpisodesAcrossLibrary.length} tập mới
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
                    className="rounded-[12px] p-2.5 md:p-3 flex flex-col justify-between shadow-sm transition hover:shadow-md"
                  >
                    <div>
                      <Link
                        href={`/episodes/${episode.id}`}
                        className="block transition active:scale-[0.99]"
                      >
                        <BookCover
                          src={episode.effectiveCoverUrl}
                          alt={episode.title}
                          focalPoint={book.coverFocalPoint}
                        />
                      </Link>

                      <Link href={`/episodes/${episode.id}`} className="block mt-2.5 space-y-0.5">
                        <p
                          className="text-[10.5px] font-semibold uppercase tracking-wider truncate"
                          style={{ color: 'var(--accent-warm)' }}
                        >
                          Mới · {formatRelativePublishDate(episode.publishedAt)}
                        </p>
                        <p
                          className="text-[11px] truncate"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {book.title}
                        </p>
                        <h3 className="text-[14px] md:text-[15px] font-bold font-editorial leading-snug line-clamp-2">
                          Tập {episode.episodeCode}: {episode.title}
                        </h3>
                      </Link>
                    </div>

                    <div
                      style={{ borderTop: '1px solid var(--border-hairline)' }}
                      className="mt-2.5 pt-2 flex items-center justify-between gap-2"
                    >
                      <span
                        className="text-[11px] tabular-nums truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {durLabel}
                      </span>

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
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition"
                        >
                          {isItemPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
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
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition"
                        >
                          <BookOpenIcon size={14} />
                        </Link>
                      )}
                    </div>
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
