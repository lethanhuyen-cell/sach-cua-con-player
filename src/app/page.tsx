'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ContinueSuggestion, useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/BookCover';
import { StorybookHeroStage } from '@/components/StorybookHeroStage';
import {
  ArchDoorIcon,
  BookmarkIcon,
  BookOpenIcon,
  ChevronRightIcon,
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
import { FOYER_HERO_ART, LIBRARY_HALLS, LibraryHallSlug, resolveBookHalls } from '@/lib/halls';
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

function HallIcon({ slug, size = 18 }: { slug: LibraryHallSlug; size?: number }) {
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
    isEpisodeNew,
    newEpisodesAcrossLibrary,
    activeEpisode,
    isPlaying,
    playEpisode,
    continueItems,
    openUtilitySheet,
    hasPassedGate,
    enterLibraryFromGate,
    returnToGate
  } = useLibraryPlayer();

  const [isOpeningGate, setIsOpeningGate] = useState(false);

  const activeResumes = useMemo(() => continueItems.slice(0, 2), [continueItems]);
  const recentArrivals = useMemo(
    () => newEpisodesAcrossLibrary.slice(0, 3),
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
  // LỚP 1: CỔNG ĐỒI MƠ (Yên tĩnh, tự nhiên, không khẩu hiệu)
  // ============================================================================
  if (!hasPassedGate) {
    const gateArtSrc = isNight ? '/images/home/doi-mo-night.jpg' : '/images/home/doi-mo-day.jpg';
    return (
      <div
        className={`h-[100dvh] max-h-[100dvh] overflow-hidden px-3.5 pt-3 pb-[max(14px,calc(env(safe-area-inset-bottom)+10px))] flex flex-col items-center justify-between transition-all duration-500 ${
          isOpeningGate ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex-1 min-h-0 w-full flex items-center justify-center">
          <div
            style={{
              border: '1px solid var(--border-hairline)',
              backgroundColor: 'var(--bg-surface)'
            }}
            className="w-[min(100%,calc((100dvh-165px)*0.75))] aspect-[3/4] rounded-[18px] overflow-hidden relative shadow-sm mx-auto"
          >
            <img
              src={gateArtSrc}
              alt="Thư viện Đồi Mơ"
              className="w-full h-full object-cover object-center block select-none"
            />

            <button
              type="button"
              onClick={toggleNight}
              aria-label={isNight ? 'Giao diện ban ngày' : 'Giao diện ban đêm'}
              style={{
                backgroundColor: isNight ? 'rgba(25,32,28,0.78)' : 'rgba(248,245,238,0.86)',
                border: '1px solid var(--border-hairline)',
                color: isNight ? 'var(--accent-warm)' : 'var(--text-primary)'
              }}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center absolute top-3 right-3 z-10 shadow-sm"
            >
              {isNight ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>

            {isNight && (
              <>
                <div
                  aria-hidden="true"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(212,172,110,0.40) 0%, rgba(212,172,110,0) 72%)'
                  }}
                  className="lantern-aura absolute top-[32%] left-[18%] w-16 h-16 rounded-full"
                />
                <div
                  aria-hidden="true"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(212,172,110,0.34) 0%, rgba(212,172,110,0) 72%)',
                    animationDelay: '1.8s'
                  }}
                  className="lantern-aura absolute top-[30%] right-[14%] w-14 h-14 rounded-full"
                />
                <div
                  aria-hidden="true"
                  style={{ backgroundColor: '#F3D289' }}
                  className="firefly-dot absolute bottom-[24%] left-[28%] w-1.5 h-1.5 rounded-full"
                />
                <div
                  aria-hidden="true"
                  style={{ backgroundColor: '#F3D289', animationDelay: '2.1s' }}
                  className="firefly-dot absolute bottom-[36%] right-[26%] w-1.5 h-1.5 rounded-full"
                />
              </>
            )}
          </div>
        </div>

        <div className="shrink-0 pt-3 flex flex-col items-center text-center w-full">
          <h1 className="text-[24px] font-bold font-editorial leading-snug tracking-tight">
            Thư viện Đồi Mơ
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Sách đọc và nghe trước giờ ngủ
          </p>

          <button
            type="button"
            onClick={handleOpenGate}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)'
            }}
            className="mt-3 w-full max-w-[236px] h-[46px] rounded-[11px] text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
          >
            <span>Bước vào</span>
            <ChevronRightIcon size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // LỚP 2 & 3: SẢNH SÁCH & CÁC GIAN SÁCH (2/3 Tranh Sảnh trên cùng -> Cuộn xem Sảnh)
  // ============================================================================
  const foyerWashBg = isNight ? BOOK_PRESETS.moss.nightWash : BOOK_PRESETS.moss.dayWash;
  const totalPublishedEpisodes = books.reduce((sum, b) => sum + b.episodes.length, 0);

  return (
    <div className="pb-6">
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[44px] px-3.5 flex items-center justify-between gap-2"
      >
        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-[16px] font-bold tracking-tight font-editorial truncate">
            Thư viện Đồi Mơ
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={returnToGate}
            aria-label="Ra cổng"
            title="Ra cổng"
            style={{ color: 'var(--accent-warm)' }}
            className="w-9 h-9 rounded-[7px] flex items-center justify-center"
          >
            <ArchDoorIcon size={16} />
          </button>

          <button
            type="button"
            onClick={() => openUtilitySheet('search')}
            aria-label="Tìm kiếm"
            style={{ color: 'var(--text-primary)' }}
            className="w-9 h-9 rounded-[7px] flex items-center justify-center"
          >
            <SearchIcon size={16} />
          </button>

          <button
            type="button"
            onClick={() => openUtilitySheet('saved')}
            aria-label="Đã lưu"
            style={{
              color: favorites.length > 0 ? 'var(--accent-berry)' : 'var(--text-primary)'
            }}
            className="w-9 h-9 rounded-[7px] flex items-center justify-center relative"
          >
            <BookmarkIcon size={16} filled={favorites.length > 0} />
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
            className="w-9 h-9 rounded-[7px] flex items-center justify-center"
          >
            {isNight ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </header>

      <StorybookHeroStage
        src={isNight ? FOYER_HERO_ART.night : FOYER_HERO_ART.day}
        alt="Sảnh sách Thư viện Đồi Mơ"
        washBg={foyerWashBg}
        roundedClass="rounded-[12px]"
      >
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h1 className="text-[20px] font-bold font-editorial leading-snug">Sảnh sách</h1>
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {books.length} bộ sách · {totalPublishedEpisodes} tập
          </span>
        </div>
      </StorybookHeroStage>

      <div className="px-4 pt-4 space-y-6">
        {/* Đang đọc / Đang nghe (tối đa 2 bộ gần nhất cho 2 bé hoặc đọc song song) */}
      {activeResumes.length > 0 && (
        <section aria-label="Tiếp tục" className="space-y-3.5">
          {activeResumes.map((resumeItem) => {
            const isResumeAudio = resumeItem.mode === 'audio';
            const isResumePlaying = Boolean(
              isResumeAudio && activeEpisode?.id === resumeItem.episode.id && isPlaying
            );
            const resumePct = getContinuePercent(resumeItem);
            const epHasAudio = !isEpisodeReadingOnly(resumeItem.episode);

            return (
              <div key={`${resumeItem.mode}-${resumeItem.book.id}-${resumeItem.episode.id}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="vn-eyebrow" style={{ color: 'var(--accent-primary)' }}>
                    {resumeItem.kind === 'next_up'
                      ? 'Tập tiếp theo'
                      : resumeItem.mode === 'reading'
                        ? 'Đang đọc'
                        : 'Đang nghe'}
                  </span>
                  <Link
                    href={`/episodes/${resumeItem.episode.id}`}
                    style={{ color: 'var(--text-secondary)' }}
                    className="text-xs inline-flex items-center gap-1 hover:underline"
                  >
                    <BookOpenIcon size={14} />
                    <span>Mở trang đọc</span>
                  </Link>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="rounded-[10px] p-3.5 flex gap-3.5 items-center"
                >
                  <Link
                    href={`/episodes/${resumeItem.episode.id}`}
                    className="w-[70px] shrink-0 block"
                  >
                    <BookCover
                      src={resumeItem.episode.effectiveCoverUrl}
                      alt={resumeItem.episode.title}
                      focalPoint={resumeItem.book.coverFocalPoint}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {resumeItem.book.title} · Tập {resumeItem.episode.episodeCode}
                    </p>
                    <Link href={`/episodes/${resumeItem.episode.id}`}>
                      <h2 className="text-[15.5px] font-semibold font-editorial line-clamp-2 mt-0.5">
                        {resumeItem.episode.title}
                      </h2>
                    </Link>

                    {resumeItem.mode === 'reading' ? (
                      resumeItem.kind === 'in_progress' ? (
                        <div className="mt-2">
                          <div className="h-[2px] w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${resumePct}%`,
                                backgroundColor: 'var(--accent-warm)'
                              }}
                            />
                          </div>
                          <p
                            className="text-[11px] mt-1 tabular-nums"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {resumePct}% ·{' '}
                            {getEpisodeDurationLabel(resumeItem.episode)}
                          </p>
                        </div>
                      ) : (
                        <p
                          className="text-xs mt-1 tabular-nums"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {getEpisodeDurationLabel(resumeItem.episode)}
                        </p>
                      )
                    ) : resumeItem.kind === 'in_progress' ? (
                      <div className="mt-2">
                        <div className="h-[2px] w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${resumePct}%`,
                              backgroundColor: 'var(--accent-warm)'
                            }}
                          />
                        </div>
                        <p
                          className="text-[11px] mt-1 tabular-nums"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {formatClock(resumeItem.progressSeconds)} /{' '}
                          {formatClock(resumeItem.durationSeconds)}
                        </p>
                      </div>
                    ) : (
                      <p
                        className="text-xs mt-1 tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {getEpisodeDurationLabel(resumeItem.episode, {
                          preferredDurationSeconds: resumeItem.durationSeconds
                        })}
                      </p>
                    )}

                    <div className="mt-2.5">
                      {isResumeAudio && epHasAudio ? (
                        <button
                          type="button"
                          onClick={() => playEpisode(resumeItem.book, resumeItem.episode)}
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-primary-fg)'
                          }}
                          className="h-9 px-3.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          {isResumePlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                          <span>
                            {isResumePlaying
                              ? 'Tạm dừng'
                              : resumeItem.kind === 'next_up'
                                ? `Nghe Tập ${resumeItem.episode.episodeCode}`
                                : 'Nghe tiếp'}
                          </span>
                        </button>
                      ) : (
                        <Link
                          href={`/episodes/${resumeItem.episode.id}`}
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-primary-fg)'
                          }}
                          className="h-9 px-3.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <BookOpenIcon size={14} />
                          <span>
                            {resumeItem.kind === 'next_up'
                              ? `Đọc Tập ${resumeItem.episode.episodeCode}`
                              : `Đọc tiếp (${resumePct}%)`}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Các gian sách */}
      <section aria-label="Các gian sách">
        <div className="mb-3">
          <h2 className="text-[17px] font-semibold font-editorial">Các gian sách</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {LIBRARY_HALLS.map((hall) => {
            const hallBooks = booksByHall.get(hall.slug) || [];
            const isLit = hallBooks.length > 0;
            const totalEps = hallBooks.reduce((sum, b) => sum + b.episodes.length, 0);
            const preset = BOOK_PRESETS[hall.preset];
            const accentColor = isNight ? preset.nightAccent : preset.dayAccent;
            const iconBg = isNight ? preset.nightWash : preset.dayWash;

            const doorInner = (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      style={{
                        backgroundColor: isLit ? iconBg : 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)',
                        color: isLit ? accentColor : 'var(--text-secondary)'
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                    >
                      <HallIcon slug={hall.slug} size={17} />
                    </div>

                    <span
                      style={{
                        backgroundColor: isLit
                          ? 'var(--accent-warm)'
                          : 'var(--border-hairline)'
                      }}
                      className="w-2 h-2 rounded-full"
                    />
                  </div>

                  <h3 className="text-[14.5px] font-semibold font-editorial mt-3 leading-snug">
                    {hall.shortTitle}
                  </h3>
                </div>

                <p
                  className="text-[11.5px] mt-2 tabular-nums"
                  style={{
                    color: isLit ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {isLit ? `${hallBooks.length} bộ · ${totalEps} tập` : 'Sắp có sách'}
                </p>
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
                    opacity: 0.72
                  }}
                  className="rounded-t-[22px] rounded-b-[10px] p-3.5 flex flex-col justify-between select-none"
                >
                  {doorInner}
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
                className="rounded-t-[22px] rounded-b-[10px] p-3.5 flex flex-col justify-between transition active:scale-[0.98]"
              >
                {doorInner}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Mới lên kệ */}
      {recentArrivals.length > 0 && (
        <section aria-label="Mới lên kệ">
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="text-[16.5px] font-semibold font-editorial">Mới lên kệ</h2>
            <span className="text-xs tabular-nums" style={{ color: 'var(--accent-warm)' }}>
              {newEpisodesAcrossLibrary.length} tập
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] divide-y divide-[var(--border-hairline)]"
          >
            {recentArrivals.map(({ book, episode }) => {
              const isItemPlaying = activeEpisode?.id === episode.id && isPlaying;
              const durLabel = getEpisodeDurationLabel(episode);

              return (
                <div key={episode.id} className="p-3 flex items-center gap-3">
                  <Link
                    href={`/episodes/${episode.id}`}
                    className="w-[48px] shrink-0 block"
                  >
                    <BookCover
                      src={episode.effectiveCoverUrl}
                      alt={episode.title}
                      focalPoint={book.coverFocalPoint}
                    />
                  </Link>

                  <Link href={`/episodes/${episode.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] truncate">
                      <span
                        className="font-semibold uppercase tracking-wider shrink-0"
                        style={{ color: 'var(--accent-warm)' }}
                      >
                        Mới · {formatRelativePublishDate(episode.publishedAt)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }} className="truncate">
                        · {book.title}
                      </span>
                    </div>
                    <h3 className="text-[14px] font-semibold font-editorial line-clamp-2 mt-0.5">
                      Tập {episode.episodeCode}: {episode.title}
                    </h3>
                    <p
                      className="text-[11px] mt-0.5 tabular-nums"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {durLabel}
                    </p>
                  </Link>

                  {!isEpisodeReadingOnly(episode) && (
                    <button
                      type="button"
                      aria-label={isItemPlaying ? `Tạm dừng ${episode.title}` : `Nghe ${episode.title}`}
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
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    >
                      {isItemPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    </button>
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
            className="text-xs inline-flex items-center gap-1 hover:underline py-1"
          >
            <span>Tất cả sách ({books.length})</span>
            <ChevronRightIcon size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
