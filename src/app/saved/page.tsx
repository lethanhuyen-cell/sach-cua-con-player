'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from '@/components/ui/BookCover';
import { LibraryWayfinder } from '@/components/layout/LibraryWayfinder';
import {
  BookmarkIcon,
  BookOpenIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SunIcon
} from '@/components/ui/Icons';
import {
  estimateReadingMinutes,
  formatClock,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';

export default function SavedArchivePage() {
  const {
    books,
    isNight,
    toggleNight,
    favorites,
    toggleFavorite,
    continueItems,
    activeEpisode,
    isPlaying,
    playEpisode
  } = useLibraryPlayer();

  const [tab, setTab] = useState<'continue' | 'saved'>('continue');

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

  return (
    <div className="pb-6">
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[48px] md:h-[54px] px-2.5 sm:px-3.5 md:px-6 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="shelf" shelfBranch="saved" />
        <button
          type="button"
          onClick={toggleNight}
          aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
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

      <div className="px-4 md:px-6 pt-3.5 md:pt-4 space-y-4 max-w-[700px] mx-auto w-full">
        <div>
          <h1 className="text-[18px] font-bold font-editorial">Lưu trữ</h1>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Tiến độ đọc, nghe và các tập đánh dấu trên thiết bị này
          </p>
        </div>

      {/* Segmented Tabs */}
      <div
        role="tablist"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)'
        }}
        className="grid grid-cols-2 rounded-[8px] p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'continue'}
          onClick={() => setTab('continue')}
          style={{
            backgroundColor: tab === 'continue' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'continue' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 rounded-[6px] text-xs font-semibold transition"
        >
          Đang nghe ({continueItems.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'saved'}
          onClick={() => setTab('saved')}
          style={{
            backgroundColor: tab === 'saved' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'saved' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 rounded-[6px] text-xs font-semibold transition"
        >
          Đã đánh dấu ({savedList.length})
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'continue' ? (
        continueItems.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="rounded-[10px] p-6 text-center space-y-2"
          >
            <p className="text-sm font-editorial">
              Chưa có tập nào đang nghe dở trên thiết bị này.
            </p>
            <Link
              href="/books"
              style={{ color: 'var(--accent-primary)' }}
              className="inline-block text-xs font-semibold underline"
            >
              Khám phá Tủ sách gia đình
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {continueItems.map((item) => {
              const playing =
                item.mode === 'audio' &&
                activeEpisode?.id === item.episode.id &&
                isPlaying;
              const pct =
                item.mode === 'reading'
                  ? item.scrollPercent
                  : item.durationSeconds > 0
                    ? Math.min(
                        100,
                        Math.round((item.progressSeconds / item.durationSeconds) * 100)
                      )
                    : 0;
              return (
                <div
                  key={`${item.mode}-${item.episode.id}`}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="rounded-[10px] p-2.5 flex items-center gap-2.5"
                >
                  <Link href={`/episodes/${item.episode.id}`} className="w-11 shrink-0">
                    <BookCover
                      src={item.episode.effectiveCoverUrl}
                      alt={item.episode.title}
                      focalPoint={item.book.coverFocalPoint}
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span
                      className="vn-eyebrow block truncate"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {item.mode === 'reading'
                        ? item.kind === 'in_progress'
                          ? 'Đọc tiếp'
                          : 'Gợi ý đọc kế'
                        : item.kind === 'in_progress'
                          ? 'Nghe tiếp'
                          : 'Gợi ý tập kế'}{' '}
                      · {item.book.title}
                    </span>
                    <Link href={`/episodes/${item.episode.id}`}>
                      <h2 className="text-sm font-semibold font-editorial truncate mt-0.5">
                        Tập {item.episode.episodeCode}: {item.episode.title}
                      </h2>
                    </Link>
                    {item.mode === 'reading' ? (
                      <p
                        className="text-xs mt-1 tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.kind === 'in_progress'
                          ? `Đã đọc ${pct}% · ${estimateReadingMinutes(item.episode.wordCount)}`
                          : estimateReadingMinutes(item.episode.wordCount)}
                      </p>
                    ) : item.kind === 'in_progress' ? (
                      <p
                        className="text-xs mt-1 tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {formatClock(item.progressSeconds)} /{' '}
                        {formatClock(item.durationSeconds)} ({pct}%)
                      </p>
                    ) : (
                      <p
                        className="text-xs mt-1 tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {getEpisodeDurationLabel(item.episode, {
                          preferredDurationSeconds: item.durationSeconds
                        })}
                      </p>
                    )}
                  </div>
                  {item.mode === 'audio' && !isEpisodeReadingOnly(item.episode) ? (
                    <button
                      type="button"
                      aria-label={playing ? 'Tạm dừng' : 'Phát tiếp'}
                      onClick={() => playEpisode(item.book, item.episode)}
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary-fg)'
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    >
                      {playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                    </button>
                  ) : (
                    <Link
                      href={`/episodes/${item.episode.id}`}
                      aria-label={`Đọc tiếp ${item.episode.title}`}
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary-fg)'
                      }}
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    >
                      <BookOpenIcon size={14} />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : savedList.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--text-secondary)'
          }}
          className="rounded-[10px] p-6 text-center space-y-2"
        >
          <p className="text-sm font-editorial">
            Bạn có thể chạm biểu tượng đánh dấu ở mục lục sách hoặc trình phát để lưu tập yêu thích của bé.
          </p>
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
                className="rounded-[10px] p-2.5 flex items-center gap-2.5"
              >
                <Link href={`/episodes/${episode.id}`} className="w-11 shrink-0">
                  <BookCover
                    src={episode.effectiveCoverUrl}
                    alt={episode.title}
                    focalPoint={book.coverFocalPoint}
                  />
                </Link>
                <Link href={`/episodes/${episode.id}`} className="flex-1 min-w-0">
                  <p
                    className="text-[11px] truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {book.title} · Tập {episode.episodeCode}
                  </p>
                  <h2 className="text-sm font-semibold font-editorial line-clamp-2">
                    {episode.title}
                  </h2>
                  <p
                    className="text-xs mt-0.5 tabular-nums"
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
                      className="w-9 h-9 rounded-full flex items-center justify-center"
                    >
                      {playing ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Bỏ đánh dấu"
                    onClick={() => toggleFavorite(episode.id)}
                    style={{ color: 'var(--accent-berry)' }}
                    className="w-9 h-9 flex items-center justify-center"
                  >
                    <BookmarkIcon size={16} filled />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Subtle iOS Safari PWA Persistence Note (LIS-009) */}
      <aside
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          color: 'var(--text-secondary)'
        }}
        className="rounded-[10px] p-3.5 text-xs leading-relaxed"
      >
        <strong style={{ color: 'var(--text-primary)' }}>Mẹo nhỏ trên iPhone / iPad:</strong>{' '}
        Chọn <em>Chia sẻ &rarr; Thêm vào Màn hình chính</em> để mở Thư viện Đồi Mơ như ứng dụng riêng và giữ lịch sử nghe lâu dài không bị trình duyệt tự dọn sau 7 ngày.
      </aside>
      </div>
    </div>
  );
}
