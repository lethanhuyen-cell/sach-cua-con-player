'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SunIcon
} from '@/components/Icons';
import { estimateReadingMinutes, formatClock, formatDurationShort } from '@/lib/presets';

export default function HomeLibraryPage() {
  const {
    books,
    isNight,
    toggleNight,
    favorites,
    progressMap,
    activeEpisode,
    isPlaying,
    playEpisode,
    continueItems
  } = useLibraryPlayer();

  // Only show the Continue Listening card when the listener has actual listening history
  const resumeItem = continueItems.length > 0 ? continueItems[0] : null;

  const savedEpisodes = useMemo(() => {
    const list: {
      bookTitle: string;
      episodeId: string;
      title: string;
      code: string;
      durationLabel: string;
    }[] = [];
    for (const b of books) {
      for (const ep of b.episodes) {
        if (favorites.includes(ep.id)) {
          const dur = ep.isTextOnly
            ? estimateReadingMinutes(ep.wordCount)
            : formatDurationShort(ep.audioTracks[0]?.durationSeconds || 0);
          list.push({
            bookTitle: b.title,
            episodeId: ep.id,
            title: ep.title,
            code: ep.episodeCode,
            durationLabel: dur
          });
        }
      }
    }
    return list.slice(0, 4);
  }, [books, favorites]);

  const isResumePlaying =
    resumeItem && activeEpisode?.id === resumeItem.episode.id && isPlaying;

  const resumePct =
    resumeItem && resumeItem.durationSeconds > 0
      ? Math.min(100, Math.round((resumeItem.progressSeconds / resumeItem.durationSeconds) * 100))
      : 0;

  return (
    <div className="px-4 pt-4 pb-6 space-y-6">
      {/* Clean Editorial Header */}
      <header
        style={{ borderBottom: '1px solid var(--border-hairline)' }}
        className="pb-3.5 flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <h1 className="text-[22px] font-bold tracking-tight font-editorial">
            Thư viện Đồi Mơ
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Sách đọc và nghe trước giờ ngủ
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/books"
            aria-label="Tìm kiếm trong tủ sách"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-primary)'
            }}
            className="w-11 h-11 rounded-[8px] flex items-center justify-center"
          >
            <SearchIcon size={17} />
          </Link>
          <button
            type="button"
            onClick={toggleNight}
            aria-label={
              isNight ? 'Chuyển sang giao diện giấy sáng' : 'Chuyển sang giao diện ban đêm'
            }
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-primary)'
            }}
            className="w-11 h-11 rounded-[8px] flex items-center justify-center"
          >
            {isNight ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
        </div>
      </header>

      {/* Continue Listening Card (Only shown when listener has started listening) */}
      {resumeItem && (
        <section aria-label="Nghe tiếp">
          <div className="flex items-center justify-between mb-2">
            <span className="vn-eyebrow" style={{ color: 'var(--accent-primary)' }}>
              {resumeItem.kind === 'in_progress' ? 'Đang nghe dở' : 'Tập kế tiếp'}
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
              className="w-[76px] shrink-0 block"
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

              {resumeItem.kind === 'in_progress' ? (
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
                  {formatDurationShort(resumeItem.durationSeconds)}
                </p>
              )}

              <div className="mt-2.5">
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
                  <span>{isResumePlaying ? 'Tạm dừng' : 'Nghe tiếp'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Clean Bookshelf */}
      <section aria-label="Tủ sách">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-[17px] font-semibold font-editorial">Tủ sách</h2>
          {books.length > 1 && (
            <Link
              href="/books"
              style={{ color: 'var(--accent-primary)' }}
              className="text-xs font-medium"
            >
              Tất cả ({books.length})
            </Link>
          )}
        </div>

        {books.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="rounded-[10px] p-6 text-center text-sm font-editorial"
          >
            Tủ sách đang được cập nhật.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {books.map((book) => {
              const completedCount = book.episodes.filter(
                (ep) => progressMap[ep.id]?.completed
              ).length;

              return (
                <Link
                  key={book.id}
                  href={`/books/${book.slug}`}
                  className="group block space-y-2"
                >
                  <BookCover
                    src={book.coverUrl}
                    alt={book.title}
                    focalPoint={book.coverFocalPoint}
                  />
                  <div>
                    <h3 className="text-[15px] font-semibold font-editorial line-clamp-2">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {book.author}
                      </p>
                    )}
                    <p
                      className="text-[11.5px] mt-0.5 tabular-nums"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {completedCount > 0
                        ? `${completedCount} / ${book.episodes.length} tập đã nghe`
                        : `${book.episodes.length} tập`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bookmarked Episodes */}
      {savedEpisodes.length > 0 && (
        <section aria-label="Tập truyện đã lưu">
          <div className="flex items-baseline justify-between mb-2.5">
            <h2 className="text-[16px] font-semibold font-editorial">Đã đánh dấu</h2>
            <Link
              href="/saved"
              style={{ color: 'var(--accent-primary)' }}
              className="text-xs font-medium"
            >
              Xem tất cả
            </Link>
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] divide-y divide-[var(--border-hairline)]"
          >
            {savedEpisodes.map((item) => (
              <Link
                key={item.episodeId}
                href={`/episodes/${item.episodeId}`}
                className="px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.bookTitle} · Tập {item.code}
                  </p>
                  <p className="text-sm font-medium font-editorial truncate">{item.title}</p>
                </div>
                <span
                  style={{ color: 'var(--accent-berry)' }}
                  className="shrink-0 flex items-center gap-1.5 text-xs tabular-nums"
                >
                  <span>{item.durationLabel}</span>
                  <BookmarkIcon size={14} filled />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
