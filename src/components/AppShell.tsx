'use client';

import React, { useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BedtimeSleepChoice, useLibraryPlayer } from '@/context/LibraryPlayerContext';
import { resolveBookHall } from '@/lib/halls';
import { formatClock } from '@/lib/presets';
import { LibraryWayfinder } from './LibraryWayfinder';
import { SearchAndSavedSheet } from './SearchAndSavedSheet';
import {
  BookmarkIcon,
  BookOpenIcon,
  ChevronDownIcon,
  Forward15Icon,
  LockIcon,
  MicIcon,
  PauseIcon,
  PlayIcon,
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
    activeSleepChoice,
    sleepRemainingSeconds,
    isFullPlayerOpen,
    isKidLocked,
    favorites,
    hasPassedGate,
    toggleFavorite,
    togglePlayPause,
    seekTo,
    seekBy,
    switchVoice,
    skipPrev,
    skipNext,
    cyclePlaybackRate,
    selectSleepChoice,
    setFullPlayerOpen,
    setKidLocked,
    retryPlayback
  } = useLibraryPlayer();

  // Genuine 2-second press-and-hold Kid Lock unlock
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
  const isAtClosedGate = pathname === '/' && !hasPassedGate;
  const isReadingActivePlayingEpisode =
    isEpisodeReaderRoute && activeEpisode && pathname === `/episodes/${activeEpisode.id}`;

  // Zero-Tab Single-Axis Architecture: hide Mini-player & outer footer when standing outside at the Gate
  const showMiniPlayer =
    !isAdminRoute &&
    !isAtClosedGate &&
    Boolean(activeEpisode && activeTrack) &&
    !isReadingActivePlayingEpisode;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const sleepChoices: { key: BedtimeSleepChoice; label: string }[] = [
    { key: 'end_of_episode', label: 'Hết tập dừng êm' },
    {
      key: '15',
      label:
        activeSleepChoice === '15' && sleepRemainingSeconds !== null
          ? formatClock(sleepRemainingSeconds)
          : '15p'
    },
    {
      key: '30',
      label:
        activeSleepChoice === '30' && sleepRemainingSeconds !== null
          ? formatClock(sleepRemainingSeconds)
          : '30p'
    },
    { key: 'continuous', label: 'Liên tiếp' }
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-[480px] mx-auto relative bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <main
        className={`flex-1 flex flex-col ${
          showMiniPlayer ? 'pb-[88px]' : isAtClosedGate ? 'pb-0' : 'pb-4'
        }`}
      >
        <div className="flex-1 flex flex-col">{children}</div>
        {!isAdminRoute && !isEpisodeReaderRoute && !isAtClosedGate && (
          <footer className="px-4 pt-3 pb-4 text-center">
            <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              Copyright &copy; Nancy &amp; Liti
            </p>
          </footer>
        )}
      </main>

      {/* Persistent Mini-Player Bar anchored directly at the bottom (58px freed by removing Bottom Tab Bar) */}
      {showMiniPlayer && activeEpisode && activeBook && (
        <div className="fixed left-0 right-0 bottom-3 z-30 max-w-[480px] mx-auto px-4 pb-[env(safe-area-inset-bottom)]">
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

      {/* Utility Bottom Sheet for Search & Saved Archive */}
      {!isAdminRoute && <SearchAndSavedSheet />}

      {/* Màn hình 4: Full-screen Sleep Audio Player Drawer */}
      {isFullPlayerOpen && activeEpisode && activeBook && activeTrack && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Trình phát sách nói toàn màn hình"
          style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
          className="fixed inset-0 z-50 flex flex-col justify-between max-w-[480px] mx-auto px-5 pt-3 pb-[max(28px,calc(env(safe-area-inset-bottom)+16px))] overflow-y-auto"
        >
          {/* Top bar + Pinned 5-Step Wayfinder */}
          <div>
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

            {!isKidLocked && (
              <div
                style={{ borderBottom: '1px solid var(--border-hairline)' }}
                className="py-1 mt-1 flex items-center justify-center"
              >
                <LibraryWayfinder
                  currentStep="episode"
                  currentHall={resolveBookHall(activeBook)}
                  currentBook={activeBook}
                  currentEpisode={activeEpisode}
                  elevateZIndex
                  onBeforeNavigate={() => setFullPlayerOpen(false)}
                />
              </div>
            )}
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

            <h2 className="text-[19px] font-bold mt-4 font-editorial line-clamp-2">
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

          {/* Scrubber & Bedtime Transport Controls */}
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

                {/* One-Tap Bedtime Sleep Timer Bar + Playback Speed */}
                <div className="flex items-center gap-2 pt-1 text-[11.5px]">
                  <div
                    role="group"
                    aria-label="Hẹn giờ ru ngủ 1 chạm"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="flex-1 h-11 rounded-[9px] p-1 flex items-center gap-1 min-w-0"
                  >
                    {sleepChoices.map((choice) => {
                      const active = activeSleepChoice === choice.key;
                      return (
                        <button
                          key={choice.key}
                          type="button"
                          onClick={() => selectSleepChoice(choice.key)}
                          style={{
                            backgroundColor: active ? 'var(--bg-elevated)' : 'transparent',
                            color: active
                              ? choice.key === 'continuous'
                                ? 'var(--accent-primary)'
                                : 'var(--accent-warm)'
                              : 'var(--text-secondary)',
                            border: active
                              ? '1px solid var(--border-hairline)'
                              : '1px solid transparent'
                          }}
                          className={`h-9 rounded-[7px] font-medium tabular-nums transition whitespace-nowrap ${
                            choice.key === 'end_of_episode'
                              ? 'px-2.5 flex-1 truncate'
                              : 'px-2 shrink-0'
                          }`}
                        >
                          {choice.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    aria-label="Đổi tốc độ đọc"
                    onClick={cyclePlaybackRate}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      color: 'var(--text-primary)'
                    }}
                    className="px-3 h-11 rounded-[9px] font-medium tabular-nums shrink-0"
                  >
                    {playbackRate}x
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
