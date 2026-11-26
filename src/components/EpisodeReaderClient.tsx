'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { HydratedBook, HydratedEpisode } from '@/lib/types';
import { resolveBookHall } from '@/lib/halls';
import { collectEpisodeIllustrations, parseStoryMarkdown } from '@/lib/markdown';
import { BOOK_PRESETS, formatClock, formatDurationShort, isEpisodeReadingOnly } from '@/lib/presets';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { StorybookHeroStage } from './StorybookHeroStage';
import { LibraryWayfinder } from './LibraryWayfinder';
import {
  CloseIcon,
  ExpandIcon,
  MicIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon
} from './Icons';

interface EpisodeReaderClientProps {
  book: HydratedBook;
  episode: HydratedEpisode;
  prevEpisode: HydratedEpisode | null;
  nextEpisode: HydratedEpisode | null;
  isPreview?: boolean;
}

/**
 * Màn hình 3: Giao diện Đọc Tập liền mạch (GEMINI.md Điều 1):
 * 1. Cấm tuyệt đối mọi hộp phụ cuối tập và hộp chú thích dưới tranh.
 * 2. Ưu tiên tối đa màn hình nhiều chữ liền mạch (Text-First Continuity).
 * 3. Cụm Phát & chọn Giọng đọc gom gọn trên 1 thanh ngang mảnh 38px (ẩn hoàn toàn khi Chỉ đọc chữ).
 * 4. Vi điều khiển [⏸ 05:30] tốn 0px chiều cao thêm xuất hiện trên thanh Sticky 42px khi cuộn sâu đọc bài dài.
 * 5. Tự động lưu & khôi phục vị trí cuộn cho cả sách đọc chữ (Tiểu Hạt Dẻ) lẫn sách nói.
 */
