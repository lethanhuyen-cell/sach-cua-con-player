'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/BookCover';
import { StorybookHeroStage } from '@/components/StorybookHeroStage';
import {
  ChevronLeftIcon,
  CloseIcon,
  MoonIcon,
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
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';

function normalizeSearch(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .trim();
}

export default function BooksShelfPage() {
  const {
    books,
    isNight,
    toggleNight,
    progressMap,
    readingProgressMap,
    isEpisodeNew,
    playEpisode
  } = useLibraryPlayer();
  const [query, setQuery] = useState('');
  const [selectedHallSlug, setSelectedHallSlug] = useState<LibraryHallSlug | 'ALL'>('ALL');

  const activeHalls = useMemo(
    () =>
      LIBRARY_HALLS.filter((hall) =>
        books.some((b) => resolveBookHalls(b).some((bh) => bh.slug === hall.slug))
      ),
    [books]
  );

  const normalizedQuery = normalizeSearch(query);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      if (
        selectedHallSlug !== 'ALL' &&
        !resolveBookHalls(book).some((h) => h.slug === selectedHallSlug)
      ) {
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
  }, [books, normalizedQuery, selectedHallSlug]);

  const matchedEpisodes = useMemo(() => {
    if (!normalizedQuery) return [];
    const matches: {
      book: (typeof books)[number];
      episode: (typeof books)[number]['episodes'][number];
    }[] = [];
    for (const book of books) {
      if (
        selectedHallSlug !== 'ALL' &&
        !resolveBookHalls(book).some((h) => h.slug === selectedHallSlug)
      ) {
        continue;
      }
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
  }, [books, normalizedQuery, selectedHallSlug]);

  const washBg = isNight ? BOOK_PRESETS.moss.nightWash : BOOK_PRESETS.moss.dayWash;

  return (
    <div className="pb-6">
      {/* Sticky 44px Header with direct 1-tap Home exit */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[44px] px-3.5 flex items-center justify-between gap-2"
      >
        <Link
          href="/"
          style={{ color: 'var(--accent-primary)' }}
          className="h-9 inline-flex items-center gap-1 text-xs font-semibold"
        >
          <ChevronLeftIcon size={16} />
          <span>Sảnh sách</span>
        </Link>
        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Giao diện ban ngày' : 'Giao diện ban đêm'}
          style={{ color: 'var(--text-primary)' }}
          className="w-9 h-9 rounded-[7px] flex items-center justify-center shrink-0"
        >
          {isNight ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>
      </header>

      <StorybookHeroStage
        src={isNight ? FOYER_HERO_ART.night : FOYER_HERO_ART.day}
        alt="Tủ sách Thư viện Đồi Mơ"
        washBg={washBg}
        roundedClass="rounded-[12px]"
      >
        <div className="flex items-baseline justify-between gap-2 px-0.5">
          <h1 className="text-[20px] font-bold font-editorial leading-snug">Tủ sách</h1>
          <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            {books.length} bộ sách đã xuất bản
          </span>
        </div>
      </StorybookHeroStage>

      <div className="px-4 pt-4 space-y-5">
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

      {/* Hall Filter Pills */}
      {activeHalls.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            type="button"
            onClick={() => setSelectedHallSlug('ALL')}
            style={{
              backgroundColor:
                selectedHallSlug === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-surface)',
              color:
                selectedHallSlug === 'ALL' ? 'var(--accent-primary-fg)' : 'var(--text-secondary)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
          >
            Tất cả
          </button>
          {activeHalls.map((hall) => {
            const active = selectedHallSlug === hall.slug;
            return (
              <button
                key={hall.slug}
                type="button"
                onClick={() => setSelectedHallSlug(hall.slug)}
                style={{
                  backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: active ? 'var(--accent-primary-fg)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-9 px-3.5 rounded-[8px] text-xs font-medium shrink-0"
              >
                {hall.shortTitle}
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
              setSelectedHallSlug('ALL');
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
            const isAudioBook = book.episodes.some((ep) => !isEpisodeReadingOnly(ep));
            const completedAudioCount = book.episodes.filter(
              (ep) => progressMap[ep.id]?.completed
            ).length;
            const completedReadCount = book.episodes.filter(
              (ep) => readingProgressMap[ep.id]?.completed
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
                    {formatBookDisplayGenre(book)} · {book.ageRange}
                  </span>
                  <h2 className="text-[15px] font-semibold font-editorial line-clamp-2 mt-0.5">
                    {book.title}
                  </h2>
                  <p
                    className="text-xs mt-0.5 tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {isAudioBook
                      ? completedAudioCount > 0
                        ? `${completedAudioCount} / ${book.episodes.length} tập đã nghe`
                        : `${book.episodes.length} tập`
                      : completedReadCount > 0
                        ? `${completedReadCount} / ${book.episodes.length} tập đã đọc`
                        : `${book.episodes.length} tập · Đọc chữ`}
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
                    {getEpisodeDurationLabel(episode, { prefixTextOnly: true })}
                  </p>
                </Link>
                {!isEpisodeReadingOnly(episode) && (
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
    </div>
  );
}
