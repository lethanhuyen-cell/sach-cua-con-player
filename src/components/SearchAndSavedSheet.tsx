'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import {
  BookmarkIcon,
  CloseIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon
} from './Icons';
import {
  formatClock,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';
import {
  formatBookDisplayGenre,
  LIBRARY_HALLS,
  LibraryHallSlug,
  resolveBookHalls
} from '@/lib/halls';

function normalizeSearch(s: string): string {
  return s.normalize('NFC').toLowerCase().trim();
}

export function SearchAndSavedSheet() {
  const {
    books,
    favorites,
    toggleFavorite,
    continueItems,
    activeEpisode,
    isPlaying,
    playEpisode,
    utilitySheetTab,
    openUtilitySheet,
    closeUtilitySheet
  } = useLibraryPlayer();

  const [query, setQuery] = useState('');
  const [selectedHallSlug, setSelectedHallSlug] = useState<LibraryHallSlug | 'ALL'>('ALL');

  useEffect(() => {
    if (!utilitySheetTab) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeUtilitySheet();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeUtilitySheet, utilitySheetTab]);

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
      const inEps = book.episodes.some(
        (ep) =>
          normalizeSearch(ep.title).includes(normalizedQuery) ||
          normalizeSearch(ep.episodeCode).includes(normalizedQuery)
      );
      return inBook || inEps;
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
    return matches.slice(0, 12);
  }, [books, normalizedQuery, selectedHallSlug]);

  const savedList = useMemo(() => {
    const items: {
      book: (typeof books)[number];
      episode: (typeof books)[number]['episodes'][number];
    }[] = [];
    for (const book of books) {
      for (const ep of book.episodes) {
        if (favorites.includes(ep.id)) {
          items.push({ book, episode: ep });
        }
      }
    }
    return items;
  }, [books, favorites]);

  if (!utilitySheetTab) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm và Tủ đã lưu"
      className="fixed inset-0 z-40 flex flex-col justify-end max-w-[480px] mx-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeUtilitySheet}
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
      />

      {/* Drawer Surface */}
      <div
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderTop: '1px solid var(--border-hairline)',
          color: 'var(--text-primary)'
        }}
        className="relative z-10 rounded-t-[16px] max-h-[84vh] flex flex-col shadow-lg pb-[env(safe-area-inset-bottom)]"
      >
        {/* Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div
            style={{ backgroundColor: 'var(--border-hairline)' }}
            className="w-10 h-1 rounded-full"
          />
        </div>

        {/* Segmented Control & Close */}
        <div
          style={{ borderBottom: '1px solid var(--border-hairline)' }}
          className="px-4 pb-3 pt-1 flex items-center justify-between gap-2.5"
        >
          <div
            role="tablist"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="flex-1 grid grid-cols-2 rounded-[9px] p-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={utilitySheetTab === 'search'}
              onClick={() => openUtilitySheet('search')}
              style={{
                backgroundColor:
                  utilitySheetTab === 'search' ? 'var(--bg-elevated)' : 'transparent',
                color:
                  utilitySheetTab === 'search'
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)'
              }}
              className="h-9 rounded-[7px] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
            >
              <SearchIcon size={14} />
              <span>Tìm kiếm</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={utilitySheetTab === 'saved'}
              onClick={() => openUtilitySheet('saved')}
              style={{
                backgroundColor:
                  utilitySheetTab === 'saved' ? 'var(--bg-elevated)' : 'transparent',
                color:
                  utilitySheetTab === 'saved'
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)'
              }}
              className="h-9 rounded-[7px] text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition tabular-nums"
            >
              <BookmarkIcon size={14} filled={utilitySheetTab === 'saved'} />
              <span>Đã lưu ({savedList.length})</span>
            </button>
          </div>

          <button
            type="button"
            aria-label="Đóng ngăn tìm kiếm và đã lưu"
            onClick={closeUtilitySheet}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-primary)'
            }}
            className="w-11 h-11 rounded-[9px] flex items-center justify-center shrink-0"
          >
            <CloseIcon size={17} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {utilitySheetTab === 'search' ? (
            <>
              {/* Search Input */}
              <div
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-11 px-3.5 rounded-[9px] flex items-center gap-2.5"
              >
                <SearchIcon size={16} className="shrink-0 opacity-65" />
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tên sách, số tập hoặc tên tập..."
                  className="flex-1 bg-transparent outline-none text-sm min-w-0"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Xóa từ khóa"
                    onClick={() => setQuery('')}
                    className="w-8 h-8 flex items-center justify-center opacity-70"
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>

              {/* Hall Filter Pills */}
              {activeHalls.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  <button
                    type="button"
                    onClick={() => setSelectedHallSlug('ALL')}
                    style={{
                      backgroundColor:
                        selectedHallSlug === 'ALL'
                          ? 'var(--accent-primary)'
                          : 'var(--bg-surface)',
                      color:
                        selectedHallSlug === 'ALL'
                          ? 'var(--accent-primary-fg)'
                          : 'var(--text-secondary)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="h-9 px-3 rounded-[8px] text-xs font-medium shrink-0"
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
                          backgroundColor: active
                            ? 'var(--accent-primary)'
                            : 'var(--bg-surface)',
                          color: active
                            ? 'var(--accent-primary-fg)'
                            : 'var(--text-secondary)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="h-9 px-3 rounded-[8px] text-xs font-medium shrink-0"
                      >
                        {hall.shortTitle}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Matching Episodes */}
              {matchedEpisodes.length > 0 && (
                <section className="space-y-2">
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
                    {matchedEpisodes.map(({ book, episode }) => {
                      const playing = activeEpisode?.id === episode.id && isPlaying;
                      return (
                        <div
                          key={episode.id}
                          className="px-3 py-2.5 flex items-center justify-between gap-2.5"
                        >
                          <Link
                            href={`/episodes/${episode.id}`}
                            onClick={closeUtilitySheet}
                            className="min-w-0 flex-1"
                          >
                            <p
                              className="text-[11px] truncate"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {book.title} · Tập {episode.episodeCode}
                            </p>
                            <p className="text-sm font-semibold font-editorial truncate">
                              {episode.title}
                            </p>
                            <p
                              className="text-[11.5px] tabular-nums"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {getEpisodeDurationLabel(episode, { prefixTextOnly: true })}
                            </p>
                          </Link>

                          {!isEpisodeReadingOnly(episode) && (
                            <button
                              type="button"
                              aria-label={playing ? `Tạm dừng ${episode.title}` : `Nghe ${episode.title}`}
                              onClick={() => playEpisode(book, episode)}
                              style={{
                                backgroundColor: playing
                                  ? 'var(--accent-primary)'
                                  : 'var(--bg-surface)',
                                color: playing
                                  ? 'var(--accent-primary-fg)'
                                  : 'var(--accent-primary)',
                                border: '1px solid var(--border-hairline)'
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            >
                              {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Matching Books */}
              <section className="space-y-2.5">
                <h3 className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                  Bộ sách ({filteredBooks.length})
                </h3>
                {filteredBooks.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-secondary)'
                    }}
                    className="rounded-[10px] p-5 text-center text-xs font-editorial"
                  >
                    Không tìm thấy bộ sách hay tập truyện nào khớp từ khóa &ldquo;{query}&rdquo;.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredBooks.map((book) => (
                      <Link
                        key={book.id}
                        href={`/books/${book.slug}`}
                        onClick={closeUtilitySheet}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="rounded-[10px] p-2.5 flex items-center gap-3"
                      >
                        <div className="w-11 shrink-0">
                          <BookCover
                            src={book.coverUrl}
                            alt={book.title}
                            focalPoint={book.coverFocalPoint}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold font-editorial truncate">
                            {book.title}
                          </h4>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {book.author || formatBookDisplayGenre(book)} · {book.episodes.length} tập
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              {/* Continue Items Summary */}
              {continueItems.length > 0 && (
                <section className="space-y-2">
                  <h3 className="vn-eyebrow" style={{ color: 'var(--accent-primary)' }}>
                    Đang đọc &amp; nghe gần đây
                  </h3>
                  <div className="space-y-2">
                    {continueItems.map((item) => {
                      const playing = activeEpisode?.id === item.episode.id && isPlaying;
                      const isReading = item.mode === 'reading';
                      return (
                        <div
                          key={`${item.mode}-${item.episode.id}`}
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="rounded-[10px] p-2.5 flex items-center gap-3"
                        >
                          <Link
                            href={`/episodes/${item.episode.id}`}
                            onClick={closeUtilitySheet}
                            className="w-11 shrink-0"
                          >
                            <BookCover
                              src={item.episode.effectiveCoverUrl}
                              alt={item.episode.title}
                              focalPoint={item.book.coverFocalPoint}
                            />
                          </Link>
                          <Link
                            href={`/episodes/${item.episode.id}`}
                            onClick={closeUtilitySheet}
                            className="flex-1 min-w-0"
                          >
                            <p
                              className="text-[11px] truncate"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {item.book.title} · Tập {item.episode.episodeCode}
                            </p>
                            <p className="text-sm font-semibold font-editorial truncate">
                              {item.episode.title}
                            </p>
                            <p
                              className="text-[11.5px] tabular-nums"
                              style={{ color: 'var(--accent-warm)' }}
                            >
                              {isReading
                                ? item.kind === 'next_up'
                                  ? 'Gợi ý đọc tập kế tiếp'
                                  : `Đang đọc · ${item.scrollPercent}%`
                                : item.kind === 'next_up'
                                  ? 'Gợi ý nghe tập kế tiếp'
                                  : `${formatClock(item.progressSeconds)} / ${formatClock(
                                      item.durationSeconds
                                    )}`}
                            </p>
                          </Link>
                          {!isEpisodeReadingOnly(item.episode) && (
                            <button
                              type="button"
                              aria-label={playing ? 'Tạm dừng' : 'Nghe tiếp'}
                              onClick={() => playEpisode(item.book, item.episode)}
                              style={{
                                backgroundColor: 'var(--accent-primary)',
                                color: 'var(--accent-primary-fg)'
                              }}
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            >
                              {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Bookmarked Episodes */}
              <section className="space-y-2">
                <h3 className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                  Tập truyện đã đánh dấu ({savedList.length})
                </h3>
                {savedList.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-secondary)'
                    }}
                    className="rounded-[10px] p-5 text-center text-xs font-editorial leading-relaxed"
                  >
                    Chạm biểu tượng đánh dấu ở mục lục bộ sách hoặc trình phát để lưu tập yêu thích của bé.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {savedList.map(({ book, episode }) => {
                      const playing = activeEpisode?.id === episode.id && isPlaying;
                      return (
                        <div
                          key={episode.id}
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="rounded-[10px] p-2.5 flex items-center gap-3"
                        >
                          <Link
                            href={`/episodes/${episode.id}`}
                            onClick={closeUtilitySheet}
                            className="w-11 shrink-0"
                          >
                            <BookCover
                              src={episode.effectiveCoverUrl}
                              alt={episode.title}
                              focalPoint={book.coverFocalPoint}
                            />
                          </Link>
                          <Link
                            href={`/episodes/${episode.id}`}
                            onClick={closeUtilitySheet}
                            className="flex-1 min-w-0"
                          >
                            <p
                              className="text-[11px] truncate"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {book.title} · Tập {episode.episodeCode}
                            </p>
                            <p className="text-sm font-semibold font-editorial truncate">
                              {episode.title}
                            </p>
                            <p
                              className="text-[11.5px] tabular-nums"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {getEpisodeDurationLabel(episode, { prefixTextOnly: true })}
                            </p>
                          </Link>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isEpisodeReadingOnly(episode) && (
                              <button
                                type="button"
                                aria-label="Phát tập đã lưu"
                                onClick={() => playEpisode(book, episode)}
                                style={{
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-hairline)',
                                  color: 'var(--accent-primary)'
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                              >
                                {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                              </button>
                            )}
                            <button
                              type="button"
                              aria-label="Bỏ đánh dấu"
                              onClick={() => toggleFavorite(episode.id)}
                              style={{ color: 'var(--accent-berry)' }}
                              className="w-10 h-10 flex items-center justify-center"
                            >
                              <BookmarkIcon size={17} filled />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* iOS Safari Persistence Hint */}
              <aside
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-secondary)'
                }}
                className="rounded-[10px] p-3 text-xs leading-relaxed"
              >
                <strong style={{ color: 'var(--text-primary)' }}>Mẹo nhỏ trên iPhone / iPad:</strong>{' '}
                Chọn <em>Chia sẻ &rarr; Thêm vào Màn hình chính</em> để mở Thư viện Đồi Mơ như ứng dụng riêng và giữ lịch sử đọc, nghe lâu dài.
              </aside>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
