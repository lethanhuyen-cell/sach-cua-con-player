'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { HydratedBook } from '@/lib/types';
import {
  BOOK_PRESETS,
  estimateReadingMinutes,
  formatDurationShort
} from '@/lib/presets';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronLeftIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon
} from './Icons';

export function BookDetailClient({ book }: { book: HydratedBook }) {
  const {
    isNight,
    toggleNight,
    favorites,
    toggleFavorite,
    progressMap,
    activeEpisode,
    isPlaying,
    playEpisode
  } = useLibraryPlayer();

  const [selectedPartId, setSelectedPartId] = useState<string>('ALL');

  const preset = BOOK_PRESETS[book.themePreset] || BOOK_PRESETS.moss;
  const washBg = isNight ? preset.nightWash : preset.dayWash;
  const accentColor = isNight ? preset.nightAccent : preset.dayAccent;

  const visibleEpisodes = useMemo(() => {
    if (selectedPartId === 'ALL' || book.parts.length === 0) {
      return book.episodes;
    }
    return book.episodes.filter((ep) => ep.partId === selectedPartId);
  }, [book.episodes, book.parts.length, selectedPartId]);

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
            <h1 className="text-[20px] font-bold font-editorial mt-0.5">{book.title}</h1>
            {book.subtitle && (
              <p className="text-xs italic mt-1 font-editorial" style={{ color: 'var(--text-secondary)' }}>
                {book.subtitle}
              </p>
            )}
            {(book.author || book.illustrator) && (
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {book.author ? `Lời: ${book.author}` : ''}
                {book.author && book.illustrator ? ' · ' : ''}
                {book.illustrator ? `Tranh: ${book.illustrator}` : ''}
              </p>
            )}
          </div>
        </div>

        {book.description && (
          <p className="text-[13.5px] leading-relaxed mt-4" style={{ color: 'var(--text-primary)' }}>
            {book.description}
          </p>
        )}

        {/* Primary Action Row */}
        <div className="mt-4 flex items-center gap-2.5">
          {primaryAudioTarget ? (
            <button
              type="button"
              onClick={() => playEpisode(book, primaryAudioTarget.episode)}
              style={{
                backgroundColor: accentColor,
                color: isNight ? '#111613' : '#F8F5EE'
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
                  color: isNight ? '#111613' : '#F8F5EE'
                }}
                className="h-11 px-4 rounded-[8px] text-xs font-semibold inline-flex items-center gap-2"
              >
                <BookOpenIcon size={15} />
                <span>Mở trang đọc Tập {book.episodes[0].episodeCode}</span>
              </Link>
            )
          )}

          <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {completedCount}/{book.episodes.length} tập đã nghe
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
                selectedPartId === 'ALL'
                  ? isNight
                    ? '#111613'
                    : '#F8F5EE'
                  : 'var(--text-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
          >
            Tất cả ({book.episodes.length})
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
                  color: active
                    ? isNight
                      ? '#111613'
                      : '#F8F5EE'
                    : 'var(--text-secondary)',
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

      {/* Book-Style Aligned Table of Contents (Mục lục Tập) */}
      <section aria-label="Mục lục tập truyện" className="px-4 pt-5">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-[16px] font-semibold font-editorial">Mục lục tập truyện</h2>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Chạm tên tập để đọc & xem tranh
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hairline)'
          }}
          className="rounded-[10px] divide-y divide-[var(--border-hairline)]"
        >
          {visibleEpisodes.map((ep) => {
            const prog = progressMap[ep.id];
            const isEpPlaying = activeEpisode?.id === ep.id && isPlaying;
            const isSaved = favorites.includes(ep.id);
            const pct =
              prog && prog.durationSeconds > 0
                ? Math.min(99, Math.round((prog.positionSeconds / prog.durationSeconds) * 100))
                : 0;

            return (
              <div
                key={ep.id}
                className="px-3.5 py-3 flex items-center gap-3"
              >
                {book.showEpisodeNumbers && (
                  <Link
                    href={`/episodes/${ep.id}`}
                    style={{ color: isEpPlaying ? accentColor : 'var(--text-secondary)' }}
                    className="w-7 text-xs font-semibold tabular-nums shrink-0 text-left"
                  >
                    {ep.episodeCode}
                  </Link>
                )}

                <Link href={`/episodes/${ep.id}`} className="flex-1 min-w-0">
                  <h3
                    style={{ color: isEpPlaying ? accentColor : 'var(--text-primary)' }}
                    className="text-[15px] font-semibold font-editorial line-clamp-2"
                  >
                    {ep.title}
                  </h3>
                  <div
                    className="text-xs mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {ep.isTextOnly ? (
                      <span>Chỉ đọc chữ · {estimateReadingMinutes(ep.wordCount)}</span>
                    ) : (
                      <>
                        <span>
                          {formatDurationShort(ep.audioTracks[0]?.durationSeconds || 0)}
                        </span>
                        <span>· {ep.audioTracks.length} giọng đọc</span>
                      </>
                    )}
                    {prog?.completed ? (
                      <span style={{ color: accentColor }} className="font-medium">
                        · Đã nghe
                      </span>
                    ) : pct > 0 ? (
                      <span style={{ color: 'var(--accent-warm)' }} className="font-medium">
                        · Đang nghe {pct}%
                      </span>
                    ) : null}
                  </div>
                </Link>

                <div className="flex items-center gap-1 shrink-0">
                  {!ep.isTextOnly && ep.audioTracks.length > 0 && (
                    <button
                      type="button"
                      aria-label={isEpPlaying ? `Tạm dừng ${ep.title}` : `Phát ${ep.title}`}
                      onClick={() => playEpisode(book, ep)}
                      style={{
                        backgroundColor: isEpPlaying ? accentColor : 'var(--bg-surface)',
                        color: isEpPlaying
                          ? isNight
                            ? '#111613'
                            : '#F8F5EE'
                          : accentColor,
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      {isEpPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={isSaved ? 'Bỏ đánh dấu' : 'Đánh dấu tập này'}
                    onClick={() => toggleFavorite(ep.id)}
                    style={{
                      color: isSaved ? 'var(--accent-berry)' : 'var(--text-secondary)'
                    }}
                    className="w-10 h-10 flex items-center justify-center"
                  >
                    <BookmarkIcon size={17} filled={isSaved} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
