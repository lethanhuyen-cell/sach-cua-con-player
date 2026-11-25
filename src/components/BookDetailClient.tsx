'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { HydratedBook, HydratedEpisode, VoiceProfile } from '@/lib/types';
import {
  BOOK_PRESETS,
  estimateReadingMinutes,
  focalPointClass,
  formatDurationShort
} from '@/lib/presets';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
  MicIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SunIcon
} from './Icons';

const CHUNK_SIZE = 20;

interface CollectionGroup {
  key: string;
  label: string;
  episodes: HydratedEpisode[];
}

export function BookDetailClient({ book }: { book: HydratedBook }) {
  const {
    isNight,
    toggleNight,
    favorites,
    toggleFavorite,
    progressMap,
    isEpisodeNew,
    preferredVoiceKey,
    selectVoicePreference,
    activeEpisode,
    activeTrack,
    isPlaying,
    playEpisode
  } = useLibraryPlayer();

  const [showIntro, setShowIntro] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'none' | 'new' | 'saved'>('none');
  const [activeCollectionKey, setActiveCollectionKey] = useState<string>('ALL');
  const [chunkIndex, setChunkIndex] = useState<number>(0);

  const preset = BOOK_PRESETS[book.themePreset] || BOOK_PRESETS.moss;
  const washBg = isNight ? preset.nightWash : preset.dayWash;
  const accentColor = isNight ? preset.nightAccent : preset.dayAccent;
  const accentTextOnSolid = isNight ? '#111613' : '#F8F5EE';

  // Available Voice Profiles across this book
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

  // Determine TOC mode: explicit book.tocMode ('thematic' | 'sequential')
  const isThematicMode = (book.tocMode || 'thematic') === 'thematic';

  // Build thematic collections from Parts (if defined) or distinct episode categoryTags
  const collections = useMemo<CollectionGroup[]>(() => {
    if (!isThematicMode) return [];

    if (book.parts.length > 0) {
      return book.parts
        .map((part) => ({
          key: `part:${part.id}`,
          label: part.title,
          episodes: book.episodes.filter((ep) => ep.partId === part.id)
        }))
        .filter((g) => g.episodes.length > 0);
    }

    const catMap = new Map<string, HydratedEpisode[]>();
    for (const ep of book.episodes) {
      const cat = (ep.categoryTag || 'Chung').trim();
      const arr = catMap.get(cat) || [];
      arr.push(ep);
      catMap.set(cat, arr);
    }
    if (catMap.size <= 1) return [];

    return Array.from(catMap.entries()).map(([cat, eps]) => ({
      key: `cat:${cat}`,
      label: cat,
      episodes: eps
    }));
  }, [book.episodes, book.parts, isThematicMode]);

  // Primary CTA target (in-progress episode -> first unheard -> first episode)
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

  const completedCount = useMemo(
    () => book.episodes.filter((ep) => progressMap[ep.id]?.completed).length,
    [book.episodes, progressMap]
  );

  const unreadNewCount = useMemo(
    () => book.episodes.filter((ep) => isEpisodeNew(ep)).length,
    [book.episodes, isEpisodeNew]
  );

  const savedInBookCount = useMemo(
    () => book.episodes.filter((ep) => favorites.includes(ep.id)).length,
    [book.episodes, favorites]
  );

  // Filter episodes by search / quickFilter / activeCollectionKey
  const filteredEpisodes = useMemo(() => {
    const q = searchQuery.normalize('NFC').trim().toLowerCase();

    if (q) {
      return book.episodes.filter(
        (ep) =>
          ep.episodeCode.toLowerCase().includes(q) ||
          ep.title.normalize('NFC').toLowerCase().includes(q) ||
          (ep.categoryTag || '').normalize('NFC').toLowerCase().includes(q)
      );
    }

    if (quickFilter === 'new') {
      return book.episodes.filter((ep) => isEpisodeNew(ep));
    }
    if (quickFilter === 'saved') {
      return book.episodes.filter((ep) => favorites.includes(ep.id));
    }

    if (activeCollectionKey !== 'ALL' && collections.length > 0) {
      const found = collections.find((c) => c.key === activeCollectionKey);
      if (found) return found.episodes;
    }

    return book.episodes;
  }, [
    activeCollectionKey,
    book.episodes,
    collections,
    favorites,
    isEpisodeNew,
    quickFilter,
    searchQuery
  ]);

  // Auto-jump to the 20-episode chunk containing the active / in-progress episode on initial load
  useEffect(() => {
    if (searchQuery.trim() || quickFilter !== 'none') {
      setChunkIndex(0);
      return;
    }
    const targetId = activeEpisode?.id || primaryAudioTarget?.episode.id;
    if (!targetId || filteredEpisodes.length <= CHUNK_SIZE) {
      setChunkIndex(0);
      return;
    }
    const idx = filteredEpisodes.findIndex((e) => e.id === targetId);
    setChunkIndex(idx >= 0 ? Math.floor(idx / CHUNK_SIZE) : 0);
  }, [
    activeCollectionKey,
    activeEpisode?.id,
    filteredEpisodes,
    primaryAudioTarget?.episode.id,
    quickFilter,
    searchQuery
  ]);

  const totalChunks = Math.ceil(filteredEpisodes.length / CHUNK_SIZE);
  const safeChunkIndex = Math.min(chunkIndex, Math.max(0, totalChunks - 1));

  // If searching, show up to 30 matches directly; otherwise show the active 20-episode chunk
  const displayedEpisodes = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredEpisodes.slice(0, 30);
    }
    const start = safeChunkIndex * CHUNK_SIZE;
    return filteredEpisodes.slice(start, start + CHUNK_SIZE);
  }, [filteredEpisodes, safeChunkIndex, searchQuery]);

  const chunkLabels = useMemo(() => {
    if (totalChunks <= 1 || searchQuery.trim()) return [];
    const list: { index: number; label: string }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const slice = filteredEpisodes.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      if (slice.length === 0) continue;
      const firstCode = slice[0].episodeCode;
      const lastCode = slice[slice.length - 1].episodeCode;
      list.push({
        index: i,
        label: firstCode === lastCode ? firstCode : `${firstCode}–${lastCode}`
      });
    }
    return list;
  }, [filteredEpisodes, searchQuery, totalChunks]);

  return (
    <div className="pb-6">
      {/* Compact Preset Wash Book Header (Leaves maximum vertical screen space for episodes) */}
      <div
        style={{
          backgroundColor: washBg,
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="px-4 pt-2.5 pb-3.5"
      >
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-2.5">
          <Link
            href="/books"
            style={{ color: 'var(--text-primary)' }}
            className="h-9 pr-2 inline-flex items-center gap-1 text-xs font-medium"
          >
            <ChevronLeftIcon size={16} />
            <span>Tủ sách</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              style={{ color: 'var(--text-secondary)' }}
              className="h-9 px-2 inline-flex items-center text-xs"
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
              className="w-9 h-9 rounded-[7px] flex items-center justify-center"
            >
              {isNight ? <SunIcon size={15} /> : <MoonIcon size={15} />}
            </button>
          </div>
        </div>

        {/* Compact Identity + Actions */}
        <div className="flex items-start gap-3">
          <div className="w-[62px] shrink-0">
            <BookCover
              src={book.coverUrl}
              alt={book.title}
              focalPoint={book.coverFocalPoint}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold font-editorial leading-snug truncate">
              {book.title}
            </h1>
            <p
              className="text-xs truncate mt-0.5 tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              {book.subtitle || book.author || book.genreTag}
              {' · '}
              {completedCount > 0
                ? `${completedCount}/${book.episodes.length} đã nghe`
                : `${book.episodes.length} tập`}
            </p>

            {/* Single-row Primary Play + Voice Selector */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                  className="h-8 px-3 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums"
                >
                  {activeEpisode?.id === primaryAudioTarget.episode.id && isPlaying ? (
                    <PauseIcon size={12} />
                  ) : (
                    <PlayIcon size={12} />
                  )}
                  <span>
                    {activeEpisode?.id === primaryAudioTarget.episode.id && isPlaying
                      ? 'Đang phát'
                      : primaryAudioTarget.resume
                        ? `Tiếp tục Tập ${primaryAudioTarget.episode.episodeCode}`
                        : `Nghe Tập ${primaryAudioTarget.episode.episodeCode}`}
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
                    className="h-8 px-3 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <BookOpenIcon size={13} />
                    <span>Đọc Tập {book.episodes[0].episodeCode}</span>
                  </Link>
                )
              )}

              {availableVoices.length > 1 && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)',
                    color: accentColor
                  }}
                  className="h-8 px-2 rounded-[7px] inline-flex items-center gap-1 text-xs font-medium"
                >
                  <MicIcon size={12} className="shrink-0" />
                  <select
                    aria-label="Chọn giọng kể"
                    value={effectiveSelectedVoice}
                    onChange={(e) => selectVoicePreference(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-xs font-medium max-w-[125px] truncate"
                  >
                    {availableVoices.map((vp) => (
                      <option key={vp.id} value={vp.voiceKey}>
                        {vp.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {book.description && (
                <button
                  type="button"
                  onClick={() => setShowIntro((v) => !v)}
                  style={{ color: 'var(--text-secondary)' }}
                  className="h-8 px-1.5 inline-flex items-center gap-0.5 text-xs"
                >
                  <span>Giới thiệu</span>
                  <ChevronDownIcon
                    size={13}
                    className={`transition-transform ${showIntro ? 'rotate-180' : ''}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {showIntro && book.description && (
          <div
            style={{ borderTop: '1px solid var(--border-hairline)' }}
            className="mt-3 pt-2.5 text-xs leading-relaxed space-y-1"
          >
            <p>{book.description}</p>
            {book.author && (
              <p style={{ color: 'var(--text-secondary)' }}>
                Tác giả: {book.author} · Độ tuổi: {book.ageRange}
              </p>
            )}
          </div>
        )}
      </div>

      {/* High-Density Scalable Table of Contents (Phương án 1) */}
      <section aria-label="Mục lục tập truyện" className="px-3.5 pt-3 space-y-2.5">
        {/* 1. Quick Number/Title Search + Compact New / Saved Toggles */}
        <div className="flex items-center gap-1.5">
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="flex-1 h-9 px-2.5 rounded-[8px] flex items-center gap-2 min-w-0"
          >
            <SearchIcon size={14} className="shrink-0 opacity-60" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số tập hoặc tên tập..."
              className="flex-1 bg-transparent outline-none text-xs min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Xóa tìm kiếm"
                onClick={() => setSearchQuery('')}
                className="w-6 h-6 flex items-center justify-center opacity-70"
              >
                <CloseIcon size={13} />
              </button>
            )}
          </div>

          {(unreadNewCount > 0 || quickFilter === 'new') && (
            <button
              type="button"
              onClick={() =>
                setQuickFilter((prev) => (prev === 'new' ? 'none' : 'new'))
              }
              style={{
                backgroundColor:
                  quickFilter === 'new' ? 'var(--accent-warm)' : 'var(--bg-surface)',
                color:
                  quickFilter === 'new' ? '#1B140A' : 'var(--accent-warm)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-9 px-2.5 rounded-[8px] text-xs font-semibold shrink-0 tabular-nums"
            >
              Mới ({unreadNewCount})
            </button>
          )}

          {(savedInBookCount > 0 || quickFilter === 'saved') && (
            <button
              type="button"
              aria-label="Lọc tập đã lưu"
              onClick={() =>
                setQuickFilter((prev) => (prev === 'saved' ? 'none' : 'saved'))
              }
              style={{
                backgroundColor:
                  quickFilter === 'saved' ? 'var(--accent-berry)' : 'var(--bg-surface)',
                color:
                  quickFilter === 'saved' ? '#F8F5EE' : 'var(--text-secondary)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-9 px-2.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1 shrink-0 tabular-nums"
            >
              <BookmarkIcon size={13} filled={quickFilter === 'saved'} />
              <span>{savedInBookCount}</span>
            </button>
          )}
        </div>

        {/* 2. Horizontal Collection Tabs (Shown for Thematic Multi-Topic Books when not in search/quickFilter) */}
        {collections.length > 0 && !searchQuery.trim() && quickFilter === 'none' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveCollectionKey('ALL');
                setChunkIndex(0);
              }}
              style={{
                backgroundColor:
                  activeCollectionKey === 'ALL' ? accentColor : 'var(--bg-surface)',
                color:
                  activeCollectionKey === 'ALL'
                    ? accentTextOnSolid
                    : 'var(--text-secondary)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-8 px-3 rounded-[7px] text-xs font-medium shrink-0 tabular-nums"
            >
              Tất cả ({book.episodes.length})
            </button>

            {collections.map((col) => {
              const active = activeCollectionKey === col.key;
              return (
                <button
                  key={col.key}
                  type="button"
                  onClick={() => {
                    setActiveCollectionKey(col.key);
                    setChunkIndex(0);
                  }}
                  style={{
                    backgroundColor: active ? accentColor : 'var(--bg-surface)',
                    color: active ? accentTextOnSolid : 'var(--text-secondary)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="h-8 px-3 rounded-[7px] text-xs font-medium shrink-0 tabular-nums"
                >
                  {col.label} ({col.episodes.length})
                </button>
              );
            })}
          </div>
        )}

        {/* 3. Automatic 20-Episode Range Chunks (01–20 | 21–40 | 41–60...) */}
        {chunkLabels.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {chunkLabels.map((chunk) => {
              const active = safeChunkIndex === chunk.index;
              return (
                <button
                  key={chunk.index}
                  type="button"
                  onClick={() => setChunkIndex(chunk.index)}
                  style={{
                    backgroundColor: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg-canvas)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="h-7 px-2.5 rounded-[6px] text-[11px] font-semibold shrink-0 tabular-nums"
                >
                  {chunk.label}
                </button>
              );
            })}
          </div>
        )}

        {/* 4. Minimalist High-Density Episode List (6–7 episodes visible per mobile screen) */}
        {displayedEpisodes.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="rounded-[10px] p-5 text-center space-y-2"
          >
            <p className="text-xs font-editorial">
              Không có tập nào trong mục lọc hiện tại.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setQuickFilter('none');
                setActiveCollectionKey('ALL');
              }}
              style={{ color: accentColor }}
              className="text-xs font-semibold underline"
            >
              Hiển thị lại toàn bộ danh sách
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] divide-y divide-[var(--border-hairline)] overflow-hidden"
          >
            {displayedEpisodes.map((ep) => {
              const prog = progressMap[ep.id];
              const isEpActive = activeEpisode?.id === ep.id;
              const isEpPlaying = isEpActive && isPlaying;
              const isSaved = favorites.includes(ep.id);
              const isNew = isEpisodeNew(ep);
              const pct =
                prog && prog.durationSeconds > 0
                  ? Math.min(
                      99,
                      Math.round((prog.positionSeconds / prog.durationSeconds) * 100)
                    )
                  : 0;

              const preferredTrack =
                ep.audioTracks.find(
                  (t) => t.voiceProfile.voiceKey === effectiveSelectedVoice
                ) || ep.audioTracks[0];
              const durationText = ep.isTextOnly
                ? estimateReadingMinutes(ep.wordCount)
                : formatDurationShort(preferredTrack?.durationSeconds || 0);

              return (
                <div
                  key={ep.id}
                  style={{
                    backgroundColor: isEpActive ? washBg : 'transparent'
                  }}
                  className="px-3 py-2 flex items-center gap-2.5 transition"
                >
                  {/* Episode Number */}
                  {book.showEpisodeNumbers && (
                    <Link
                      href={`/episodes/${ep.id}`}
                      style={{
                        color: isEpActive ? accentColor : 'var(--text-secondary)'
                      }}
                      className="w-6 text-xs font-medium tabular-nums shrink-0 text-left"
                    >
                      {ep.episodeCode}
                    </Link>
                  )}

                  {/* Miniature 38×50px (3:4) Watercolor Thumbnail */}
                  <Link
                    href={`/episodes/${ep.id}`}
                    aria-label={`Đọc ${ep.title}`}
                    style={{
                      border: '1px solid var(--border-hairline)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                    className="w-[38px] h-[50px] rounded-[4px] overflow-hidden shrink-0 block"
                  >
                    <img
                      src={ep.effectiveCoverUrl}
                      alt=""
                      loading="lazy"
                      className={`w-full h-full object-cover block ${focalPointClass(
                        book.coverFocalPoint
                      )}`}
                    />
                  </Link>

                  {/* Title + Minimalist Sub-line ("16 phút" · Mới / Đã nghe) */}
                  <Link
                    href={`/episodes/${ep.id}`}
                    className="flex-1 min-w-0 py-0.5"
                  >
                    <h3
                      style={{
                        color: isEpActive ? accentColor : 'var(--text-primary)'
                      }}
                      className="text-[14px] font-semibold font-editorial line-clamp-1"
                    >
                      {ep.title}
                    </h3>
                    <div
                      className="text-[11.5px] tabular-nums flex items-center gap-1.5 truncate"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <span>{durationText}</span>
                      {isNew && (
                        <span
                          style={{ color: 'var(--accent-warm)' }}
                          className="font-semibold"
                        >
                          &middot; Mới
                        </span>
                      )}
                      {prog?.completed ? (
                        <span style={{ color: accentColor }}>&middot; Đã nghe</span>
                      ) : pct > 0 ? (
                        <span style={{ color: 'var(--accent-warm)' }}>
                          &middot; {pct}%
                        </span>
                      ) : null}
                    </div>
                  </Link>

                  {/* Compact Bookmark + Circular Play Button */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      aria-label={isSaved ? 'Bỏ lưu' : 'Lưu tập'}
                      onClick={() => toggleFavorite(ep.id)}
                      style={{
                        color: isSaved ? 'var(--accent-berry)' : 'var(--text-secondary)',
                        opacity: isSaved ? 1 : 0.55
                      }}
                      className="w-8 h-9 flex items-center justify-center"
                    >
                      <BookmarkIcon size={15} filled={isSaved} />
                    </button>

                    {!ep.isTextOnly && ep.audioTracks.length > 0 && (
                      <button
                        type="button"
                        aria-label={isEpPlaying ? `Tạm dừng ${ep.title}` : `Phát ${ep.title}`}
                        onClick={() =>
                          playEpisode(book, ep, effectiveSelectedVoice || undefined)
                        }
                        style={{
                          backgroundColor: isEpPlaying
                            ? accentColor
                            : 'var(--bg-surface)',
                          color: isEpPlaying ? accentTextOnSolid : accentColor,
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      >
                        {isEpPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Chunk Switcher when scrolling to end of 20 episodes */}
        {chunkLabels.length > 1 && (
          <div className="pt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={safeChunkIndex === 0}
              onClick={() => {
                setChunkIndex((i) => Math.max(0, i - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ color: 'var(--text-secondary)' }}
              className="h-9 px-3 rounded-[7px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] disabled:opacity-35 tabular-nums"
            >
              &larr; Chặng trước
            </button>
            <span className="tabular-nums" style={{ color: 'var(--text-secondary)' }}>
              Chặng {safeChunkIndex + 1} / {totalChunks}
            </span>
            <button
              type="button"
              disabled={safeChunkIndex >= totalChunks - 1}
              onClick={() => {
                setChunkIndex((i) => Math.min(totalChunks - 1, i + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ color: accentColor }}
              className="h-9 px-3 rounded-[7px] border border-[var(--border-hairline)] bg-[var(--bg-surface)] font-semibold disabled:opacity-35 tabular-nums"
            >
              Chặng tiếp &rarr;
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
