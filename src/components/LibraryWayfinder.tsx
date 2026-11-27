'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HydratedBook, HydratedEpisode } from '@/lib/types';
import {
  LIBRARY_HALLS,
  LibraryHallDefinition,
  resolveBookHall,
  resolveBookHalls
} from '@/lib/halls';
import { useLibraryPlayer } from '@/context/LibraryPlayerContext';
import {
  ArchDoorIcon,
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon
} from './Icons';

export type WayfinderStep = 'gate' | 'foyer' | 'shelf' | 'book' | 'episode';
export type ShelfSubBranch = 'hall' | 'all_books' | 'saved';

export interface LibraryWayfinderProps {
  currentStep: WayfinderStep;
  shelfBranch?: ShelfSubBranch;
  currentHall?: LibraryHallDefinition | null;
  currentBook?: HydratedBook | null;
  currentEpisode?: HydratedEpisode | null;
  disabled?: boolean;
  elevateZIndex?: boolean;
  onBeforeNavigate?: () => void;
}

export function LibraryWayfinder({
  currentStep,
  shelfBranch = 'hall',
  currentHall = null,
  currentBook = null,
  currentEpisode = null,
  disabled = false,
  elevateZIndex = false,
  onBeforeNavigate
}: LibraryWayfinderProps) {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const {
    books,
    activeBook,
    activeEpisode,
    continueItems,
    navigateToGate,
    navigateToFoyer,
    openUtilitySheet
  } = useLibraryPlayer();

  const [isOpen, setIsOpen] = useState(false);

  // Close tray automatically on route transitions or when disabled (e.g. Kid Lock)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, disabled]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const litHalls = useMemo(
    () =>
      LIBRARY_HALLS.filter((h) =>
        books.some((b) => resolveBookHalls(b).some((bh) => bh.slug === h.slug))
      ),
    [books]
  );

  // Resolve smart forward targets for Kệ / Bộ / Tập when standing on higher tiers
  const { targetBook, targetEpisode } = useMemo(() => {
    if (currentBook && currentEpisode) {
      return { targetBook: currentBook, targetEpisode: currentEpisode };
    }

    if (currentBook) {
      const activeInBook =
        activeEpisode && currentBook.episodes.some((e) => e.id === activeEpisode.id)
          ? activeEpisode
          : null;
      const continueInBook =
        continueItems.find((item) => item.book.id === currentBook.id)?.episode || null;
      return {
        targetBook: currentBook,
        targetEpisode: activeInBook || continueInBook || currentBook.episodes[0] || null
      };
    }

    if (currentHall) {
      const activeInHall =
        activeBook &&
        activeEpisode &&
        resolveBookHalls(activeBook).some((h) => h.slug === currentHall.slug)
          ? { book: activeBook, episode: activeEpisode }
          : null;
      if (activeInHall) {
        return { targetBook: activeInHall.book, targetEpisode: activeInHall.episode };
      }

      const continueInHall = continueItems.find((item) =>
        resolveBookHalls(item.book).some((h) => h.slug === currentHall.slug)
      );
      if (continueInHall) {
        return { targetBook: continueInHall.book, targetEpisode: continueInHall.episode };
      }

      const firstInHall = books.find((b) =>
        resolveBookHalls(b).some((h) => h.slug === currentHall.slug)
      );
      if (firstInHall) {
        return { targetBook: firstInHall, targetEpisode: firstInHall.episodes[0] || null };
      }
    }

    if (activeBook && activeEpisode) {
      return { targetBook: activeBook, targetEpisode: activeEpisode };
    }
    if (continueItems[0]) {
      return { targetBook: continueItems[0].book, targetEpisode: continueItems[0].episode };
    }
    const fallbackBook = books[0] || null;
    return { targetBook: fallbackBook, targetEpisode: fallbackBook?.episodes[0] || null };
  }, [activeBook, activeEpisode, books, continueItems, currentBook, currentEpisode, currentHall]);

  const targetHall = useMemo<LibraryHallDefinition>(() => {
    if (currentHall) return currentHall;
    if (targetBook) return resolveBookHall(targetBook);
    return litHalls[0] || LIBRARY_HALLS[0];
  }, [currentHall, litHalls, targetBook]);

  const navigateToHref = (href: string) => {
    setIsOpen(false);
    onBeforeNavigate?.();
    if (pathname !== href) {
      router.push(href);
    }
  };

  const handleStepClick = (step: WayfinderStep) => {
    if (disabled) return;
    if (step === currentStep) {
      setIsOpen((prev) => !prev);
      return;
    }

    setIsOpen(false);
    onBeforeNavigate?.();

    switch (step) {
      case 'gate':
        navigateToGate();
        return;
      case 'foyer':
        navigateToFoyer();
        return;
      case 'shelf':
        router.push(`/halls/${targetHall.slug}`);
        return;
      case 'book':
        if (targetBook) {
          router.push(`/books/${targetBook.slug}`);
        }
        return;
      case 'episode':
        if (targetEpisode) {
          router.push(`/episodes/${targetEpisode.id}`);
        }
        return;
    }
  };

  const episodeLabel =
    currentStep === 'episode' && currentEpisode
      ? `TẬP ${currentEpisode.episodeCode.toUpperCase()}`
      : 'TẬP';

  const steps: { id: WayfinderStep; label: string; isUnavailable?: boolean }[] = [
    { id: 'gate', label: 'CỔNG' },
    { id: 'foyer', label: 'SẢNH' },
    { id: 'shelf', label: 'KỆ' },
    { id: 'book', label: 'BỘ', isUnavailable: !targetBook },
    { id: 'episode', label: episodeLabel, isUnavailable: !targetEpisode }
  ];

  // Adjacent & nearby episodes for 'episode' tray
  const episodeTrayData = useMemo(() => {
    if (!targetBook || targetBook.episodes.length === 0) {
      return { prevEp: null, nextEp: null, nearby: [] as HydratedEpisode[] };
    }
    const eps = targetBook.episodes;
    const curId = currentEpisode?.id || targetEpisode?.id;
    const idx = curId ? eps.findIndex((e) => e.id === curId) : 0;
    const safeIdx = idx >= 0 ? idx : 0;
    const start = Math.max(0, safeIdx - 2);
    const end = Math.min(eps.length, start + 6);
    const adjustedStart = Math.max(0, end - 6);
    return {
      prevEp: safeIdx > 0 ? eps[safeIdx - 1] : null,
      nextEp: safeIdx < eps.length - 1 ? eps[safeIdx + 1] : null,
      nearby: eps.slice(adjustedStart, end)
    };
  }, [currentEpisode?.id, targetBook, targetEpisode?.id]);

  // Books list for 'book' tray
  const bookTrayData = useMemo(() => {
    const sameHallBooks = books.filter((b) =>
      resolveBookHalls(b).some((h) => h.slug === targetHall.slug)
    );
    if (sameHallBooks.length <= 1 && books.length > 1) {
      return { heading: 'Các bộ sách trong Thư viện', items: books };
    }
    return { heading: `Bộ sách trên ${targetHall.title}`, items: sameHallBooks };
  }, [books, targetHall.slug, targetHall.title]);

  const backdropZ = elevateZIndex ? 'z-[55]' : 'z-30';
  const popoverZ = elevateZIndex ? 'z-[60]' : 'z-40';
  const popoverTop = elevateZIndex
    ? 'top-[122px] md:top-[136px]'
    : 'top-[74px] md:top-[88px]';

  return (
    <div
      className={`min-w-0 flex items-center ${
        disabled ? 'opacity-35 pointer-events-none' : ''
      }`}
    >
      <nav
        aria-label="Lộ trình thư viện"
        className="flex items-center min-w-0 overflow-x-auto no-scrollbar"
      >
        {steps.map((st, idx) => {
          const isCurrent = st.id === currentStep;
          const isDisabledStep = Boolean(disabled || (st.isUnavailable && !isCurrent));
          return (
            <React.Fragment key={st.id}>
              {idx > 0 && (
                <span
                  aria-hidden="true"
                  style={{ color: 'var(--border-hairline)' }}
                  className="px-[2px] min-[410px]:px-1 md:px-2 text-[13.5px] min-[390px]:text-[14.5px] md:text-[19px] font-semibold select-none shrink-0"
                >
                  /
                </span>
              )}
              <button
                type="button"
                disabled={isDisabledStep}
                aria-current={isCurrent ? 'page' : undefined}
                aria-expanded={isCurrent ? isOpen : undefined}
                onClick={() => handleStepClick(st.id)}
                style={{
                  color: isCurrent ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  borderBottom: isCurrent
                    ? '3px solid var(--accent-warm)'
                    : '3px solid transparent',
                  opacity: isDisabledStep && !disabled ? 0.4 : 1,
                  lineHeight: 1.45
                }}
                className={`h-[48px] md:h-[58px] px-[3px] min-[400px]:px-1 md:px-2 inline-flex items-center gap-0.5 md:gap-1 text-[13.5px] min-[385px]:text-[14.5px] min-[415px]:text-[15px] md:text-[20.5px] uppercase tracking-[0.02em] md:tracking-[0.04em] whitespace-nowrap shrink-0 transition hover:opacity-85 ${
                  isCurrent ? 'font-extrabold' : 'font-bold'
                }`}
              >
                <span
                  className={
                    st.id === 'episode'
                      ? 'truncate max-w-[82px] md:max-w-[150px] py-0.5'
                      : 'py-0.5'
                  }
                >
                  {st.label}
                </span>
                {isCurrent && (
                  <ChevronDownIcon
                    size={14}
                    strokeWidth={2}
                    className={`shrink-0 md:w-[18px] md:h-[18px] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Same-level Quick-Switch Tray (Rendered fixed outside overflow-x-auto nav) */}
      {isOpen && !disabled && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            className={`fixed inset-0 ${backdropZ} bg-black/20`}
          />
          <div
            role="dialog"
            aria-label="Chọn nhanh trong tầng hiện tại"
            className={`fixed left-0 right-0 ${popoverTop} ${popoverZ} ${
              elevateZIndex
                ? 'max-w-[480px] md:max-w-[820px]'
                : 'max-w-[480px] md:max-w-[1040px]'
            } mx-auto px-3 md:px-6`}
          >
            <div
              style={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-primary)'
              }}
              className={`rounded-[10px] p-3 shadow-lg space-y-2.5 ${
                elevateZIndex ? 'md:max-w-[420px] md:mx-auto' : 'md:max-w-[420px]'
              }`}
            >
              {currentStep === 'foyer' && (
                <>
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Lối tắt từ Không gian chung
                  </p>
                  {targetBook && targetEpisode && (
                    <button
                      type="button"
                      onClick={() => navigateToHref(`/episodes/${targetEpisode.id}`)}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="w-full px-3 py-2 rounded-[8px] flex items-center justify-between gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <p
                          className="text-[11px] truncate"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          {targetBook.title}
                        </p>
                        <p className="text-xs font-semibold font-editorial leading-[1.45] truncate">
                          Tập {targetEpisode.episodeCode}: {targetEpisode.title}
                        </p>
                      </div>
                      <ChevronRightIcon size={14} className="shrink-0 opacity-70" />
                    </button>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => navigateToHref('/books')}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <BookOpenIcon size={13} />
                      <span>Tất cả sách ({books.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToHref('/saved')}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <BookmarkIcon size={13} />
                      <span>Lưu trữ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onBeforeNavigate?.();
                        openUtilitySheet('search');
                      }}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <SearchIcon size={13} />
                      <span>Tìm kiếm</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onBeforeNavigate?.();
                        navigateToGate();
                      }}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--accent-warm)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <ArchDoorIcon size={13} />
                      <span>Ra Cổng</span>
                    </button>
                  </div>
                </>
              )}

              {currentStep === 'shelf' && (
                <>
                  <p
                    className="text-[11px] font-medium leading-[1.45]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {shelfBranch === 'all_books'
                      ? 'Đang xem: Tất cả sách'
                      : shelfBranch === 'saved'
                        ? 'Đang xem: Lưu trữ'
                        : `Đang ở: ${targetHall.title}`}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(litHalls.length > 0 ? litHalls : LIBRARY_HALLS).map((h) => {
                      const isActiveHall =
                        shelfBranch === 'hall' && h.slug === targetHall.slug;
                      return (
                        <button
                          key={h.slug}
                          type="button"
                          onClick={() => navigateToHref(`/halls/${h.slug}`)}
                          style={{
                            backgroundColor: isActiveHall
                              ? 'var(--accent-primary)'
                              : 'var(--bg-surface)',
                            color: isActiveHall
                              ? 'var(--accent-primary-fg)'
                              : 'var(--text-primary)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="h-8 px-2.5 rounded-[7px] text-xs font-medium"
                        >
                          {h.shortTitle}
                        </button>
                      );
                    })}
                  </div>
                  <div
                    style={{ borderTop: '1px solid var(--border-hairline)' }}
                    className="pt-2 flex items-center gap-1.5"
                  >
                    <button
                      type="button"
                      onClick={() => navigateToHref('/books')}
                      style={{
                        backgroundColor:
                          shelfBranch === 'all_books'
                            ? 'var(--accent-primary)'
                            : 'var(--bg-surface)',
                        color:
                          shelfBranch === 'all_books'
                            ? 'var(--accent-primary-fg)'
                            : 'var(--text-secondary)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <BookOpenIcon size={13} />
                      <span>Tất cả sách ({books.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateToHref('/saved')}
                      style={{
                        backgroundColor:
                          shelfBranch === 'saved'
                            ? 'var(--accent-primary)'
                            : 'var(--bg-surface)',
                        color:
                          shelfBranch === 'saved'
                            ? 'var(--accent-primary-fg)'
                            : 'var(--text-secondary)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <BookmarkIcon size={13} />
                      <span>Lưu trữ</span>
                    </button>
                  </div>
                </>
              )}

              {currentStep === 'book' && (
                <>
                  <p
                    className="text-[11px] font-medium leading-[1.45]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {bookTrayData.heading}
                  </p>
                  <div className="max-h-[240px] overflow-y-auto space-y-1">
                    {bookTrayData.items.map((b) => {
                      const isCurBook = currentBook?.id === b.id;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => navigateToHref(`/books/${b.slug}`)}
                          style={{
                            backgroundColor: isCurBook
                              ? 'var(--bg-surface)'
                              : 'transparent',
                            border: isCurBook
                              ? '1px solid var(--border-hairline)'
                              : '1px solid transparent'
                          }}
                          className="w-full px-2.5 py-2 rounded-[7px] flex items-center justify-between gap-2 text-left"
                        >
                          <span className="text-xs font-semibold font-editorial leading-[1.45] truncate">
                            {b.title}
                          </span>
                          <span
                            className="text-[11px] shrink-0 tabular-nums"
                            style={{
                              color: isCurBook
                                ? 'var(--accent-warm)'
                                : 'var(--text-secondary)'
                            }}
                          >
                            {isCurBook ? 'Đang xem' : `${b.episodes.length} tập`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div
                    style={{ borderTop: '1px solid var(--border-hairline)' }}
                    className="pt-2 flex justify-end"
                  >
                    <button
                      type="button"
                      onClick={() => navigateToHref('/books')}
                      style={{ color: 'var(--accent-primary)' }}
                      className="text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span>Mở Tất cả sách ({books.length})</span>
                      <ChevronRightIcon size={13} />
                    </button>
                  </div>
                </>
              )}

              {currentStep === 'episode' && targetBook && (
                <>
                  <p
                    className="text-[11px] font-medium leading-[1.45] truncate"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {targetBook.title}
                  </p>
                  <div className="flex items-center justify-between gap-1.5">
                    {episodeTrayData.prevEp ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigateToHref(`/episodes/${episodeTrayData.prevEp!.id}`)
                        }
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)',
                          color: 'var(--text-primary)'
                        }}
                        className="h-8 px-2.5 rounded-[7px] text-xs font-medium inline-flex items-center gap-1 shrink-0"
                      >
                        <ChevronLeftIcon size={12} />
                        <span>Tập {episodeTrayData.prevEp.episodeCode}</span>
                      </button>
                    ) : (
                      <span />
                    )}

                    <button
                      type="button"
                      onClick={() => navigateToHref(`/books/${targetBook.slug}`)}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--accent-primary)'
                      }}
                      className="h-8 px-2.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                    >
                      <BookOpenIcon size={12} />
                      <span>Mục lục ({targetBook.episodes.length} tập)</span>
                    </button>

                    {episodeTrayData.nextEp ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigateToHref(`/episodes/${episodeTrayData.nextEp!.id}`)
                        }
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)',
                          color: 'var(--accent-primary)'
                        }}
                        className="h-8 px-2.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Tập {episodeTrayData.nextEp.episodeCode}</span>
                        <ChevronRightIcon size={12} />
                      </button>
                    ) : (
                      <span />
                    )}
                  </div>

                  <div className="max-h-[210px] overflow-y-auto space-y-1 pt-0.5">
                    {episodeTrayData.nearby.map((ep) => {
                      const isCurEp = currentEpisode?.id === ep.id;
                      return (
                        <button
                          key={ep.id}
                          type="button"
                          onClick={() => navigateToHref(`/episodes/${ep.id}`)}
                          style={{
                            backgroundColor: isCurEp
                              ? 'var(--bg-surface)'
                              : 'transparent',
                            border: isCurEp
                              ? '1px solid var(--border-hairline)'
                              : '1px solid transparent'
                          }}
                          className="w-full px-2.5 py-1.5 rounded-[7px] flex items-center justify-between gap-2 text-left"
                        >
                          <span className="text-xs leading-[1.45] truncate">
                            <span
                              className="font-semibold mr-1 tabular-nums"
                              style={{
                                color: isCurEp
                                  ? 'var(--accent-warm)'
                                  : 'var(--accent-primary)'
                              }}
                            >
                              Tập {ep.episodeCode}:
                            </span>
                            <span className="font-editorial">{ep.title}</span>
                          </span>
                          <span
                            className="text-[11px] shrink-0"
                            style={{
                              color: isCurEp
                                ? 'var(--accent-warm)'
                                : 'var(--text-secondary)'
                            }}
                          >
                            {isCurEp ? 'Đang đọc' : 'Mở'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {currentStep === 'gate' && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onBeforeNavigate?.();
                      navigateToFoyer();
                    }}
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)'
                    }}
                    className="h-9 px-3 rounded-[8px] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Bước vào Không gian chung</span>
                    <ChevronRightIcon size={13} />
                  </button>
                  {targetBook && targetEpisode && (
                    <button
                      type="button"
                      onClick={() => navigateToHref(`/episodes/${targetEpisode.id}`)}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)',
                        color: 'var(--text-primary)'
                      }}
                      className="h-9 px-3 rounded-[8px] text-xs font-medium"
                    >
                      Đọc tiếp Tập {targetEpisode.episodeCode}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
