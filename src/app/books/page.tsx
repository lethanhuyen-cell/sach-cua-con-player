'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/ui/BookCover';
import { StorybookHeroStage } from '@/components/ui/StorybookHeroStage';
import { LibraryWayfinder } from '@/components/layout/LibraryWayfinder';
import {
  CloseIcon,
  MoonIcon,
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
import {
  BOOK_PRESETS,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';
import {
  AUDIENCE_FILTER_PILLS,
  AudienceFilterKey,
  matchesAudienceFilter,
  matchesBookKnowledgeQuery,
  matchesEpisodeKnowledgeQuery
} from '@/lib/knowledge';

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
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilterKey>('ALL');

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
      if (!matchesAudienceFilter(book, audienceFilter)) return false;
      if (
        selectedHallSlug !== 'ALL' &&
        !resolveBookHalls(book).some((h) => h.slug === selectedHallSlug)
      ) {
        return false;
      }
      if (!normalizedQuery) return true;
      return matchesBookKnowledgeQuery(book, normalizedQuery);
    });
  }, [books, audienceFilter, normalizedQuery, selectedHallSlug]);

  const matchedEpisodes = useMemo(() => {
    if (!normalizedQuery) return [];
    const matches: {
      book: (typeof books)[number];
      episode: (typeof books)[number]['episodes'][number];
    }[] = [];
    for (const book of books) {
      if (!matchesAudienceFilter(book, audienceFilter)) continue;
      if (
        selectedHallSlug !== 'ALL' &&
        !resolveBookHalls(book).some((h) => h.slug === selectedHallSlug)
      ) {
        continue;
      }
      for (const ep of book.episodes) {
        if (matchesEpisodeKnowledgeQuery(ep, normalizedQuery)) {
          matches.push({ book, episode: ep });
        }
      }
    }
    return matches.slice(0, 10);
  }, [books, audienceFilter, normalizedQuery, selectedHallSlug]);

  const washBg = isNight ? BOOK_PRESETS.moss.nightWash : BOOK_PRESETS.moss.dayWash;

  return (
    <div className="pb-6">
      {/* Compact Sticky Pinned Wayfinder (48px Mobile / 54px Desktop) */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[48px] md:h-[54px] px-2.5 sm:px-3.5 md:px-6 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="shelf" shelfBranch="all_books" />
        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Giao diện ban ngày' : 'Giao diện ban đêm'}
          style={{ color: 'var(--text-primary)' }}
          className="w-[34px] h-[34px] md:w-[36px] md:h-[36px] rounded-[8px] hover:bg-[var(--bg-surface)] flex items-center justify-center shrink-0 transition"
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
      </header>

      <div className="md:grid md:grid-cols-[212px_1fr] lg:grid-cols-[232px_1fr] md:gap-6 md:px-6 md:pt-4 md:items-start">
        <div className="md:sticky md:top-[68px]">
          <StorybookHeroStage
            src={isNight ? FOYER_HERO_ART.night : FOYER_HERO_ART.day}
            alt="Tủ sách Thư viện Đồi Mơ"
            washBg={washBg}
            variant="immersive"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h1 className="text-[17px] font-bold font-editorial leading-snug">Tủ sách</h1>
              <span className="text-[11.5px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                {books.length} bộ
              </span>
            </div>
          </StorybookHeroStage>
        </div>

        <div className="px-3.5 md:px-0 pt-3.5 md:pt-0 space-y-3.5 min-w-0">
        {/* Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="h-9 px-3 rounded-[8px] flex items-center gap-2"
      >
        <SearchIcon size={14} className="shrink-0 opacity-70" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tên sách, tập, chủ đề hoặc khái niệm..."
          className="flex-1 bg-transparent outline-none text-xs"
        />
        {query && (
          <button
            type="button"
            aria-label="Xóa từ khóa"
            onClick={() => setQuery('')}
            className="w-7 h-7 flex items-center justify-center opacity-70"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* Audience Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {AUDIENCE_FILTER_PILLS.map((pill) => {
          const active = audienceFilter === pill.key;
          return (
            <button
              key={pill.key}
              type="button"
              onClick={() => setAudienceFilter(pill.key)}
              style={{
                backgroundColor: active ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                border: active
                  ? '1.5px solid var(--accent-primary)'
                  : '1px solid var(--border-hairline)'
              }}
              className="h-7 px-2.5 rounded-full text-[11.5px] font-medium shrink-0"
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Hall Filter Pills */}
      {activeHalls.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
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
            className="h-7 px-2.5 rounded-[7px] text-[11.5px] font-medium shrink-0"
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
                className="h-7 px-2.5 rounded-[7px] text-[11.5px] font-medium shrink-0"
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
              setAudienceFilter('ALL');
            }}
            style={{ color: 'var(--accent-primary)' }}
            className="text-xs font-semibold underline"
          >
            Hiển thị lại toàn bộ tủ sách
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-3.5">
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
                className="block space-y-1.5"
              >
                <BookCover
                  src={book.coverUrl}
                  alt={book.title}
                  focalPoint={book.coverFocalPoint}
                />
                <div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.05em] block truncate"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    {formatBookDisplayGenre(book)} · {book.ageRange}
                  </span>
                  <h2 className="text-[13.5px] md:text-[14px] font-semibold font-editorial line-clamp-2 mt-0.5">
                    {book.title}
                  </h2>
                  <p
                    className="text-[11px] mt-0.5 tabular-nums truncate"
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
                      className="text-[10.5px] font-medium mt-0.5 truncate tabular-nums"
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
    </div>
  );
}
