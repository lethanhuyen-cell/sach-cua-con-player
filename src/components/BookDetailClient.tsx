'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { HydratedBook, HydratedEpisode, VoiceProfile } from '@/lib/types';
import {
  BOOK_PRESETS,
  estimateReadingMinutes,
  formatClock,
  formatDurationShort
} from '@/lib/presets';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  MicIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon
} from './Icons';

function getEpisodeExcerpt(ep: HydratedEpisode): string {
  const rawSum = (ep.summary || '').trim();
  const isBadSummary =
    !rawSum ||
    rawSum.endsWith('...') ||
    rawSum === rawSum.toUpperCase() ||
    rawSum.toUpperCase() === ep.title.toUpperCase();

  if (!isBadSummary) {
    return rawSum;
  }

  const blocks = (ep.contentMarkdown || '').split(/\n{2,}/);
  for (const raw of blocks) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('![') || line === '❦') {
      continue;
    }
    return line;
  }
  return '';
}

export function BookDetailClient({ book }: { book: HydratedBook }) {
  const {
    isNight,
    toggleNight,
    favorites,
    toggleFavorite,
    progressMap,
    preferredVoiceKey,
    selectVoicePreference,
    activeEpisode,
    activeTrack,
    isPlaying,
    currentTime,
    playEpisode
  } = useLibraryPlayer();

  const [selectedPartId, setSelectedPartId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unheard' | 'saved'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const preset = BOOK_PRESETS[book.themePreset] || BOOK_PRESETS.moss;
  const washBg = isNight ? preset.nightWash : preset.dayWash;
  const accentColor = isNight ? preset.nightAccent : preset.dayAccent;
  const accentTextOnSolid = isNight ? '#111613' : '#F8F5EE';

  // Collect all unique voice profiles available in this book
  const availableVoices = useMemo<VoiceProfile[]>(() => {
    const map = new Map<string, VoiceProfile>();
    for (const ep of book.episodes) {
      for (const trk of ep.audioTracks) {
        if (!map.has(trk.voiceProfile.voiceKey)) {
          map.set(trk.voiceProfile.voiceKey, trk.voiceProfile);
        }
      }
    }
    return Array.from(map.values());
  }, [book.episodes]);

  const effectiveSelectedVoice = useMemo(() => {
    if (
      activeEpisode &&
      book.episodes.some((e) => e.id === activeEpisode.id) &&
      activeTrack
    ) {
      return activeTrack.voiceProfile.voiceKey;
    }
    if (availableVoices.some((v) => v.voiceKey === preferredVoiceKey)) {
      return preferredVoiceKey;
    }
    return availableVoices[0]?.voiceKey || '';
  }, [activeEpisode, activeTrack, availableVoices, book.episodes, preferredVoiceKey]);

  const partFilteredEpisodes = useMemo(() => {
    if (selectedPartId === 'ALL' || book.parts.length === 0) {
      return book.episodes;
    }
    return book.episodes.filter((ep) => ep.partId === selectedPartId);
  }, [book.episodes, book.parts.length, selectedPartId]);

  const unheardCount = useMemo(
    () => partFilteredEpisodes.filter((ep) => !progressMap[ep.id]?.completed).length,
    [partFilteredEpisodes, progressMap]
  );

  const savedInBookCount = useMemo(
    () => partFilteredEpisodes.filter((ep) => favorites.includes(ep.id)).length,
    [partFilteredEpisodes, favorites]
  );

  const visibleEpisodes = useMemo(() => {
    let list = partFilteredEpisodes.filter((ep) => {
      if (statusFilter === 'unheard') return !progressMap[ep.id]?.completed;
      if (statusFilter === 'saved') return favorites.includes(ep.id);
      return true;
    });
    if (sortOrder === 'desc') {
      list = [...list].reverse();
    }
    return list;
  }, [favorites, partFilteredEpisodes, progressMap, sortOrder, statusFilter]);

  // Smart primary CTA target: in-progress episode in this book -> next unheard audio episode -> first episode
  const primaryAudioTarget = useMemo(() => {
    const audioEpisodes = book.episodes.filter(
      (e) => !e.isTextOnly && e.audioTracks.length > 0
    );
    if (audioEpisodes.length === 0) return null;

    const inProg = audioEpisodes.find((e) => {
      const p = progressMap[e.id];
      return p && p.positionSeconds > 0 && !p.completed;
    });
    if (inProg) return { episode: inProg, resume: true };

    const firstUnheard = audioEpisodes.find((e) => !progressMap[e.id]?.completed);
    return { episode: firstUnheard || audioEpisodes[0], resume: false };
  }, [book.episodes, progressMap]);

  const completedCount = book.episodes.filter((ep) => progressMap[ep.id]?.completed).length;

  return (
    <div className="pb-8">
      {/* Preset Watercolor Wash Header */}
      <div
        style={{
          backgroundColor: washBg,
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="px-4 pt-3 pb-6"
      >
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/books"
            style={{ color: 'var(--text-primary)' }}
            className="h-10 pr-3 inline-flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeftIcon size={17} />
            <span>Tủ sách</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              style={{ color: 'var(--text-secondary)' }}
              className="h-10 px-2.5 inline-flex items-center text-xs"
            >
              Trang chủ
            </Link>
            <button
              type="button"
              onClick={toggleNight}
              aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-10 h-10 rounded-[8px] flex items-center justify-center"
            >
              {isNight ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>
        </div>

        {/* Book Identity Row */}
        <div className="flex gap-4 items-start">
          <div className="w-[116px] shrink-0">
            <BookCover
              src={book.coverUrl}
              alt={book.title}
              focalPoint={book.coverFocalPoint}
            />
          </div>

          <div className="flex-1 min-w-0">
            <span className="vn-eyebrow block" style={{ color: accentColor }}>
              {book.genreTag} · {book.ageRange}
            </span>
            <h1 className="text-[21px] font-bold font-editorial mt-0.5">{book.title}</h1>
            {book.subtitle && (
              <p
                className="text-xs italic mt-1 font-editorial"
                style={{ color: 'var(--text-secondary)' }}
              >
                {book.subtitle}
              </p>
            )}
            {(book.author || book.illustrator) && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {book.author ? `Tác giả: ${book.author}` : ''}
                {book.author && book.illustrator ? ' · ' : ''}
                {book.illustrator ? `Minh họa: ${book.illustrator}` : ''}
              </p>
            )}
          </div>
        </div>

        {book.description && (
          <p
            className="text-[13.5px] leading-relaxed mt-4"
            style={{ color: 'var(--text-primary)' }}
          >
            {book.description}
          </p>
        )}

        {/* Primary Action Row */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {primaryAudioTarget ? (
            <button
              type="button"
              onClick={() =>
                playEpisode(
                  book,
                  primaryAudioTarget.episode,
                  effectiveSelectedVoice || undefined
                )
              }
              style={{
                backgroundColor: accentColor,
                color: accentTextOnSolid
              }}
              className="h-11 px-4 rounded-[8px] text-xs font-semibold inline-flex items-center gap-2"
            >
              {activeEpisode?.id === primaryAudioTarget.episode.id && isPlaying ? (
                <PauseIcon size={15} />
              ) : (
                <PlayIcon size={15} />
              )}
              <span>
                {activeEpisode?.id === primaryAudioTarget.episode.id && isPlaying
                  ? 'Đang phát'
                  : primaryAudioTarget.resume
                    ? `Phát tiếp Tập ${primaryAudioTarget.episode.episodeCode}`
                    : `Nghe từ Tập ${primaryAudioTarget.episode.episodeCode}`}
              </span>
            </button>
          ) : (
            book.episodes[0] && (
              <Link
                href={`/episodes/${book.episodes[0].id}`}
                style={{
                  backgroundColor: accentColor,
                  color: accentTextOnSolid
                }}
                className="h-11 px-4 rounded-[8px] text-xs font-semibold inline-flex items-center gap-2"
              >
                <BookOpenIcon size={15} />
                <span>Mở trang đọc Tập {book.episodes[0].episodeCode}</span>
              </Link>
            )
          )}

          <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {completedCount > 0
              ? `${completedCount} / ${book.episodes.length} tập đã nghe`
              : `${book.episodes.length} tập truyện`}
          </span>
        </div>
      </div>

      {/* Optional Part Filter Pills (Hidden automatically when book has 0 Parts) */}
      {book.parts.length > 0 && (
        <div className="px-4 pt-4 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedPartId('ALL')}
            style={{
              backgroundColor:
                selectedPartId === 'ALL' ? accentColor : 'var(--bg-surface)',
              color:
                selectedPartId === 'ALL' ? accentTextOnSolid : 'var(--text-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
          >
            Tất cả phần ({book.episodes.length})
          </button>
          {book.parts.map((part) => {
            const active = selectedPartId === part.id;
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedPartId(part.id)}
                style={{
                  backgroundColor: active ? accentColor : 'var(--bg-surface)',
                  color: active ? accentTextOnSolid : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
              >
                {part.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Illustrated Story Chapter Cards & Editorial Toolbar */}
      <section aria-label="Mục lục tập truyện" className="px-4 pt-5 space-y-3.5">
        {/* Row 1: Section Heading + Compact Voice Selector */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[18px] font-bold font-editorial">Mục lục tập truyện</h2>

          {availableVoices.length > 1 && (
            <div
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-hairline)',
                color: accentColor
              }}
              className="h-9 px-2.5 rounded-[8px] inline-flex items-center gap-1.5 text-xs font-medium shrink-0"
            >
              <MicIcon size={13} className="shrink-0" />
              <select
                aria-label="Chọn giọng kể mặc định"
                value={effectiveSelectedVoice}
                onChange={(e) => selectVoicePreference(e.target.value)}
                className="bg-transparent outline-none cursor-pointer font-medium pr-0.5"
              >
                {availableVoices.map((vp) => (
                  <option key={vp.id} value={vp.voiceKey}>
                    {vp.displayName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 2: Quick Status Filter Pills + Sort Order Toggle */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(
              [
                { key: 'all', label: `Tất cả (${partFilteredEpisodes.length})` },
                { key: 'unheard', label: `Chưa nghe (${unheardCount})` },
                { key: 'saved', label: `Đã lưu (${savedInBookCount})` }
              ] as const
            ).map((pill) => {
              const isSelected = statusFilter === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setStatusFilter(pill.key)}
                  style={{
                    backgroundColor: isSelected ? accentColor : 'var(--bg-surface)',
                    color: isSelected ? accentTextOnSolid : 'var(--text-secondary)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="h-8 px-3 rounded-[7px] text-[11.5px] font-medium shrink-0 tabular-nums transition"
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="h-8 px-2.5 rounded-[7px] text-[11.5px] font-medium shrink-0"
          >
            {sortOrder === 'asc' ? 'Từ đầu ↑' : 'Mới nhất ↓'}
          </button>
        </div>

        {/* Chapter Cards List */}
        {visibleEpisodes.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="rounded-[10px] p-6 text-center space-y-2"
          >
            <p className="text-sm font-editorial">
              {statusFilter === 'saved'
                ? 'Chưa có tập nào được đánh dấu lưu trong bộ sách này.'
                : 'Bạn đã nghe trọn vẹn tất cả các tập trong mục này.'}
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{ color: accentColor }}
              className="text-xs font-semibold underline"
            >
              Xem lại toàn bộ các tập
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEpisodes.map((ep) => {
              const prog = progressMap[ep.id];
              const isEpActive = activeEpisode?.id === ep.id;
              const isEpPlaying = isEpActive && isPlaying;
              const isSaved = favorites.includes(ep.id);
              const pct =
                prog && prog.durationSeconds > 0
                  ? Math.min(
                      99,
                      Math.round((prog.positionSeconds / prog.durationSeconds) * 100)
                    )
                  : 0;

              // Find matching voice track duration for the selected voice
              const preferredTrack =
                ep.audioTracks.find(
                  (t) => t.voiceProfile.voiceKey === effectiveSelectedVoice
                ) || ep.audioTracks[0];
              const epDurationSec = preferredTrack?.durationSeconds || 0;
              const excerpt = getEpisodeExcerpt(ep);

              const cardBorder = isEpActive
                ? `1.5px solid ${accentColor}`
                : '1px solid var(--border-hairline)';

              return (
                <article
                  key={ep.id}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: cardBorder
                  }}
                  className="rounded-[11px] overflow-hidden transition"
                >
                  <div className="p-3.5 flex gap-3.5 items-start">
                    {/* Left: Clean 3:4 Episode Watercolor Artwork (84×112px, Zero Overlaid Badges) */}
                    <Link
                      href={`/episodes/${ep.id}`}
                      aria-label={`Đọc tập ${ep.episodeCode}: ${ep.title}`}
                      className="w-[84px] shrink-0 block"
                    >
                      <BookCover
                        src={ep.effectiveCoverUrl}
                        alt={ep.title}
                        focalPoint={book.coverFocalPoint}
                      />
                    </Link>

                    {/* Right: Eyebrow + Bookmark, Literary Title, 2-Line Excerpt, Separate Listen & Read Actions */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="vn-eyebrow truncate"
                            style={{
                              color: isEpActive
                                ? accentColor
                                : prog?.completed
                                  ? accentColor
                                  : 'var(--text-secondary)'
                            }}
                          >
                            {book.showEpisodeNumbers ? `Tập ${ep.episodeCode}` : 'Chương truyện'}
                            {ep.categoryTag ? ` · ${ep.categoryTag}` : ''}
                            {prog?.completed ? ' · Đã nghe' : ''}
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label={isSaved ? 'Bỏ lưu tập này' : 'Lưu tập này'}
                          onClick={() => toggleFavorite(ep.id)}
                          style={{
                            color: isSaved ? 'var(--accent-berry)' : 'var(--text-secondary)'
                          }}
                          className="w-8 h-7 -mr-1 flex items-center justify-center shrink-0"
                        >
                          <BookmarkIcon size={16} filled={isSaved} />
                        </button>
                      </div>

                      <Link href={`/episodes/${ep.id}`} className="block mt-0.5">
                        <h3
                          style={{
                            color: isEpActive ? accentColor : 'var(--text-primary)'
                          }}
                          className="text-[16px] font-bold font-editorial line-clamp-2"
                        >
                          {ep.title}
                        </h3>
                      </Link>

                      {excerpt && (
                        <Link href={`/episodes/${ep.id}`} className="block mt-1">
                          <p
                            className="text-[12.5px] leading-relaxed line-clamp-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {excerpt}
                          </p>
                        </Link>
                      )}

                      {/* Distinct Listen vs Read Entry Points */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        {!ep.isTextOnly && ep.audioTracks.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              playEpisode(book, ep, effectiveSelectedVoice || undefined)
                            }
                            style={{
                              backgroundColor: isEpPlaying
                                ? accentColor
                                : 'var(--bg-surface)',
                              color: isEpPlaying ? accentTextOnSolid : accentColor,
                              border: isEpPlaying
                                ? `1px solid ${accentColor}`
                                : '1px solid var(--border-hairline)'
                            }}
                            className="h-9 px-3.5 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums"
                          >
                            {isEpPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                            <span>
                              {isEpPlaying
                                ? `Đang phát · ${formatClock(currentTime)}`
                                : pct > 0 && !prog?.completed
                                  ? `Nghe tiếp · ${pct}%`
                                  : `Nghe · ${formatDurationShort(epDurationSec)}`}
                            </span>
                          </button>
                        ) : (
                          <span
                            className="text-xs tabular-nums"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            Chỉ đọc chữ · {estimateReadingMinutes(ep.wordCount)}
                          </span>
                        )}

                        <Link
                          href={`/episodes/${ep.id}`}
                          style={{ color: 'var(--text-secondary)' }}
                          className="h-9 px-2 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        >
                          <BookOpenIcon size={14} />
                          <span>Đọc truyện</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Bottom Progress Strip */}
                  {(prog?.completed || pct > 0) && (
                    <div className="h-[2.5px] w-full bg-[var(--bg-surface)]">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: prog?.completed ? '100%' : `${pct}%`,
                          backgroundColor: prog?.completed
                            ? accentColor
                            : 'var(--accent-warm)',
                          opacity: prog?.completed ? 0.55 : 1
                        }}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