export function EpisodeReaderClient({
  book,
  episode,
  prevEpisode,
  nextEpisode,
  isPreview = false
}: EpisodeReaderClientProps) {
  const {
    isHydrated,
    isNight,
    toggleNight,
    readerFontSize,
    adjustReaderFontSize,
    markEpisodeOpened,
    readingProgressMap,
    saveReadingProgress,
    preferredVoiceKey,
    activeEpisode,
    activeTrack,
    isPlaying,
    currentTime,
    duration,
    playEpisode,
    switchVoice,
    setFullPlayerOpen
  } = useLibraryPlayer();

  const [viewMode, setViewMode] = useState<'story' | 'gallery'>('story');
  const [selectedVoiceKey, setSelectedVoiceKey] = useState<string>(() => {
    const match = episode.audioTracks.find(
      (t) => t.voiceProfile.voiceKey === preferredVoiceKey
    );
    return (
      match?.voiceProfile.voiceKey ||
      episode.audioTracks.find((t) => t.isDefault)?.voiceProfile.voiceKey ||
      episode.audioTracks[0]?.voiceProfile.voiceKey ||
      ''
    );
  });
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isAudioStripVisible, setIsAudioStripVisible] = useState(true);

  const audioStripRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const hasRestoredScrollRef = useRef<string | null>(null);
  const pendingPctRef = useRef<number | null>(null);

  // Opening an episode to read automatically clears its "Mới" badge on this device
  useEffect(() => {
    if (!isPreview) {
      markEpisodeOpened(episode.id);
    }
  }, [episode.id, isPreview, markEpisodeOpened]);

  const blocks = useMemo(
    () => parseStoryMarkdown(episode.contentMarkdown, episode.title),
    [episode.contentMarkdown, episode.title]
  );

  const hall = useMemo(() => resolveBookHall(book), [book]);
  const illustrations = useMemo(() => collectEpisodeIllustrations(episode), [episode]);

  const isThisEpisodeActive = activeEpisode?.id === episode.id;
  const isThisEpisodePlaying = isThisEpisodeActive && isPlaying;
  const effectiveVoiceKey = isThisEpisodeActive
    ? activeTrack?.voiceProfile.voiceKey || selectedVoiceKey
    : selectedVoiceKey;

  const hasAudio = !isEpisodeReadingOnly(episode);
  const defaultDuration = episode.audioTracks[0]?.durationSeconds || 0;

  // Observe whether the top 38px audio strip is visible in viewport; show 0px micro-control in Sticky 42px when scrolled past
  useEffect(() => {
    if (!hasAudio) {
      setIsAudioStripVisible(true);
      return;
    }
    const el = audioStripRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]) {
          setIsAudioStripVisible(entries[0].isIntersecting);
        }
      },
      { threshold: 0.05, rootMargin: '-42px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [episode.id, hasAudio, viewMode]);

  // Restore saved reading scroll position once per episode when in story mode
  useEffect(() => {
    if (isPreview || !isHydrated || viewMode !== 'story') return;
    if (hasRestoredScrollRef.current === episode.id) return;

    const saved = readingProgressMap[episode.id];
    hasRestoredScrollRef.current = episode.id;
    if (!saved || saved.completed || saved.scrollPercent < 5 || saved.scrollPercent >= 92) {
      return;
    }

    const timer = setTimeout(() => {
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (scrollable > 120) {
        const targetY = Math.round((saved.scrollPercent / 100) * scrollable);
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [episode.id, isHydrated, isPreview, readingProgressMap, viewMode]);

  // Debounced reading progress tracking while scrolling story prose (+ short-article & SPA unmount flush)
  useEffect(() => {
    if (isPreview || viewMode !== 'story') return;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let shortTimer: ReturnType<typeof setTimeout> | null = null;
    pendingPctRef.current = null;

    const measurePct = (): number | null => {
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (scrollable <= 80 || window.scrollY < 48) return null;
      return Math.min(100, Math.max(0, Math.round((window.scrollY / scrollable) * 100)));
    };

    const measureAndSave = () => {
      const pct = measurePct();
      pendingPctRef.current = null;
      if (pct !== null) {
        saveReadingProgress(book.id, episode.id, pct);
      }
    };

    const onScroll = () => {
      const pct = measurePct();
      if (pct !== null) {
        pendingPctRef.current = pct;
      }
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measureAndSave, 500);
    };

    // Auto-complete short chapters/poems that fit in one screen after reader lingers 3.5s
    const checkShortTimer = setTimeout(() => {
      const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (scrollable <= 80) {
        shortTimer = setTimeout(() => {
          saveReadingProgress(book.id, episode.id, 100);
        }, 3500);
      }
    }, 400);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', measureAndSave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', measureAndSave);
      clearTimeout(checkShortTimer);
      if (shortTimer) clearTimeout(shortTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (pendingPctRef.current !== null) {
        saveReadingProgress(book.id, episode.id, pendingPctRef.current);
        pendingPctRef.current = null;
      }
    };
  }, [book.id, episode.id, isPreview, saveReadingProgress, viewMode]);

  const handlePlayClick = () => {
    playEpisode(book, episode, effectiveVoiceKey || undefined);
  };

  const handleVoiceChange = (newVoiceKey: string) => {
    setSelectedVoiceKey(newVoiceKey);
    if (isThisEpisodeActive) {
      switchVoice(newVoiceKey);
    } else {
      playEpisode(book, episode, newVoiceKey);
    }
  };

  const openIllustrationByUrl = (url: string) => {
    const idx = illustrations.findIndex((item) => item.url === url);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const showStickyMicroControl =
    hasAudio && !isAudioStripVisible && (isThisEpisodeActive || viewMode === 'story');

  const ownCoverUrl = (episode.coverUrl || '').trim();
  const hasOwnEpisodeCover = Boolean(ownCoverUrl);
  const preset = BOOK_PRESETS[book.themePreset] || BOOK_PRESETS.moss;
  const heroWashBg = isNight ? preset.nightWash : preset.dayWash;

  const episodeHeaderContent = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="vn-eyebrow truncate" style={{ color: 'var(--text-secondary)' }}>
          Tập {episode.episodeCode}
          {episode.categoryTag ? ` · ${episode.categoryTag}` : ''}
        </span>

        {illustrations.length > 1 && (
          <div
            role="tablist"
            aria-label="Chế độ đọc hoặc xem tranh"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="inline-flex rounded-[7px] p-0.5 shrink-0"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'story'}
              onClick={() => setViewMode('story')}
              style={{
                backgroundColor:
                  viewMode === 'story' ? 'var(--bg-elevated)' : 'transparent',
                color:
                  viewMode === 'story' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              className="px-2.5 h-7 rounded-[5px] text-[11px] font-medium transition"
            >
              Đọc truyện
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'gallery'}
              onClick={() => setViewMode('gallery')}
              style={{
                backgroundColor:
                  viewMode === 'gallery' ? 'var(--bg-elevated)' : 'transparent',
                color:
                  viewMode === 'gallery' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
              className="px-2.5 h-7 rounded-[5px] text-[11px] font-medium transition"
            >
              Xem tranh ({illustrations.length})
            </button>
          </div>
        )}
      </div>

      <h1 className="text-[21px] font-bold font-editorial mt-1.5 leading-snug">
        {episode.title}
      </h1>

      {/* 3. Single-Line Slim 38px Audio & Voice Strip (Hidden completely when isTextOnly) */}
      {hasAudio && (
        <div
          ref={audioStripRef}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)'
          }}
          className="mt-3 h-[38px] px-2.5 rounded-[8px] flex items-center justify-between gap-2"
        >
          <button
            type="button"
            onClick={handlePlayClick}
            style={{ color: 'var(--accent-primary)' }}
            className="h-8 px-1.5 inline-flex items-center gap-1.5 text-xs font-semibold tabular-nums shrink-0"
          >
            {isThisEpisodePlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
            <span>
              {isThisEpisodeActive && duration > 0
                ? `${formatClock(currentTime)} / ${formatClock(duration)}`
                : `Nghe · ${formatDurationShort(defaultDuration)}`}
            </span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            {episode.audioTracks.length > 1 ? (
              <div
                style={{ color: 'var(--text-primary)' }}
                className="inline-flex items-center gap-1 text-xs min-w-0"
              >
                <MicIcon size={13} className="shrink-0 opacity-75" />
                <select
                  aria-label="Chọn giọng đọc"
                  value={effectiveVoiceKey}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="bg-transparent outline-none text-xs font-medium truncate max-w-[140px] cursor-pointer"
                >
                  {episode.audioTracks.map((t) => (
                    <option key={t.id} value={t.voiceProfile.voiceKey}>
                      {t.voiceProfile.displayName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span
                className="text-xs truncate max-w-[130px]"
                style={{ color: 'var(--text-secondary)' }}
              >
                {episode.audioTracks[0]?.voiceProfile.displayName}
              </span>
            )}

            {isThisEpisodeActive && (
              <button
                type="button"
                aria-label="Mở trình phát lớn"
                onClick={() => setFullPlayerOpen(true)}
                style={{ color: 'var(--text-secondary)' }}
                className="w-7 h-7 flex items-center justify-center shrink-0"
              >
                <ExpandIcon size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Sticky 42px 5-Step Wayfinder, 0px Micro-Audio Control & Typography Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[42px] px-2.5 flex items-center justify-between gap-1"
      >
        <LibraryWayfinder
          currentStep="episode"
          currentHall={hall}
          currentBook={book}
          currentEpisode={episode}
        />

        <div className="flex items-center gap-0.5 shrink-0">
          {showStickyMicroControl && (
            <button
              type="button"
              onClick={handlePlayClick}
              aria-label={isThisEpisodePlaying ? 'Tạm dừng nghe' : 'Phát tiếp'}
              style={{
                backgroundColor: isThisEpisodePlaying
                  ? 'var(--accent-primary)'
                  : 'var(--bg-surface)',
                color: isThisEpisodePlaying
                  ? 'var(--accent-primary-fg)'
                  : 'var(--accent-primary)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-7 px-2 rounded-full inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums"
            >
              {isThisEpisodePlaying ? <PauseIcon size={11} /> : <PlayIcon size={11} />}
              {isThisEpisodeActive && duration > 0 && (
                <span className="hidden min-[380px]:inline">{formatClock(currentTime)}</span>
              )}
            </button>
          )}

          {viewMode === 'story' && (
            <>
              <button
                type="button"
                aria-label="Giảm cỡ chữ"
                onClick={() => adjustReaderFontSize(-1)}
                style={{ color: 'var(--text-secondary)' }}
                className="w-7 h-7 rounded-[6px] text-xs font-medium flex items-center justify-center"
              >
                A-
              </button>
              <button
                type="button"
                aria-label="Tăng cỡ chữ"
                onClick={() => adjustReaderFontSize(1)}
                style={{ color: 'var(--text-primary)' }}
                className="w-7 h-7 rounded-[6px] text-xs font-semibold flex items-center justify-center"
              >
                A+
              </button>
            </>
          )}
          <button
            type="button"
            aria-label={isNight ? 'Giao diện giấy sáng' : 'Giao diện ban đêm'}
            onClick={toggleNight}
            style={{ color: 'var(--text-primary)' }}
            className="w-7 h-7 rounded-[6px] flex items-center justify-center"
          >
            {isNight ? <SunIcon size={15} /> : <MoonIcon size={15} />}
          </button>
        </div>
      </header>

      {isPreview && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-hairline)',
            color: 'var(--accent-warm)'
          }}
          className="px-4 py-1.5 text-[11px] font-medium text-center"
        >
          Chế độ xem trước quản trị (Bản nháp chưa công khai cho người nghe)
        </div>
      )}

      {/* 2. Gallery Bookplate Stage (Only when episode has its own coverUrl) OR Direct Text-First Header */}
      {hasOwnEpisodeCover && viewMode === 'story' ? (
        <StorybookHeroStage
          src={ownCoverUrl}
          alt={episode.title}
          focalPoint={book.coverFocalPoint}
          washBg={heroWashBg}
          variant="bookplate"
          roundedClass="rounded-[9px]"
          paddingXClass="px-4"
        >
          <div>{episodeHeaderContent}</div>
        </StorybookHeroStage>
      ) : (
        <div className="px-4 pt-4 pb-2">{episodeHeaderContent}</div>
      )}

      {/* 4A. Long-Form Story Reader Mode (Uncaptioned 3:4 Portrait Interleaved Illustrations) */}
      {viewMode === 'story' ? (
        <article
          ref={articleRef}
          style={{ fontSize: `${readerFontSize}px` }}
          className="px-4 pt-3 pb-8 story-prose space-y-4 flex-1"
        >
          {blocks.map((block, idx) => {
            if (block.type === 'heading') {
              return (
                <h2
                  key={idx}
                  className="text-[1.12em] font-semibold font-editorial pt-3"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'divider') {
              return (
                <div
                  key={idx}
                  aria-hidden="true"
                  style={{ color: 'var(--accent-warm)' }}
                  className="py-2 text-center text-sm select-none opacity-80"
                >
                  &#10086;
                </div>
              );
            }
            if (block.type === 'image') {
              if (hasOwnEpisodeCover && block.url.trim() === ownCoverUrl) {
                return null;
              }
              return (
                <div key={idx} className="my-5">
                  <button
                    type="button"
                    onClick={() => openIllustrationByUrl(block.url)}
                    aria-label="Chạm để ngắm tranh toàn màn hình"
                    style={{
                      width: 'min(100%, calc(78dvh * 0.75))',
                      border: '1px solid var(--border-hairline)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                    className="mx-auto rounded-[8px] overflow-hidden block shadow-sm transition active:scale-[0.995]"
                  >
                    <img
                      src={block.url}
                      alt={block.alt}
                      loading="lazy"
                      className="w-full h-auto block select-none"
                    />
                  </button>
                </div>
              );
            }
            return (
              <p key={idx} className="text-[1em]">
                {block.text}
              </p>
            );
          })}
        </article>
      ) : (
        /* 4B. Gallery Mode when an episode has multiple uploaded illustrations */
        <section
          aria-label="Bộ tranh minh họa của tập truyện"
          className="px-4 pt-3 pb-8 space-y-5 flex-1"
        >
          {illustrations.map((ill, idx) => (
            <button
              key={`${ill.url}-${idx}`}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              aria-label={`Xem tranh ${idx + 1} toàn màn hình`}
              style={{
                width: 'min(100%, calc(78dvh * 0.75))',
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-surface)'
              }}
              className="mx-auto rounded-[8px] overflow-hidden block shadow-sm transition active:scale-[0.995]"
            >
              <img
                src={ill.url}
                alt={ill.alt}
                loading="lazy"
                className="w-full h-auto block select-none"
              />
            </button>
          ))}
        </section>
      )}

      {/* 5. Quiet Bottom Exit & Next/Prev Episode Navigation */}
      <footer
        style={{ borderTop: '1px solid var(--border-hairline)' }}
        className="px-4 py-5 space-y-3 text-xs"
      >
        <div className="flex items-center justify-between gap-2">
          {prevEpisode ? (
            <Link
              href={`/episodes/${prevEpisode.id}`}
              style={{ color: 'var(--text-secondary)' }}
              className="h-10 inline-flex items-center gap-1 font-medium"
            >
              <span>&larr; Tập {prevEpisode.episodeCode}</span>
            </Link>
          ) : (
            <Link
              href={`/books/${book.slug}`}
              style={{ color: 'var(--text-secondary)' }}
              className="h-10 inline-flex items-center gap-1 font-medium"
            >
              <span>&larr; Mục lục sách</span>
            </Link>
          )}

          {nextEpisode ? (
            <Link
              href={`/episodes/${nextEpisode.id}`}
              onClick={() => {
                if (!isPreview) saveReadingProgress(book.id, episode.id, 100);
              }}
              style={{ color: 'var(--accent-primary)' }}
              className="h-10 inline-flex items-center gap-1 font-semibold"
            >
              <span>Tập {nextEpisode.episodeCode} &rarr;</span>
            </Link>
          ) : (
            <Link
              href={`/books/${book.slug}`}
              onClick={() => {
                if (!isPreview) saveReadingProgress(book.id, episode.id, 100);
              }}
              style={{ color: 'var(--accent-primary)' }}
              className="h-10 inline-flex items-center gap-1 font-semibold"
            >
              <span>Hoàn thành &rarr;</span>
            </Link>
          )}
        </div>
        <p className="text-center text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          Copyright &copy; Nancy &amp; Liti
        </p>
      </footer>

      {/* Fullscreen Portrait Lightbox Modal */}
      {lightboxIndex !== null && illustrations[lightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem tranh toàn màn hình"
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between p-4"
        >
          <div className="flex items-center justify-between text-[#EFE9DC] text-xs">
            <span className="tabular-nums">
              Tranh {lightboxIndex + 1} / {illustrations.length}
            </span>
            <button
              type="button"
              aria-label="Đóng xem tranh"
              onClick={() => setLightboxIndex(null)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center my-2 overflow-hidden"
          >
            <img
              src={illustrations[lightboxIndex].url}
              alt={illustrations[lightboxIndex].alt}
              className="max-h-full max-w-full object-contain rounded-[6px]"
            />
          </div>

          {illustrations.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-between text-xs text-[#EFE9DC]"
            >
              <button
                type="button"
                disabled={lightboxIndex === 0}
                onClick={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
                className="h-10 px-4 rounded-[8px] bg-white/10 disabled:opacity-30"
              >
                &larr; Tranh trước
              </button>
              <button
                type="button"
                disabled={lightboxIndex === illustrations.length - 1}
                onClick={() =>
                  setLightboxIndex((i) =>
                    Math.min(illustrations.length - 1, (i ?? 0) + 1)
                  )
                }
                className="h-10 px-4 rounded-[8px] bg-white/10 disabled:opacity-30"
              >
                Tranh tiếp &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
