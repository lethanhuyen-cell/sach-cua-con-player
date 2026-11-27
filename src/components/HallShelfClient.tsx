'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { HydratedBook } from '@/lib/types';
import { LIBRARY_HALLS, LibraryHallDefinition } from '@/lib/halls';
import { BOOK_PRESETS, isEpisodeReadingOnly } from '@/lib/presets';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { BookCover } from './BookCover';
import { StorybookHeroStage } from './StorybookHeroStage';
import { LibraryWayfinder } from './LibraryWayfinder';
import {
  BookmarkIcon,
  CompassIcon,
  FeatherIcon,
  HearthCupIcon,
  LanternIcon,
  LeafIcon,
  MoonIcon,
  MusicSparkIcon,
  SearchIcon,
  SunIcon
} from './Icons';

function HallGlyph({ slug }: { slug: LibraryHallDefinition['slug'] }) {
  switch (slug) {
    case 'khoa-hoc-tu-nhien':
      return <LeafIcon size={15} />;
    case 'am-thuc-nep-nha':
      return <HearthCupIcon size={15} />;
    case 'van-hoc-dong-thoai':
      return <FeatherIcon size={15} />;
    case 'lich-su-van-hoa':
      return <CompassIcon size={15} />;
    case 'nghe-thuat-tho-nhac':
      return <MusicSparkIcon size={15} />;
    case 'ky-nang-lon-khon':
      return <LanternIcon size={15} />;
  }
}

export function HallShelfClient({
  hall,
  booksInHall,
  litHallSlugs
}: {
  hall: LibraryHallDefinition;
  booksInHall: HydratedBook[];
  litHallSlugs: string[];
}) {
  const {
    isNight,
    toggleNight,
    favorites,
    progressMap,
    readingProgressMap,
    isEpisodeNew,
    openUtilitySheet
  } = useLibraryPlayer();

  const preset = BOOK_PRESETS[hall.preset] || BOOK_PRESETS.moss;
  const washBg = isNight ? preset.nightWash : preset.dayWash;

  const shelfRows = useMemo(() => {
    const rows: HydratedBook[][] = [];
    for (let i = 0; i < booksInHall.length; i += 2) {
      rows.push(booksInHall.slice(i, i + 2));
    }
    return rows;
  }, [booksInHall]);

  const oakShelfStyle: React.CSSProperties = isNight
    ? {
        background: 'linear-gradient(180deg, #3A2F24 0%, #261E16 100%)',
        border: '1px solid #4E3E30',
        boxShadow: '0 6px 14px rgba(0, 0, 0, 0.45)'
      }
    : {
        background: 'linear-gradient(180deg, #E2D2BA 0%, #CBB594 100%)',
        border: '1px solid #B79F7D',
        boxShadow: '0 6px 14px rgba(72, 54, 34, 0.14)'
      };

  const suggestedLitHalls = useMemo(
    () => LIBRARY_HALLS.filter((h) => h.slug !== hall.slug && litHallSlugs.includes(h.slug)),
    [hall.slug, litHallSlugs]
  );

  return (
    <div className="pb-6">
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 h-[44px] px-3 md:px-6 flex items-center justify-between gap-1.5"
      >
        <LibraryWayfinder currentStep="shelf" shelfBranch="hall" currentHall={hall} />

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => openUtilitySheet('search')}
            aria-label="Tìm kiếm"
            style={{ color: 'var(--text-primary)' }}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center"
          >
            <SearchIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => openUtilitySheet('saved')}
            aria-label="Đã lưu"
            style={{
              color: favorites.length > 0 ? 'var(--accent-berry)' : 'var(--text-primary)'
            }}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center"
          >
            <BookmarkIcon size={16} filled={favorites.length > 0} />
          </button>
          <button
            type="button"
            onClick={toggleNight}
            aria-label={isNight ? 'Giao diện sáng' : 'Giao diện đêm'}
            style={{ color: 'var(--text-primary)' }}
            className="w-8 h-8 rounded-[7px] flex items-center justify-center"
          >
            {isNight ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </header>

      <div className="md:grid md:grid-cols-[400px_1fr] lg:grid-cols-[436px_1fr] md:gap-8 md:px-6 md:pt-5 md:items-start">
        <div className="md:sticky md:top-[62px]">
          <StorybookHeroStage
            src={isNight ? hall.nightHeroUrl : hall.dayHeroUrl}
            alt={hall.title}
            washBg={washBg}
            variant="immersive"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span style={{ color: isNight ? preset.nightAccent : preset.dayAccent }}>
                  <HallGlyph slug={hall.slug} />
                </span>
                <h1 className="text-[20px] font-bold font-editorial leading-snug">{hall.title}</h1>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {hall.epigraph}
              </p>
            </div>
          </StorybookHeroStage>
        </div>

        <section aria-label="Kệ sách" className="px-4 md:px-0 pt-5 md:pt-1 space-y-7 min-w-0">
        {booksInHall.length === 0 ? (
          <div className="space-y-6">
            <div>
              <div className="py-10 text-center">
                <p
                  className="text-sm font-editorial"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Chưa có sách trên kệ này.
                </p>
              </div>
              <div style={oakShelfStyle} className="h-[10px] rounded-[4px]" />
            </div>

            {suggestedLitHalls.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <p className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                  Các kệ đã có sách
                </p>
                <div className="space-y-2">
                  {suggestedLitHalls.map((other) => (
                    <Link
                      key={other.slug}
                      href={`/halls/${other.slug}`}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="rounded-[10px] p-3 flex items-center justify-between gap-2"
                    >
                      <span className="text-sm font-semibold font-editorial truncate">
                        {other.title}
                      </span>
                      <span
                        className="text-xs font-medium shrink-0"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        Mở kệ &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          shelfRows.map((row, rowIdx) => (
            <div key={rowIdx}>
              <div className="grid grid-cols-2 gap-4 px-1 items-end">
                {row.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    className="block transition active:scale-[0.98]"
                  >
                    <BookCover
                      src={book.coverUrl}
                      alt={book.title}
                      focalPoint={book.coverFocalPoint}
                    />
                  </Link>
                ))}
                {row.length === 1 && <div aria-hidden="true" />}
              </div>

              <div
                aria-hidden="true"
                style={oakShelfStyle}
                className="h-[10px] rounded-[4px] mt-0.5"
              />

              <div className="grid grid-cols-2 gap-4 px-1 pt-2.5">
                {row.map((book) => {
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

                  const progressText = isAudioBook
                    ? completedAudioCount > 0
                      ? `${completedAudioCount} / ${book.episodes.length} tập đã nghe`
                      : `${book.episodes.length} tập`
                    : completedReadCount > 0
                      ? `${completedReadCount} / ${book.episodes.length} tập đã đọc`
                      : `${book.episodes.length} tập · Đọc chữ`;

                  return (
                    <Link key={book.id} href={`/books/${book.slug}`} className="block min-w-0">
                      <h2 className="text-[15px] font-semibold font-editorial line-clamp-2">
                        {book.title}
                      </h2>
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
                        {progressText}
                      </p>
                      {latestNewEp && (
                        <p
                          className="text-[11px] font-medium mt-0.5 truncate tabular-nums"
                          style={{ color: 'var(--accent-warm)' }}
                        >
                          {unreadNewEps.length > 1
                            ? `${unreadNewEps.length} tập mới · Tập ${latestNewEp.episodeCode}`
                            : `Mới: Tập ${latestNewEp.episodeCode}`}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
        </section>
      </div>
    </div>
  );
}
