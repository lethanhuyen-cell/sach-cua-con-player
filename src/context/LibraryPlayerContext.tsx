'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  HydratedAudioTrack,
  HydratedBook,
  HydratedEpisode,
  LocalEpisodeProgress
} from '@/lib/types';

export type SleepTimerMode = 'off' | '10' | '15' | '30' | '45' | 'end_of_episode';
export type PlaybackRateOption = 0.85 | 1.0 | 1.15 | 1.25;

interface ContinueSuggestion {
  kind: 'in_progress' | 'next_up';
  book: HydratedBook;
  episode: HydratedEpisode;
  progressSeconds: number;
  durationSeconds: number;
}

interface LibraryPlayerContextValue {
  books: HydratedBook[];
  isNight: boolean;
  toggleNight: () => void;
  favorites: string[];
  toggleFavorite: (episodeId: string) => void;
  progressMap: Record<string, LocalEpisodeProgress>;
  preferredVoiceKey: string;
  selectVoicePreference: (voiceKey: string) => void;
  readerFontSize: number;
  adjustReaderFontSize: (delta: number) => void;

  // Player state
  activeBook: HydratedBook | null;
  activeEpisode: HydratedEpisode | null;
  activeTrack: HydratedAudioTrack | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playerError: string | null;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRateOption;
  autoNext: boolean;
  sleepTimerMode: SleepTimerMode;
  sleepRemainingSeconds: number | null;
  isFullPlayerOpen: boolean;
  isKidLocked: boolean;

  // Player actions
  playEpisode: (book: HydratedBook, episode: HydratedEpisode, voiceKey?: string) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  seekBy: (deltaSeconds: number) => void;
  switchVoice: (voiceKey: string) => void;
  skipPrev: () => void;
  skipNext: () => void;
  cyclePlaybackRate: () => void;
  toggleAutoNext: () => void;
  setSleepTimer: (mode: SleepTimerMode) => void;
  setFullPlayerOpen: (open: boolean) => void;
  setKidLocked: (locked: boolean) => void;
  retryPlayback: () => void;
  continueItems: ContinueSuggestion[];
}

const LibraryPlayerContext = createContext<LibraryPlayerContextValue | null>(null);

const STORAGE_KEYS = {
  theme: 'litibook_theme_v1',
  favorites: 'litibook_favorites_v1',
  progress: 'litibook_progress_v1',
  voice: 'litibook_preferred_voice_v1',
  fontSize: 'litibook_reader_fontsize_v1'
};

