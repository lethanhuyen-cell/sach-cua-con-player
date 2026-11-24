'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SleepTimerMode, useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { formatClock } from '@/lib/presets';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ClockIcon,
  Forward15Icon,
  HomeIcon,
  LibraryIcon,
  LockIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  Rewind15Icon,
  SkipNextIcon,
  SkipPrevIcon,
  UnlockIcon
} from './Icons';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const {
    activeBook,
    activeEpisode,
    activeTrack,
    isPlaying,
    isBuffering,
    playerError,
    currentTime,
    duration,
    playbackRate,
    autoNext,
    sleepTimerMode,
    sleepRemainingSeconds,
    isFullPlayerOpen,
    isKidLocked,
    favorites,
    toggleFavorite,
    togglePlayPause,
    seekTo,
    seekBy,
    switchVoice,
    skipPrev,
    skipNext,
    cyclePlaybackRate,
    toggleAutoNext,
    setSleepTimer,
    setFullPlayerOpen,
    setKidLocked,
    retryPlayback
  } = useLibraryPlayer();

  // Genuine 2-second press-and-hold Kid Lock unlock (PLY-010, AC-09)
  const [unlockProgress, setUnlockProgress] = useState(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startUnlockHold = () => {
    const started = Date.now();
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(100, Math.round((elapsed / 2000) * 100));
      setUnlockProgress(pct);
      if (elapsed >= 2000) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
        setUnlockProgress(0);
        setKidLocked(false);
      }
    }, 50);
  };

  const cancelUnlockHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setUnlockProgress(0);
  };

  const isAdminRoute = pathname.startsWith('/admin');
  const isEpisodeReaderRoute = pathname.startsWith('/episodes/');
  const isReadingActivePlayingEpisode =
    isEpisodeReaderRoute && activeEpisode && pathname === `/episodes/${activeEpisode.id}`;

  const showBottomNav = !isAdminRoute && !isEpisodeReaderRoute;
  const showMiniPlayer =
    !isAdminRoute && Boolean(activeEpisode && activeTrack) && !isReadingActivePlayingEpisode;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const cycleSleepTimer = () => {
    const order: SleepTimerMode[] = ['off', '10', '15', '30', '45', 'end_of_episode'];
    const next = order[(order.indexOf(sleepTimerMode) + 1) % order.length];
    setSleepTimer(next);
  };

  const sleepLabel =
    sleepTimerMode === 'off'
      ? 'Hẹn giờ'
      : sleepTimerMode === 'end_of_episode'
        ? 'Hết tập'
        : sleepRemainingSeconds !== null
          ? formatClock(sleepRemainingSeconds)
          : `${sleepTimerMode}p`;

  return (
    <div className="min-h-screen flex flex-col max-w-[480px] mx-auto relative bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <main
        className={`flex-1 flex flex-col ${
          showBottomNav && showMiniPlayer
            ? 'pb-[132px]'
            : showBottomNav
              ? 'pb-[68px]'
              : showMiniPlayer
                ? 'pb-[76px]'
                : ''
        }`}
      >
        <div className="flex-1 flex flex-col">{children}</div>
        {!isAdminRoute && !isEpisodeReaderRoute && (
          <footer className="px-4 pt-4 pb-5 text-center">
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Copyright &copy; Nancy &amp; Liti
            </p>
          </footer>
        )}
      </main>

      {/* Persistent Mini-Player Bar (Hidden on /admin and when reading the active episode) */}
      {showMiniPlayer && activeEpisode && activeBook && (
        <div
          className={`fixed left-0 right-0 z-30 max-w-[480px] mx-auto px-4 ${
            showBottomNav ? 'bottom-[64px]' : 'bottom-3'
          }`}
        >
          <div
            onClick={() => setFullPlayerOpen(true)}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] overflow-hidden cursor-pointer shadow-sm"
          >
            <div className="h-[2px] w-full bg-[var(--bg-surface)]">
              <div
                className="h-full transition-all duration-200"
                style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent-warm)' }}
              />
            </div>
            <div className="px-3 py-2 flex items-center gap-3 h-[58px]">
              <div
                className="w-9 h-12 rounded-[5px] overflow-hidden shrink-0"
                style={{ border: '1px solid var(--border-hairline)' }}
              >
                <img
                  src={activeEpisode.effectiveCoverUrl}
                  alt={activeEpisode.title}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="vn-eyebrow truncate"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {isBuffering ? 'Đang đệm âm thanh...' : activeBook.title}
                </div>
                <div className="text-xs font-semibold truncate font-editorial">
                  {activeEpisode.title}
                </div>
              </div>
              <button
                type="button"
                aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlayPause();
                }}
                style={{
                  color: 'var(--accent-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              >
                {isPlaying ? <PauseIcon size={15} /> : <PlayIcon size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Tab Bottom Navigation Bar (58px, Thumb-zone friendly) */}
      {showBottomNav && (
        <nav
          aria-label="Điều hướng chính"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border-hairline)'
          }}
          className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto h-[58px] px-3 flex items-center justify-around"
        >
          {[
            { href: '/', label: 'Thư viện', icon: HomeIcon, match: pathname === '/' },
            {
              href: '/books',
              label: 'Tủ sách',
              icon: LibraryIcon,
              match: pathname.startsWith('/books')
            },
            {
              href: '/saved',
              label: 'Lưu trữ',
              icon: BookmarkIcon,
              match: pathname.startsWith('/saved')
            }
          ].map((tab) => {
            const IconComp = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                style={{
                  color: tab.match ? 'var(--accent-primary)' : 'var(--text-secondary)'
                }}
                className="min-w-[104px] h-[48px] flex flex-col items-center justify-center transition"
              >
                <IconComp size={18} filled={tab.match && tab.href === '/saved'} />
                <span className={`text-[11px] mt-1 ${tab.match ? 'font-semibold' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Màn hình 5: Full-screen Audio Player Drawer */}
      {isFullPlayerOpen && activeEpisode && activeBook && activeTrack && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Trình phát sách nói toàn màn hình"
          style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
          className="fixed inset-0 z-50 flex flex-col justify-between max-w-[480px] mx-auto px-6 pt-3 pb-7 overflow-y-auto"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Thu gọn trình phát"
              disabled={isKidLocked}
              onClick={() => setFullPlayerOpen(false)}
              style={{ opacity: isKidLocked ? 0.3 : 1 }}
              className="w-11 h-11 flex items-center justify-center"
            >
              <ChevronDownIcon size={22} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isKidLocked) setKidLocked(true);
              }}
              style={{
                backgroundColor: isKidLocked ? 'var(--accent-warm)' : 'transparent',
                color: isKidLocked ? '#1B140A' : 'var(--text-secondary)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-10 px-3.5 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5"
            >
              {isKidLocked ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
              <span>{isKidLocked ? 'Đã khóa chạm' : 'Khóa chạm'}</span>
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Đánh dấu yêu thích"
                disabled={isKidLocked}
                onClick={() => toggleFavorite(activeEpisode.id)}
                style={{
                  color: favorites.includes(activeEpisode.id)
                    ? 'var(--accent-berry)'
                    : 'var(--text-secondary)',
                  opacity: isKidLocked ? 0.3 : 1
                }}
                className="w-11 h-11 flex items-center justify-center"
              >
                <BookmarkIcon size={18} filled={favorites.includes(activeEpisode.id)} />
              </button>
              <button
                type="button"
                aria-label="Mở trang đọc chữ"
                disabled={isKidLocked}
                onClick={() => {
                  setFullPlayerOpen(false);
                  router.push(`/episodes/${activeEpisode.id}`);
                }}
                style={{ opacity: isKidLocked ? 0.3 : 1 }}
                className="w-11 h-11 flex items-center justify-center"
              >
                <BookOpenIcon size={19} />
              </button>
            </div>
          </div>

          {/* Center 3:4 Cover & Voice Selector */}
          <div className="my-3 flex flex-col items-center text-center">
            <div
              className="w-[224px] aspect-[3/4] rounded-[8px] overflow-hidden"
              style={{
                border: '1px solid var(--border-hairline)',
                backgroundColor: 'var(--bg-elevated)'
              }}
            >
              <img
                src={activeEpisode.effectiveCoverUrl}
                alt={activeEpisode.title}
                className="w-full h-full object-cover block"
              />
            </div>

            <h2 className="text-[19px] font-bold mt-5 font-editorial line-clamp-2">
              {activeEpisode.title}
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeBook.title} · Tập {activeEpisode.episodeCode}
            </p>

            {activeEpisode.audioTracks.length > 1 ? (
              <div className="mt-3" style={{ opacity: isKidLocked ? 0.35 : 1 }}>
                <label className="sr-only" htmlFor="player-voice-select">
                  Chọn giọng đọc
                </label>
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-hairline)',
                    color: 'var(--accent-primary)'
                  }}
                  className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[8px] text-xs font-medium"
                >
                  <MicIcon size={14} />
                  <select
                    id="player-voice-select"
                    disabled={isKidLocked}
                    value={activeTrack.voiceProfile.voiceKey}
                    onChange={(e) => switchVoice(e.target.value)}
                    className="bg-transparent outline-none font-medium pr-1 cursor-pointer"
                  >
                    {activeEpisode.audioTracks.map((trk) => (
                      <option key={trk.id} value={trk.voiceProfile.voiceKey}>
                        {trk.voiceProfile.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-secondary)'
                }}
                className="mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[8px] text-xs"
              >
                <MicIcon size={13} />
                <span>{activeTrack.voiceProfile.displayName}</span>
              </div>
            )}

            {playerError && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="mt-3 px-3.5 py-2 rounded-[8px] text-xs flex items-center gap-2"
              >
                <span style={{ color: 'var(--accent-berry)' }}>{playerError}</span>
                <button
                  type="button"
                  onClick={retryPlayback}
                  style={{ color: 'var(--accent-primary)' }}
                  className="font-semibold underline shrink-0"
                >
                  Thử lại
                </button>
              </div>
            )}
          </div>

          {/* Scrubber & Transport Controls */}
          <div className="space-y-4">
            <div style={{ opacity: isKidLocked ? 0.3 : 1 }}>
              <input
                type="range"
                aria-label="Thanh thời gian"
                disabled={isKidLocked}
                min={0}
                max={Math.max(1, Math.floor(duration || 1))}
                value={Math.floor(currentTime)}
                onChange={(e) => seekTo(Number(e.target.value))}
                style={{ accentColor: 'var(--accent-warm)' }}
                className="w-full h-2 rounded-full cursor-pointer"
              />
              <div
                className="flex justify-between text-xs mt-1 tabular-nums"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span>{formatClock(currentTime)}</span>
                <span>{formatClock(duration)}</span>
              </div>
            </div>

            {isKidLocked ? (
              <div className="py-2 text-center">
                <button
                  type="button"
                  onPointerDown={startUnlockHold}
                  onPointerUp={cancelUnlockHold}
                  onPointerLeave={cancelUnlockHold}
                  onPointerCancel={cancelUnlockHold}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="relative overflow-hidden px-5 h-12 rounded-[8px] text-xs font-semibold inline-flex items-center gap-2 select-none"
                >
                  <span
                    className="absolute left-0 top-0 bottom-0 opacity-25 transition-all"
                    style={{
                      width: `${unlockProgress}%`,
                      backgroundColor: 'var(--accent-warm)'
                    }}
                  />
                  <LockIcon size={14} />
                  <span>Chạm giữ 2 giây để mở khóa</span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-2">
                  <button
                    type="button"
                    aria-label="Tập trước"
                    onClick={skipPrev}
                    style={{ color: 'var(--text-secondary)' }}
                    className="w-11 h-11 flex items-center justify-center"
                  >
                    <SkipPrevIcon size={19} />
                  </button>
                  <button
                    type="button"
                    aria-label="Tua lùi 15 giây"
                    onClick={() => seekBy(-15)}
                    className="w-12 h-12 flex flex-col items-center justify-center gap-0.5"
                  >
                    <Rewind15Icon size={19} />
                    <span className="text-[10px] tabular-nums">15s</span>
                  </button>
                  <button
                    type="button"
                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                    onClick={togglePlayPause}
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: 'var(--accent-primary-fg)'
                    }}
                    className="w-[60px] h-[60px] rounded-full flex items-center justify-center"
                  >
                    {isPlaying ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
                  </button>
                  <button
                    type="button"
                    aria-label="Tua tới 15 giây"
                    onClick={() => seekBy(15)}
                    className="w-12 h-12 flex flex-col items-center justify-center gap-0.5"
                  >
                    <Forward15Icon size={19} />
                    <span className="text-[10px] tabular-nums">15s</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Tập tiếp theo"
                    onClick={skipNext}
                    style={{ color: 'var(--text-secondary)' }}
                    className="w-11 h-11 flex items-center justify-center"
                  >
                    <SkipNextIcon size={19} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={cycleSleepTimer}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      color:
                        sleepTimerMode !== 'off'
                          ? 'var(--accent-warm)'
                          : 'var(--text-secondary)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="flex-1 h-11 rounded-[8px] font-medium inline-flex items-center justify-center gap-1.5 tabular-nums"
                  >
                    <ClockIcon size={14} />
                    <span>{sleepLabel}</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Đổi tốc độ đọc"
                    onClick={cyclePlaybackRate}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="px-3.5 h-11 rounded-[8px] font-medium tabular-nums"
                  >
                    {playbackRate}x
                  </button>
                  <button
                    type="button"
                    onClick={toggleAutoNext}
                    style={{
                      backgroundColor: autoNext
                        ? 'var(--accent-primary)'
                        : 'var(--bg-surface)',
                      color: autoNext
                        ? 'var(--accent-primary-fg)'
                        : 'var(--text-secondary)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="px-3.5 h-11 rounded-[8px] font-medium inline-flex items-center gap-1.5"
                  >
                    <RepeatIcon size={14} />
                    <span>Tự tiếp</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
