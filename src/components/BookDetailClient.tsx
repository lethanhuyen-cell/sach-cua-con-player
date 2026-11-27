'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { HydratedBook, HydratedEpisode, VoiceProfile } from '@/lib/types';
import { formatBookDisplayGenre, resolveBookHall } from '@/lib/halls';
import {
  BOOK_PRESETS,
  focalPointClass,
  getEpisodeDurationLabel,
  isEpisodeReadingOnly
} from '@/lib/presets';
import {
  getBookLineByCode,
  getConceptBySlug,
  matchesEpisodeKnowledgeQuery
} from '@/lib/knowledge';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import { StorybookHeroStage } from './StorybookHeroStage';
import { LibraryWayfinder } from './LibraryWayfinder';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  CloseIcon,
  MicIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
  SunIcon
} from './Icons';

// Progressive Disclosure threshold: books up to 25 episodes render continuously without splitting chunks
const CHUNK_SIZE = 25;

interface CollectionGroup {
  key: string;
  label: string;
  episodes: HydratedEpisode[];
}

export function BookDetailClient({ book }: { book: HydratedBook }) {
  const {
    books,
    isNight,
    toggleNight,
    favorites,
    toggleFavorite,
    progressMap,
    readingProgressMap,
    isEpisodeNew,
    preferredVoiceKey,
    selectVoicePreference,
    activeEpisode,
    activeTrack,
    isPlaying,
    playEpisode
  } = useLibraryPlayer();

  const [showIntro, setShowIntro] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(book.episodes.length > 15);
  const [searchQuery, setSearchQuery] = useState('');
  const [quickFilter, setQuickFilter] = useState<'none' | 'new' | 'saved'>('none');
  const [activeCollectionKey, setActiveCollectionKey] = useState<string>('ALL');
  const [chunkIndex, setChunkIndex] = useState<number>(0);

  const preset = BOOK_PRESETS[book.themePreset] || BOOK_PRESETS.moss;
  const hall = useMemo(() => resolveBookHall(book), [book]);
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

  const isThematicMode = (book.tocMode || 'thematic') === 'thematic';

  // Build thematic collections from Parts or distinct episode categoryTags
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

  // Primary CTA target for audio books
  const primaryAudioTarget = useMemo(() => {
    const audioEpisodes = book.episodes.filter((e) => !isEpisodeReadingOnly(e));
    if (audioEpisodes.length === 0) return null;

    const inProg = audioEpisodes.find((e) => {
      const p = progressMap[e.id];
      return p && p.positionSeconds > 0 && !p.completed;
    });
    if (inProg) return { episode: inProg, resume: true };

    const firstUnheard = audioEpisodes.find((e) => !progressMap[e.id]?.completed);
    return { episode: firstUnheard || audioEpisodes[0], resume: false };
  }, [book.episodes, progressMap]);

  // Primary CTA target for text-only books
  const primaryReadingTarget = useMemo(() => {
    if (book.episodes.length === 0) return null;
    const inProg = book.episodes.find((e) => {
      const rp = readingProgressMap[e.id];
      return rp && rp.scrollPercent > 0 && !rp.completed;
    });
    if (inProg) {
      return {
        episode: inProg,
        resume: true,
        scrollPercent: readingProgressMap[inProg.id].scrollPercent
      };
    }
    const firstUnread = book.episodes.find((e) => !readingProgressMap[e.id]?.completed);
    return {
      episode: firstUnread || book.episodes[0],
      resume: false,
      scrollPercent: 0
    };
  }, [book.episodes, readingProgressMap]);

  const completedAudioCount = useMemo(
    () => book.episodes.filter((ep) => progressMap[ep.id]?.completed).length,
    [book.episodes, progressMap]
  );

  const completedReadCount = useMemo(
    () => book.episodes.filter((ep) => readingProgressMap[ep.id]?.completed).length,
    [book.episodes, readingProgressMap]
  );

  const unreadNewCount = useMemo(
    () => book.episodes.filter((ep) => isEpisodeNew(ep)).length,
    [book.episodes, isEpisodeNew]
  );

  const savedInBookCount = useMemo(
    () => book.episodes.filter((ep) => favorites.includes(ep.id)).length,
    [book.episodes, favorites]
  );

  const filteredEpisodes = useMemo(() => {
    const q = searchQuery.normalize('NFC').trim().toLowerCase();

    if (q) {
      return book.episodes.filter((ep) => matchesEpisodeKnowledgeQuery(ep, q));
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

  useEffect(() => {
    if (searchQuery.trim() || quickFilter !== 'none') {
      setChunkIndex(0);
      return;
    }
    const targetId =
      activeEpisode?.id || primaryAudioTarget?.episode.id || primaryReadingTarget?.episode.id;
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
    primaryReadingTarget?.episode.id,
    quickFilter,
    searchQuery
  ]);

  const totalChunks = Math.ceil(filteredEpisodes.length / CHUNK_SIZE);
  const safeChunkIndex = Math.min(chunkIndex, Math.max(0, totalChunks - 1));

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

  const bookKnowledgeSummary = useMemo(() => {
    const primaryLine = getBookLineByCode(book.knowledgeMeta?.primaryLine);
    const secondaryLines = (book.knowledgeMeta?.secondaryLines || [])
      .map((code) => getBookLineByCode(code))
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
    const concepts = (book.knowledgeMeta?.crossCuttingConcepts || [])
      .map((slug) => getConceptBySlug(slug)?.label || slug)
      .filter(Boolean);
    return { primaryLine, secondaryLines, concepts };
  }, [book.knowledgeMeta]);

  const resolvedCuriosityTrails = useMemo(() => {
    const episodeLookup = new Map<
      string,
      { targetBook: HydratedBook; targetEpisode: HydratedEpisode }
    >();
    for (const b of books) {
      for (const ep of b.episodes) {
        episodeLookup.set(ep.id, { targetBook: b, targetEpisode: ep });
      }
    }

    const items: {
      sourceEpisode: HydratedEpisode;
      bridgeQuestion: string;
      targetBook: HydratedBook;
      targetEpisode: HydratedEpisode;
    }[] = [];

    for (const ep of book.episodes) {
      for (const trail of ep.knowledgeMeta?.curiosityTrails || []) {
        const found = episodeLookup.get(trail.targetEpisodeId);
        if (found) {
          items.push({
            sourceEpisode: ep,
            bridgeQuestion: trail.bridgeQuestion,
            targetBook: found.targetBook,
            targetEpisode: found.targetEpisode
          });
        }
      }
    }
    return items.slice(0, 4);
  }, [book.episodes, books]);

  const hasAudioBook = Boolean(primaryAudioTarget);
  const summaryStats = hasAudioBook
    ? completedAudioCount > 0
      ? `${completedAudioCount}/${book.episodes.length} đã nghe`
      : `${book.episodes.length} tập`
    : completedReadCount > 0
      ? `${completedReadCount}/${book.episodes.length} đã đọc`
      : `${book.episodes.length} tập · Đọc chữ`;

  return (
    <div className="pb-6">
      {/* Top Sticky Doubled Pinned Wayfinder (72px Mobile / 86px Desktop) */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1.5px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[72px] md:h-[86px] px-2.5 sm:px-3.5 md:px-7 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="book" currentHall={hall} currentBook={book} />

        <div className="flex items-center gap-0.5 md:gap-1.5 shrink-0">
          {book.episodes.length <= 15 && (
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen((v) => !v);
                if (isSearchOpen) setSearchQuery('');
              }}
              aria-label="Tìm tập trong bộ sách"
              style={{
                backgroundColor: isSearchOpen ? 'var(--text-primary)' : 'transparent',
                color: isSearchOpen ? 'var(--bg-canvas)' : 'var(--text-primary)'
              }}
              className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-[10px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
            >
              <SearchIcon
                size={24}
                strokeWidth={1.85}
                className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
              />
            </button>
          )}
          <button
            type="button"
            onClick={toggleNight}
            aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
            style={{ color: 'var(--text-primary)' }}
            className="w-[38px] h-[38px] md:w-[46px] md:h-[46px] rounded-[10px] hover:bg-[var(--bg-surface)] flex items-center justify-center transition"
          >
            {isNight ? (
              <SunIcon
                size={24}
                strokeWidth={1.85}
                className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
              />
            ) : (
              <MoonIcon
                size={24}
                strokeWidth={1.85}
                className="w-[23px] h-[23px] md:w-[28px] md:h-[28px]"
              />
            )}
          </button>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[390px_1fr] lg:grid-cols-[424px_1fr] md:gap-8 md:px-6 md:pt-5 md:items-start">
        {/* Gallery Bookplate Stage (Left Page on >= 768px) */}
        <div className="md:sticky md:top-[104px]">
          <StorybookHeroStage
            src={book.coverUrl}
            alt={book.title}
            focalPoint={book.coverFocalPoint}
            washBg={washBg}
            variant="bookplate"
            roundedClass="rounded-[9px]"
          >
        <div>
          <h1 className="text-[20px] font-bold font-editorial leading-snug line-clamp-2">
            {book.title}
          </h1>
          <p
            className="text-xs truncate mt-0.5 tabular-nums"
            style={{ color: 'var(--text-secondary)' }}
          >
            {book.subtitle || book.author || formatBookDisplayGenre(book)} · {summaryStats}
          </p>

          {/* Primary Play/Read CTA + Voice Selector + Intro Toggle */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
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
                className="h-9 px-3.5 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums whitespace-nowrap shrink-0"
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
              primaryReadingTarget && (
                <Link
                  href={`/episodes/${primaryReadingTarget.episode.id}`}
                  style={{
                    backgroundColor: accentColor,
                    color: accentTextOnSolid
                  }}
                  className="h-9 px-3.5 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1.5 tabular-nums whitespace-nowrap shrink-0"
                >
                  <BookOpenIcon size={13} />
                  <span>
                    {primaryReadingTarget.resume
                      ? `Đọc tiếp Tập ${primaryReadingTarget.episode.episodeCode} (${primaryReadingTarget.scrollPercent}%)`
                      : `Đọc Tập ${primaryReadingTarget.episode.episodeCode}`}
                  </span>
                </Link>
              )
            )}

            {availableVoices.length > 1 && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  color: accentColor
                }}
                className="h-9 px-2.5 rounded-[8px] inline-flex items-center gap-1 text-xs font-medium shrink-0"
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
                className="h-9 px-2 inline-flex items-center gap-0.5 text-xs whitespace-nowrap shrink-0"
              >
                <span>Giới thiệu</span>
                <ChevronDownIcon
                  size={13}
                  className={`transition-transform ${showIntro ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          {showIntro && book.description && (
            <div
              style={{ borderTop: '1px solid var(--border-hairline)' }}
              className="mt-3 pt-2.5 text-xs leading-relaxed space-y-1.5"
            >
              <p>{book.description}</p>
              {book.author && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Tác giả: {book.author} · Độ tuổi: {book.ageRange}
                </p>
              )}
              {bookKnowledgeSummary.primaryLine && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Dòng sách: {bookKnowledgeSummary.primaryLine.title}
                  {bookKnowledgeSummary.secondaryLines.length > 0
                    ? ` · Giao thoa: ${bookKnowledgeSummary.secondaryLines
                        .map((l) => l.title)
                        .join(', ')}`
                    : ''}
                </p>
              )}
              {bookKnowledgeSummary.concepts.length > 0 && (
                <div className="pt-0.5 flex flex-wrap gap-1">
                  {bookKnowledgeSummary.concepts.map((label) => (
                    <span
                      key={label}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-secondary)'
                      }}
                      className="px-2 py-0.5 rounded-[5px] text-[11px]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </StorybookHeroStage>
        </div>

        {/* Progressive Disclosure Table of Contents (Right Page on >= 768px) */}
        <section aria-label="Mục lục tập truyện" className="px-3.5 md:px-0 pt-3 md:pt-0 space-y-2.5 min-w-0">
        {/* 1. Search Bar (collapsible when <= 15 episodes) + New / Saved quick filters */}
        {(isSearchOpen || unreadNewCount > 0 || savedInBookCount > 0 || quickFilter !== 'none') && (
          <div className="flex items-center gap-1.5">
            {isSearchOpen ? (
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
                  placeholder="Tìm số tập, tên tập hoặc chủ đề..."
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
            ) : (
              <div className="flex-1 text-xs font-semibold font-editorial" style={{ color: 'var(--text-secondary)' }}>
                Mục lục ({book.episodes.length} tập)
              </div>
            )}

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
        )}

        {/* 2. Horizontal Collection Tabs (Shown for Thematic Books) */}
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

        {/* 3. 25-Episode Range Chunks (Hidden for <= 25 episodes) */}
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

        {/* 4. Minimalist High-Density Episode List */}
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
              const readProg = readingProgressMap[ep.id];
              const isEpActive = activeEpisode?.id === ep.id;
              const isEpPlaying = isEpActive && isPlaying;
              const isSaved = favorites.includes(ep.id);
              const isNew = isEpisodeNew(ep);
              const audioPct =
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
              const durationText = getEpisodeDurationLabel(ep, {
                preferredDurationSeconds: preferredTrack?.durationSeconds
              });

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

                  {/* Miniature 38×50px (3:4) Clean Watercolor Thumbnail */}
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

                  {/* Title + Minimalist Sub-line */}
                  <Link href={`/episodes/${ep.id}`} className="flex-1 min-w-0 py-0.5">
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
                      ) : audioPct > 0 ? (
                        <span style={{ color: 'var(--accent-warm)' }}>
                          &middot; Nghe {audioPct}%
                        </span>
                      ) : readProg?.completed ? (
                        <span style={{ color: accentColor }}>&middot; Đã đọc</span>
                      ) : readProg && readProg.scrollPercent > 3 ? (
                        <span style={{ color: 'var(--accent-warm)' }}>
                          &middot; Đọc {readProg.scrollPercent}%
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
                      className="w-9 h-10 flex items-center justify-center"
                    >
                      <BookmarkIcon size={15} filled={isSaved} />
                    </button>

                    {!isEpisodeReadingOnly(ep) && (
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

        {/* Bottom Chunk Switcher when > 25 episodes */}
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

        {/* 5. Cross-Disciplinary Curiosity Trails (Only on Book TOC, never on Episode Reader) */}
        {resolvedCuriosityTrails.length > 0 && !searchQuery.trim() && quickFilter === 'none' && (
          <div className="pt-3 space-y-2">
            <h2 className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
              Mạch kết nối liên ngành
            </h2>
            <div className="space-y-2">
              {resolvedCuriosityTrails.map((trail, idx) => (
                <Link
                  key={`${trail.sourceEpisode.id}-${trail.targetEpisode.id}-${idx}`}
                  href={`/episodes/${trail.targetEpisode.id}`}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="block rounded-[10px] p-3 space-y-1 transition hover:opacity-90"
                >
                  <p className="text-xs font-editorial leading-relaxed">
                    {trail.bridgeQuestion}
                  </p>
                  <p
                    className="text-[11px] font-medium truncate tabular-nums"
                    style={{ color: accentColor }}
                  >
                    Từ Tập {trail.sourceEpisode.episodeCode} &rarr; {trail.targetBook.title} · Tập{' '}
                    {trail.targetEpisode.episodeCode}: {trail.targetEpisode.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
