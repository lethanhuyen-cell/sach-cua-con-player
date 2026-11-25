'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/BookCover';
import { CloseIcon, MoonIcon, PlayIcon, SearchIcon, SunIcon } from '@/components/Icons';
import { estimateReadingMinutes, formatDurationShort } from '@/lib/presets';

function normalizeSearch(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .trim();
}

export default function BooksShelfPage() {
  const { books, isNight, toggleNight, progressMap, isEpisodeNew, playEpisode } =
    useLibraryPlayer();
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('ALL');

  const genres = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.genreTag) set.add(b.genreTag);
    });
    return Array.from(set);
  }, [books]);

  const normalizedQuery = normalizeSearch(query);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (selectedGenre !== 'ALL' && book.genreTag !== selectedGenre) {
        return false;
      }
      if (!normalizedQuery) return true;
      const inBook =
        normalizeSearch(book.title).includes(normalizedQuery) ||
        normalizeSearch(book.subtitle).includes(normalizedQuery) ||
        normalizeSearch(book.author).includes(normalizedQuery);
      const inEpisodes = book.episodes.some((ep) =>
        normalizeSearch(ep.title).includes(normalizedQuery)
      );
      return inBook || inEpisodes;
    });
  }, [books, normalizedQuery, selectedGenre]);

  const matchedEpisodes = useMemo(() => {
    if (!normalizedQuery) return [];
    const matches: {
      book: (typeof books)[number];
      episode: (typeof books)[number]['episodes'][number];
    }[] = [];
    for (const book of books) {
      if (selectedGenre !== 'ALL' && book.genreTag !== selectedGenre) continue;
      for (const ep of book.episodes) {
        if (
          normalizeSearch(ep.title).includes(normalizedQuery) ||
          normalizeSearch(ep.episodeCode).includes(normalizedQuery)
        ) {
          matches.push({ book, episode: ep });
        }
      }
    }
    return matches.slice(0, 8);
  }, [books, normalizedQuery, selectedGenre]);

  return (
    <div className="px-4 pt-3 pb-6 space-y-5">
      {/* Header */}
      <header
        style={{ borderBottom: '1px solid var(--border-hairline)' }}
        className="pb-3 flex items-center justify-between"
      >
        <div>
          <h1 className="text-[21px] font-bold font-editorial">Tủ sách</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {books.length} bộ sách đã xuất bản
          </p>
        </div>
        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Giao diện ban ngày' : 'Giao diện ban đêm'}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)'
          }}
          className="w-11 h-11 rounded-[8px] flex items-center justify-center"
        >
          {isNight ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>
      </header>

      {/* Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="h-11 px-3.5 rounded-[8px] flex items-center gap-2.5"
      >
        <SearchIcon size={16} className="shrink-0 opacity-70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên bộ sách hoặc tên tập truyện..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {query && (
          <button
            type="button"
            aria-label="Xóa từ khóa"
            onClick={() => setQuery('')}
            className="w-8 h-8 flex items-center justify-center opacity-70"
          >
            <CloseIcon size={15} />
          </button>
        )}
      </div>

      {/* Genre Filter Pills */}
      {genres.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedGenre('ALL')}
            style={{
              backgroundColor:
                selectedGenre === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color:
                selectedGenre === 'ALL' ? 'var(--accent-primary-fg)' : 'var(--text-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
          >
            Tất cả
          </button>
          {genres.map((g) => {
            const active = selectedGenre === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGenre(g)}
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? 'var(--accent-primary-fg)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
              >
                {g}
              </button>
            );
          })}
        </div>
      )}

      {/* Empty Search Result */}
      {filteredBooks.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)'
          }}
          className="rounded-[10px] p-6 text-center space-y-2"
        >
          <p className="text-sm font-editorial">
            Không tìm thấy bộ sách hoặc tập truyện nào khớp với &ldquo;{query}&rdquo;.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedGenre('ALL');
            }}
            style={{ color: 'var(--accent-primary)' }}
            className="text-xs font-semibold underline"
          >
            Hiển thị lại toàn bộ tủ sách
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const completedCount = book.episodes.filter(
              (ep) => progressMap[ep.id]?.completed
            ).length;
            const unreadNewEps = book.episodes.filter((ep) => isEpisodeNew(ep));
            const latestNewEp =
              unreadNewEps.length > 0 ? unreadNewEps[unreadNewEps.length - 1] : null;
            return (
              <Link
                key={book.id}
                href={`/books/${book.slug}`}
                className="block space-y-2"
              >
                <BookCover
                  src={book.coverUrl}
                  alt={book.title}
                  focalPoint={book.coverFocalPoint}
                />
                <div>
                  <span
                    className="vn-eyebrow block truncate"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {book.genreTag} · {book.ageRange}
                  </span>
                  <h2 className="text-[15px] font-semibold font-editorial line-clamp-2 mt-0.5">
                    {book.title}
                  </h2>
                  <p
                    className="text-xs mt-0.5 tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {completedCount > 0
                      ? `${completedCount} / ${book.episodes.length} tập đã nghe`
                      : `${book.episodes.length} tập`}
                  </p>
                  {latestNewEp && (
                    <p
                      className="text-[11.5px] font-medium mt-0.5 truncate tabular-nums"
                      style={{ color: 'var(--accent-warm)' }}
                    >
                      {unreadNewEps.length > 1
                        ? `${unreadNewEps.length} tập mới · Tập ${latestNewEp.episodeCode}`
                        : `Mới: Tập ${latestNewEp.episodeCode}`}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Matching Episodes Section when searching */}
      {matchedEpisodes.length > 0 && (
        <section className="pt-2 space-y-2.5">
          <h3 className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
            Tập truyện khớp từ khóa ({matchedEpisodes.length})
          </h3>
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] divide-y divide-[var(--border-hairline)]"
          >
            {matchedEpisodes.map(({ book, episode }) => (
              <div
                key={episode.id}
                className="px-3.5 py-2.5 flex items-center justify-between gap-3"
              >
                <Link href={`/episodes/${episode.id}`} className="min-w-0 flex-1">
                  <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {book.title} · Tập {episode.episodeCode}
                  </p>
                  <p className="text-sm font-semibold font-editorial truncate">{episode.title}</p>
                  <p className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {episode.isTextOnly
                      ? `Chỉ đọc chữ · ${estimateReadingMinutes(episode.wordCount)}`
                      : formatDurationShort(episode.audioTracks[0]?.durationSeconds || 0)}
                  </p>
                </Link>
                {!episode.isTextOnly && episode.audioTracks.length > 0 && (
                  <button
                    type="button"
                    aria-label={`Phát ${episode.title}`}
                    onClick={() => playEpisode(book, episode)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--accent-primary)'
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  >
                    <PlayIcon size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