export function LibraryPlayerProvider({
  initialBooks,
  children
}: {
  initialBooks: HydratedBook[];
  children: React.ReactNode;
}) {
  const [books, setBooks] = useState<HydratedBook[]>(initialBooks);
  const [isNight, setIsNight] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LocalEpisodeProgress>>({});
  const [preferredVoiceKey, setPreferredVoiceKey] = useState<string>('female_my_duyen');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);

  const [activeBookId, setActiveBookId] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<PlaybackRateOption>(1.0);
  const [autoNext, setAutoNext] = useState(false);
  const [sleepTimerMode, setSleepTimerMode] = useState<SleepTimerMode>('off');
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);
  const [isFullPlayerOpen, setFullPlayerOpen] = useState(false);
  const [isKidLocked, setKidLocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSaveWallMs = useRef<number>(0);
  const sleepDeadlineMs = useRef<number | null>(null);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  // Hydrate preferences & local progress from localStorage + clear any legacy static Service Worker
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {});
      }
    } catch {}
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
      if (savedTheme === 'night') {
        setIsNight(true);
        document.documentElement.classList.add('dark');
      }
      const savedFavs = localStorage.getItem(STORAGE_KEYS.favorites);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedProg = localStorage.getItem(STORAGE_KEYS.progress);
      if (savedProg) setProgressMap(JSON.parse(savedProg));

      const savedVoice = localStorage.getItem(STORAGE_KEYS.voice);
      if (savedVoice) setPreferredVoiceKey(savedVoice);

      const savedFont = Number(localStorage.getItem(STORAGE_KEYS.fontSize));
      if (savedFont >= 16 && savedFont <= 22) setReaderFontSize(savedFont);
    } catch {}
  }, []);

  // Refresh published library when app returns to foreground (PUB-003)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetch('/api/library')
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.books) setBooks(data.books);
          })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const toggleNight = useCallback(() => {
    setIsNight((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        try {
          localStorage.setItem(STORAGE_KEYS.theme, 'night');
        } catch {}
      } else {
        document.documentElement.classList.remove('dark');
        try {
          localStorage.setItem(STORAGE_KEYS.theme, 'day');
        } catch {}
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((episodeId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(episodeId)
        ? prev.filter((x) => x !== episodeId)
        : [...prev, episodeId];
      try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const adjustReaderFontSize = useCallback((delta: number) => {
    setReaderFontSize((prev) => {
      const next = Math.min(22, Math.max(16, prev + delta));
      try {
        localStorage.setItem(STORAGE_KEYS.fontSize, String(next));
      } catch {}
      return next;
    });
  }, []);

  const activeBook = useMemo(
    () => books.find((b) => b.id === activeBookId) || null,
    [books, activeBookId]
  );

  const activeEpisode = useMemo(
    () => activeBook?.episodes.find((e) => e.id === activeEpisodeId) || null,
    [activeBook, activeEpisodeId]
  );

  const activeTrack = useMemo(
    () => activeEpisode?.audioTracks.find((t) => t.id === activeTrackId) || null,
    [activeEpisode, activeTrackId]
  );

  const persistProgress = useCallback(
    (
      bookId: string,
      episodeId: string,
      voiceKey: string,
      trackUpdatedAt: string,
      posSec: number,
      durSec: number
    ) => {
      if (!durSec || durSec <= 0) return;
      const ratio = posSec / durSec;
      const completed = ratio >= 0.95 || durSec - posSec < 15;
      const entry: LocalEpisodeProgress = {
        episodeId,
        bookId,
        voiceKey,
        trackUpdatedAt,
        positionSeconds: Math.floor(posSec),
        durationSeconds: Math.floor(durSec),
        completed,
        updatedAt: Date.now()
      };
      setProgressMap((prev) => {
        const next = { ...prev, [episodeId]: entry };
        try {
          localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    []
  );

  const selectBestTrack = useCallback(
    (ep: HydratedEpisode, requestedVoiceKey?: string): HydratedAudioTrack | null => {
      if (ep.isTextOnly || ep.audioTracks.length === 0) return null;
      const targetKey = requestedVoiceKey || preferredVoiceKey;
      return (
        ep.audioTracks.find((t) => t.voiceProfile.voiceKey === targetKey) ||
        ep.audioTracks.find((t) => t.isDefault) ||
        ep.audioTracks[0]
      );
    },
    [preferredVoiceKey]
  );

  const playEpisode = useCallback(
    (book: HydratedBook, episode: HydratedEpisode, voiceKey?: string) => {
      const track = selectBestTrack(episode, voiceKey);
      if (!track) return;

      // Toggle if already loaded on this exact track
      if (activeEpisodeId === episode.id && activeTrackId === track.id && audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
        return;
      }

      setActiveBookId(book.id);
      setActiveEpisodeId(episode.id);
      setActiveTrackId(track.id);
      setAutoNext(book.defaultAutoNext);
      setPlayerError(null);

      const saved = progressMap[episode.id];
      let startSec = 0;
      // PUB-003 / AC-11 & PLY-004: Resume safely; reset to 00:00 if completed or replaced track is shorter
      if (saved && !saved.completed) {
        const expectedDur = track.durationSeconds || saved.durationSeconds || 0;
        const durationChangedDrastically =
          saved.trackUpdatedAt !== track.updatedAt &&
          expectedDur > 0 &&
          (saved.positionSeconds >= expectedDur ||
            Math.abs(expectedDur - saved.durationSeconds) / Math.max(1, saved.durationSeconds) >
              0.1);
        if (!durationChangedDrastically) {
          startSec = Math.max(0, saved.positionSeconds - 2.5);
        }
      }

      const audio = audioRef.current;
      if (audio) {
        audio.src = track.audioUrl;
        audio.playbackRate = playbackRate;
        audio.volume = 1;
        const onLoaded = () => {
          if (startSec > 0 && startSec < (audio.duration || Infinity)) {
            audio.currentTime = startSec;
            setCurrentTime(startSec);
          } else {
            audio.currentTime = 0;
            setCurrentTime(0);
          }
          setDuration(audio.duration || track.durationSeconds || 0);
          audio.play().catch(() => {});
          audio.removeEventListener('loadedmetadata', onLoaded);
        };
        audio.addEventListener('loadedmetadata', onLoaded);
        audio.load();
      }
    },
    [activeEpisodeId, activeTrackId, playbackRate, progressMap, selectBestTrack]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (audio.paused) {
      audio.volume = 1;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [activeTrack]);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.max(0, Math.min(seconds, audio.duration || duration || 0));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
    },
    [duration]
  );

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo((audio.currentTime || 0) + deltaSeconds);
    },
    [seekTo]
  );

  // PLY-005 & AC-03: Linear proportional voice switch + save preferred voice_key
  const switchVoice = useCallback(
    (voiceKey: string) => {
      if (!activeBook || !activeEpisode) return;
      const newTrack = activeEpisode.audioTracks.find(
        (t) => t.voiceProfile.voiceKey === voiceKey
      );
      if (!newTrack || newTrack.id === activeTrack?.id) return;

      setPreferredVoiceKey(voiceKey);
      try {
        localStorage.setItem(STORAGE_KEYS.voice, voiceKey);
      } catch {}

      const audio = audioRef.current;
      if (!audio) return;

      const wasPlaying = !audio.paused;
      const oldDur = audio.duration || activeTrack?.durationSeconds || 1;
      const ratio = Math.max(0, Math.min(1, (audio.currentTime || 0) / Math.max(1, oldDur)));

      setActiveTrackId(newTrack.id);
      setPlayerError(null);
      audio.src = newTrack.audioUrl;
      audio.playbackRate = playbackRate;

      const onLoaded = () => {
        const newDur = audio.duration || newTrack.durationSeconds || oldDur;
        const mappedPos = Math.max(0, Math.min(newDur, ratio * newDur));
        audio.currentTime = mappedPos;
        setCurrentTime(mappedPos);
        setDuration(newDur);
        if (wasPlaying) {
          audio.play().catch(() => {});
        }
        audio.removeEventListener('loadedmetadata', onLoaded);
      };
      audio.addEventListener('loadedmetadata', onLoaded);
      audio.load();
    },
    [activeBook, activeEpisode, activeTrack, playbackRate]
  );

  const selectVoicePreference = useCallback(
    (voiceKey: string) => {
      setPreferredVoiceKey(voiceKey);
      try {
        localStorage.setItem(STORAGE_KEYS.voice, voiceKey);
      } catch {}
      if (activeBook && activeEpisode) {
        const hasVoice = activeEpisode.audioTracks.some(
          (t) => t.voiceProfile.voiceKey === voiceKey
        );
        if (hasVoice) {
          switchVoice(voiceKey);
        }
      }
    },
    [activeBook, activeEpisode, switchVoice]
  );

  // PLY-007 & AC-10: Skip across episodes in book, skipping Text-Only episodes
  const findAdjacentAudioEpisode = useCallback(
    (dir: -1 | 1): HydratedEpisode | null => {
      if (!activeBook || !activeEpisode) return null;
      const audioEps = activeBook.episodes.filter(
        (e) => !e.isTextOnly && e.audioTracks.length > 0
      );
      const idx = audioEps.findIndex((e) => e.id === activeEpisode.id);
      if (idx === -1) return null;
      return audioEps[idx + dir] || null;
    },
    [activeBook, activeEpisode]
  );

  const skipPrev = useCallback(() => {
    const prev = findAdjacentAudioEpisode(-1);
    if (prev && activeBook) playEpisode(activeBook, prev);
  }, [activeBook, findAdjacentAudioEpisode, playEpisode]);

  const skipNext = useCallback(() => {
    const next = findAdjacentAudioEpisode(1);
    if (next && activeBook) playEpisode(activeBook, next);
  }, [activeBook, findAdjacentAudioEpisode, playEpisode]);

  const cyclePlaybackRate = useCallback(() => {
    const rates: PlaybackRateOption[] = [0.85, 1.0, 1.15, 1.25];
    setPlaybackRate((prev) => {
      const next = rates[(rates.indexOf(prev) + 1) % rates.length];
      if (audioRef.current) audioRef.current.playbackRate = next;
      return next;
    });
  }, []);

  const toggleAutoNext = useCallback(() => {
    setAutoNext((prev) => !prev);
  }, []);

  const setSleepTimer = useCallback((mode: SleepTimerMode) => {
    setSleepTimerMode(mode);
    if (audioRef.current) audioRef.current.volume = 1;
    if (mode === 'off' || mode === 'end_of_episode') {
      sleepDeadlineMs.current = null;
      setSleepRemainingSeconds(null);
      return;
    }
    const mins = Number(mode);
    const totalSec = mins * 60;
    sleepDeadlineMs.current = Date.now() + totalSec * 1000;
    setSleepRemainingSeconds(totalSec);
  }, []);

  const retryPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    const savedPos = currentTime;
    setPlayerError(null);
    audio.load();
    const onLoaded = () => {
      audio.currentTime = savedPos;
      audio.play().catch(() => {});
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
    audio.addEventListener('loadedmetadata', onLoaded);
  }, [activeTrack, currentTime]);

  // Sleep Timer countdown + 8s gentle fade-out (PLY-006, AC-02)
  useEffect(() => {
    if (!sleepDeadlineMs.current || sleepTimerMode === 'off' || sleepTimerMode === 'end_of_episode') {
      return;
    }
    const timer = setInterval(() => {
      if (!sleepDeadlineMs.current) return;
      const remMs = sleepDeadlineMs.current - Date.now();
      const remSec = Math.max(0, Math.ceil(remMs / 1000));
      setSleepRemainingSeconds(remSec);

      const audio = audioRef.current;
      if (audio && !audio.paused) {
        if (remMs <= 8000 && remMs > 0) {
          try {
            audio.volume = Math.max(0.02, remMs / 8000);
          } catch {}
        }
        if (remMs <= 0) {
          audio.pause();
          try {
            audio.volume = 1;
          } catch {}
          sleepDeadlineMs.current = null;
          setSleepTimerMode('off');
          setSleepRemainingSeconds(null);
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [sleepTimerMode]);

  // Media Session API for Lock Screen Controls (PLY-003, AC-02)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!activeBook || !activeEpisode) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeEpisode.title,
        artist: activeBook.title,
        album: activeTrack?.voiceProfile.displayName || 'Thư viện Đồi Mơ',
        artwork: [
          {
            src: activeEpisode.effectiveCoverUrl,
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler('seekbackward', () => seekBy(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => seekBy(15));
      navigator.mediaSession.setActionHandler('previoustrack', skipPrev);
      navigator.mediaSession.setActionHandler('nexttrack', skipNext);
    } catch {}
  }, [activeBook, activeEpisode, activeTrack, seekBy, skipNext, skipPrev]);

  // Save progress on pagehide
  useEffect(() => {
    const onHide = () => {
      const audio = audioRef.current;
      if (audio && activeBook && activeEpisode && activeTrack) {
        persistProgress(
          activeBook.id,
          activeEpisode.id,
          activeTrack.voiceProfile.voiceKey,
          activeTrack.updatedAt,
          audio.currentTime,
          audio.duration || activeTrack.durationSeconds
        );
      }
    };
    window.addEventListener('pagehide', onHide);
    return () => window.removeEventListener('pagehide', onHide);
  }, [activeBook, activeEpisode, activeTrack, persistProgress]);

  // Smart Continue Suggestions (LIS-002, DEC-04, AC-01)
  const continueItems = useMemo<ContinueSuggestion[]>(() => {
    const entries = Object.values(progressMap).sort((a, b) => b.updatedAt - a.updatedAt);
    const results: ContinueSuggestion[] = [];
    const seenEpisodes = new Set<string>();

    for (const entry of entries) {
      const book = books.find((b) => b.id === entry.bookId);
      if (!book) continue;
      const epIdx = book.episodes.findIndex((e) => e.id === entry.episodeId);
      if (epIdx === -1) continue;
      const ep = book.episodes[epIdx];

      if (!entry.completed && !ep.isTextOnly && ep.audioTracks.length > 0) {
        if (!seenEpisodes.has(ep.id)) {
          seenEpisodes.add(ep.id);
          results.push({
            kind: 'in_progress',
            book,
            episode: ep,
            progressSeconds: entry.positionSeconds,
            durationSeconds: entry.durationSeconds || ep.audioTracks[0]?.durationSeconds || 0
          });
        }
      } else if (entry.completed) {
        // Suggest next audio episode in same book (DEC-04, skipping Text-Only)
        const nextEp = book.episodes
          .slice(epIdx + 1)
          .find((cand) => !cand.isTextOnly && cand.audioTracks.length > 0);
        if (nextEp && !seenEpisodes.has(nextEp.id) && !progressMap[nextEp.id]?.completed) {
          seenEpisodes.add(nextEp.id);
          results.push({
            kind: 'next_up',
            book,
            episode: nextEp,
            progressSeconds: 0,
            durationSeconds: nextEp.audioTracks[0]?.durationSeconds || 0
          });
        }
      }
    }
    return results;
  }, [books, progressMap]);

  return (
    <LibraryPlayerContext.Provider
      value={{
        books,
        isNight,
        toggleNight,
        favorites,
        toggleFavorite,
        progressMap,
        preferredVoiceKey,
        selectVoicePreference,
        readerFontSize,
        adjustReaderFontSize,
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
        playEpisode,
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
        retryPlayback,
        continueItems
      }}
    >
      {children}
      {/* Persistent Singleton Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          const audio = audioRef.current;
          if (audio && activeBook && activeEpisode && activeTrack) {
            persistProgress(
              activeBook.id,
              activeEpisode.id,
              activeTrack.voiceProfile.voiceKey,
              activeTrack.updatedAt,
              audio.currentTime,
              audio.duration || activeTrack.durationSeconds
            );
          }
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setPlayerError(null);
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          setCurrentTime(el.currentTime);
          if (el.duration && Number.isFinite(el.duration)) {
            setDuration(el.duration);
          }
          const now = Date.now();
          if (now - lastSaveWallMs.current >= 5000 && activeBook && activeEpisode && activeTrack) {
            lastSaveWallMs.current = now;
            persistProgress(
              activeBook.id,
              activeEpisode.id,
              activeTrack.voiceProfile.voiceKey,
              activeTrack.updatedAt,
              el.currentTime,
              el.duration || activeTrack.durationSeconds
            );
          }
        }}
        onError={() => {
          setIsBuffering(false);
          setIsPlaying(false);
          setPlayerError('Đang chờ kết nối mạng hoặc tệp âm thanh tạm gián đoạn.');
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (activeBook && activeEpisode && activeTrack) {
            const dur = duration || activeTrack.durationSeconds || 1;
            persistProgress(
              activeBook.id,
              activeEpisode.id,
              activeTrack.voiceProfile.voiceKey,
              activeTrack.updatedAt,
              dur,
              dur
            );
          }
          // AC-09: Sleep Timer "end_of_episode" overrides Auto-next
          if (sleepTimerMode === 'end_of_episode') {
            setSleepTimerMode('off');
            setSleepRemainingSeconds(null);
            return;
          }
          if (autoNext) {
            const next = findAdjacentAudioEpisode(1);
            if (next && activeBook) {
              playEpisode(activeBook, next);
            }
          }
        }}
      />
    </LibraryPlayerContext.Provider>
  );
}

export function useLibraryPlayer(): LibraryPlayerContextValue {
  const ctx = useContext(LibraryPlayerContext);
  if (!ctx) throw new Error('useLibraryPlayer must be used inside LibraryPlayerProvider');
  return ctx;
}
