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
import { usePathname } from 'next/navigation';
import { isEpisodeReadingOnly } from '@/lib/presets';
import {
  HydratedAudioTrack,
  HydratedBook,
  HydratedEpisode,
  LocalEpisodeProgress,
  LocalReadingProgress
} from '@/lib/types';

export type SleepTimerMode = 'off' | '10' | '15' | '30' | '45' | 'end_of_episode';
export type BedtimeSleepChoice = 'end_of_episode' | '15' | '30' | 'continuous';
export type PlaybackRateOption = 0.85 | 1.0 | 1.15 | 1.25;
export type UtilitySheetTab = 'search' | 'saved' | null;

export interface ContinueSuggestion {
  mode: 'audio' | 'reading';
  kind: 'in_progress' | 'next_up';
  book: HydratedBook;
  episode: HydratedEpisode;
  progressSeconds: number;
  durationSeconds: number;
  scrollPercent: number;
  updatedAt: number;
}

interface NewEpisodeItem {
  book: HydratedBook;
  episode: HydratedEpisode;
  publishedMs: number;
}

interface LibraryPlayerContextValue {
  books: HydratedBook[];
  isHydrated: boolean;
  isNight: boolean;
  toggleNight: () => void;
  favorites: string[];
  toggleFavorite: (episodeId: string) => void;
  progressMap: Record<string, LocalEpisodeProgress>;
  readingProgressMap: Record<string, LocalReadingProgress>;
  saveReadingProgress: (bookId: string, episodeId: string, scrollPercent: number) => void;
  openedEpisodeIds: string[];
  isEpisodeNew: (episode: HydratedEpisode) => boolean;
  markEpisodeOpened: (episodeId: string) => void;
  newEpisodesAcrossLibrary: NewEpisodeItem[];
  preferredVoiceKey: string;
  selectVoicePreference: (voiceKey: string) => void;
  readerFontSize: number;
  adjustReaderFontSize: (delta: number) => void;

  // Utility Bottom Sheet (Search & Saved)
  utilitySheetTab: UtilitySheetTab;
  openUtilitySheet: (tab: Exclude<UtilitySheetTab, null>) => void;
  closeUtilitySheet: () => void;

  // Spatial Gate Threshold (Night 1, 2, 3... n welcome experience)
  hasPassedGate: boolean;
  enterLibraryFromGate: () => void;
  returnToGate: () => void;

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
  activeSleepChoice: BedtimeSleepChoice;
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
  selectSleepChoice: (choice: BedtimeSleepChoice) => void;
  setFullPlayerOpen: (open: boolean) => void;
  setKidLocked: (locked: boolean) => void;
  retryPlayback: () => void;
  continueItems: ContinueSuggestion[];
}

const LibraryPlayerContext = createContext<LibraryPlayerContextValue | null>(null);

const STORAGE_KEYS = {
  themeWindow: 'litibook_theme_window_v3',
  favorites: 'litibook_favorites_v1',
  progress: 'litibook_progress_v1',
  readingProgress: 'litibook_reading_progress_v1',
  voice: 'litibook_preferred_voice_v1',
  fontSize: 'litibook_reader_fontsize_v1',
  openedEpisodes: 'litibook_opened_episodes_v1',
  visitBaseline: 'litibook_visit_baseline_v1',
  gateSession: 'litibook_gate_session_v1'
};

const GATE_RESET_IDLE_MS = 45 * 60 * 1000; // Re-welcome at the Gate after 45 mins away or new tab session

const NEW_EPISODE_WINDOW_MS = 14 * 24 * 3600 * 1000; // 14 days

/**
 * Circadian Bedtime Window: 19:30 (1170 mins) -> 05:30 (330 mins)
 * Must match the inline anti-flash script in src/app/layout.tsx identically.
 */
export function isBedtimeHours(d: Date = new Date()): boolean {
  const mins = d.getHours() * 60 + d.getMinutes();
  return mins >= 1170 || mins < 330;
}

function computeThemeWindow(d: Date = new Date()): {
  autoNight: boolean;
  windowKey: string;
} {
  const mins = d.getHours() * 60 + d.getMinutes();
  const autoNight = mins >= 1170 || mins < 330;
  const pivot = mins < 330 ? new Date(d.getTime() - 43200000) : d;
  const windowKey = `${pivot.getFullYear()}-${pivot.getMonth() + 1}-${pivot.getDate()}-${
    autoNight ? 'night' : 'day'
  }`;
  return { autoNight, windowKey };
}

function applyDocumentTheme(night: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', night);
  document.documentElement.style.colorScheme = night ? 'dark' : 'light';

  const themeColor = night ? '#111613' : '#F8F5EE';
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  if (metas.length > 0) {
    metas.forEach((m) => m.setAttribute('content', themeColor));
  } else {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    meta.setAttribute('content', themeColor);
    document.head.appendChild(meta);
  }
}

function isSameOriginAudioUrl(url: string): boolean {
  if (!url || typeof window === 'undefined') return false;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    return new URL(url, window.location.origin).origin === window.location.origin;
  } catch {
    return false;
  }
}

export function LibraryPlayerProvider({
  initialBooks,
  children
}: {
  initialBooks: HydratedBook[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const [books, setBooks] = useState<HydratedBook[]>(initialBooks);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isNight, setIsNight] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, LocalEpisodeProgress>>({});
  const [readingProgressMap, setReadingProgressMap] = useState<
    Record<string, LocalReadingProgress>
  >({});
  const [openedEpisodeIds, setOpenedEpisodeIds] = useState<string[]>([]);
  const [previousVisitMs, setPreviousVisitMs] = useState<number | null>(null);
  const [preferredVoiceKey, setPreferredVoiceKey] = useState<string>('female_my_duyen');
  const [readerFontSize, setReaderFontSize] = useState<number>(18);
  const [utilitySheetTab, setUtilitySheetTab] = useState<UtilitySheetTab>(null);
  const [hasPassedGate, setHasPassedGate] = useState<boolean>(false);

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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const mediaSourceConnectedRef = useRef<boolean>(false);
  const lastSaveWallMs = useRef<number>(0);
  const sleepDeadlineMs = useRef<number | null>(null);
  const hasManualSleepChoiceRef = useRef<boolean>(false);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  // Hydrate circadian theme & local progress from localStorage + unregister legacy SW
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
      const { autoNight, windowKey } = computeThemeWindow();
      let resolvedNight = autoNight;
      const rawWindowTheme = localStorage.getItem(STORAGE_KEYS.themeWindow);
      if (rawWindowTheme) {
        const parsedTheme = JSON.parse(rawWindowTheme);
        if (
          parsedTheme &&
          parsedTheme.windowKey === windowKey &&
          typeof parsedTheme.isNight === 'boolean'
        ) {
          resolvedNight = parsedTheme.isNight;
        }
      }
      setIsNight(resolvedNight);
      applyDocumentTheme(resolvedNight);

      // Initialize bedtime sleep defaults before playback starts
      if (autoNight) {
        setSleepTimerMode('end_of_episode');
        setAutoNext(false);
      } else {
        setSleepTimerMode('off');
        setAutoNext(true);
      }

      const savedFavs = localStorage.getItem(STORAGE_KEYS.favorites);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedProg = localStorage.getItem(STORAGE_KEYS.progress);
      if (savedProg) setProgressMap(JSON.parse(savedProg));

      const savedReading = localStorage.getItem(STORAGE_KEYS.readingProgress);
      if (savedReading) setReadingProgressMap(JSON.parse(savedReading));

      const savedVoice = localStorage.getItem(STORAGE_KEYS.voice);
      if (savedVoice) setPreferredVoiceKey(savedVoice);

      const savedFont = Number(localStorage.getItem(STORAGE_KEYS.fontSize));
      if (savedFont >= 16 && savedFont <= 22) setReaderFontSize(savedFont);

      const savedOpened = localStorage.getItem(STORAGE_KEYS.openedEpisodes);
      if (savedOpened) setOpenedEpisodeIds(JSON.parse(savedOpened));

      // Check active reading session for the Gate threshold (each new session or >45min break starts at the Gate)
      try {
        const rawGate = sessionStorage.getItem(STORAGE_KEYS.gateSession);
        if (rawGate) {
          const parsedGate = JSON.parse(rawGate);
          if (
            parsedGate &&
            typeof parsedGate.enteredAt === 'number' &&
            Date.now() - parsedGate.enteredAt < GATE_RESET_IDLE_MS
          ) {
            setHasPassedGate(true);
          } else {
            sessionStorage.removeItem(STORAGE_KEYS.gateSession);
          }
        }
      } catch {}

      const rawBaseline = localStorage.getItem(STORAGE_KEYS.visitBaseline);
      const nowMs = Date.now();
      if (rawBaseline) {
        const parsed = JSON.parse(rawBaseline);
        if (parsed.currentSessionMs && nowMs - parsed.currentSessionMs > 12 * 3600 * 1000) {
          setPreviousVisitMs(parsed.currentSessionMs);
          localStorage.setItem(
            STORAGE_KEYS.visitBaseline,
            JSON.stringify({
              previousVisitMs: parsed.currentSessionMs,
              currentSessionMs: nowMs
            })
          );
        } else if (parsed.previousVisitMs) {
          setPreviousVisitMs(parsed.previousVisitMs);
        }
      } else {
        localStorage.setItem(
          STORAGE_KEYS.visitBaseline,
          JSON.stringify({ previousVisitMs: null, currentSessionMs: nowMs })
        );
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  // Refresh published library when app returns to foreground (PUB-003) & re-show Gate only when idle on "/"
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          const rawGate = sessionStorage.getItem(STORAGE_KEYS.gateSession);
          if (rawGate) {
            const parsedGate = JSON.parse(rawGate);
            const isExpired =
              !parsedGate ||
              typeof parsedGate.enteredAt !== 'number' ||
              Date.now() - parsedGate.enteredAt >= GATE_RESET_IDLE_MS;
            if (
              isExpired &&
              window.location.pathname === '/' &&
              (!audioRef.current || audioRef.current.paused)
            ) {
              sessionStorage.removeItem(STORAGE_KEYS.gateSession);
              setHasPassedGate(false);
            }
          }
        } catch {}

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

  const enterLibraryFromGate = useCallback(() => {
    setHasPassedGate(true);
    try {
      sessionStorage.setItem(
        STORAGE_KEYS.gateSession,
        JSON.stringify({ enteredAt: Date.now() })
      );
    } catch {}
  }, []);

  const returnToGate = useCallback(() => {
    setHasPassedGate(false);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.gateSession);
    } catch {}
  }, []);

  // Entering an interior route directly (shared link) counts as being inside the library
  useEffect(() => {
    if (isHydrated && !hasPassedGate && pathname !== '/' && !pathname.startsWith('/admin')) {
      enterLibraryFromGate();
    }
  }, [enterLibraryFromGate, hasPassedGate, isHydrated, pathname]);

  const toggleNight = useCallback(() => {
    setIsNight((prev) => {
      const next = !prev;
      applyDocumentTheme(next);
      try {
        const { windowKey } = computeThemeWindow();
        localStorage.setItem(
          STORAGE_KEYS.themeWindow,
          JSON.stringify({ windowKey, isNight: next })
        );
      } catch {}
      return next;
    });
  }, []);

  const openUtilitySheet = useCallback((tab: Exclude<UtilitySheetTab, null>) => {
    setUtilitySheetTab(tab);
  }, []);

  const closeUtilitySheet = useCallback(() => {
    setUtilitySheetTab(null);
  }, []);

  const ensureAudioGainGraph = useCallback((url: string) => {
    if (typeof window === 'undefined') return;
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      if (mediaSourceConnectedRef.current || !isSameOriginAudioUrl(url)) {
        return;
      }
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = 1;
      source.connect(gain);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;
      mediaSourceConnectedRef.current = true;
    } catch {
      // Fallback cleanly to native HTMLAudioElement.volume
    }
  }, []);

  const setPlaybackGain = useCallback((level: number) => {
    const clamped = Math.max(0.02, Math.min(1, level));
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.volume = clamped;
      } catch {}
    }
    const gain = gainNodeRef.current;
    const ctx = audioCtxRef.current;
    if (gain && ctx) {
      try {
        gain.gain.setTargetAtTime(clamped, ctx.currentTime, 0.08);
      } catch {}
    }
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

  const markEpisodeOpened = useCallback((episodeId: string) => {
    if (!episodeId) return;
    setOpenedEpisodeIds((prev) => {
      if (prev.includes(episodeId)) return prev;
      const next = [...prev, episodeId];
      try {
        localStorage.setItem(STORAGE_KEYS.openedEpisodes, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const saveReadingProgress = useCallback(
    (bookId: string, episodeId: string, scrollPercent: number) => {
      if (!bookId || !episodeId) return;
      const pct = Math.max(0, Math.min(100, Math.round(scrollPercent)));
      setReadingProgressMap((prev) => {
        const existing = prev[episodeId];
        if (!existing && pct < 3) return prev;
        const completed = pct >= 92 || Boolean(existing?.completed && pct >= 85);
        const entry: LocalReadingProgress = {
          episodeId,
          bookId,
          scrollPercent: pct,
          completed,
          updatedAt: Date.now()
        };
        const next = { ...prev, [episodeId]: entry };
        try {
          localStorage.setItem(STORAGE_KEYS.readingProgress, JSON.stringify(next));
        } catch {}
        return next;
      });
      markEpisodeOpened(episodeId);
    },
    [markEpisodeOpened]
  );

  const isEpisodeNew = useCallback(
    (ep: HydratedEpisode): boolean => {
      const prog = progressMap[ep.id];
      const readProg = readingProgressMap[ep.id];
      if (
        openedEpisodeIds.includes(ep.id) ||
        (prog && (prog.positionSeconds > 0 || prog.completed)) ||
        (readProg && (readProg.scrollPercent > 0 || readProg.completed))
      ) {
        return false;
      }
      const dateStr = ep.publishedAt || ep.createdAt;
      const pubMs = dateStr ? Date.parse(dateStr) : 0;
      if (!Number.isFinite(pubMs) || pubMs <= 0) return false;

      const withinWindow = Date.now() - pubMs <= NEW_EPISODE_WINDOW_MS;
      const newerThanLastVisit = previousVisitMs !== null && pubMs > previousVisitMs;
      return withinWindow || newerThanLastVisit;
    },
    [openedEpisodeIds, previousVisitMs, progressMap, readingProgressMap]
  );

  const newEpisodesAcrossLibrary = useMemo<NewEpisodeItem[]>(() => {
    const items: NewEpisodeItem[] = [];
    for (const book of books) {
      for (const ep of book.episodes) {
        if (isEpisodeNew(ep)) {
          const pubMs = Date.parse(ep.publishedAt || ep.createdAt || '') || 0;
          items.push({ book, episode: ep, publishedMs: pubMs });
        }
      }
    }
    return items.sort((a, b) => {
      if (b.publishedMs !== a.publishedMs) return b.publishedMs - a.publishedMs;
      return b.episode.sortOrder - a.episode.sortOrder;
    });
  }, [books, isEpisodeNew]);

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
      if (isEpisodeReadingOnly(ep)) return null;
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

      ensureAudioGainGraph(track.audioUrl);

      // Toggle if already loaded on this exact track
      if (activeEpisodeId === episode.id && activeTrackId === track.id && audioRef.current) {
        if (audioRef.current.paused) {
          setPlaybackGain(1);
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
        return;
      }

      setActiveBookId(book.id);
      setActiveEpisodeId(episode.id);
      setActiveTrackId(track.id);

      // Apply Circadian Bedtime Sleep Defaults unless manually chosen in this session
      if (!hasManualSleepChoiceRef.current) {
        if (isBedtimeHours()) {
          setSleepTimerMode('end_of_episode');
          setAutoNext(false);
          sleepDeadlineMs.current = null;
          setSleepRemainingSeconds(null);
        } else {
          const wantAuto = book.defaultAutoNext;
          setAutoNext(wantAuto);
          setSleepTimerMode(wantAuto ? 'off' : 'end_of_episode');
          sleepDeadlineMs.current = null;
          setSleepRemainingSeconds(null);
        }
      }

      setPlayerError(null);
      markEpisodeOpened(episode.id);

      const saved = progressMap[episode.id];
      let startSec = 0;
      if (saved && !saved.completed) {
        const expectedDur = track.durationSeconds || saved.durationSeconds || 0;
        const durationChangedDrastically =
          saved.trackUpdatedAt !== track.updatedAt &&
          expectedDur > 0 &&
          (saved.positionSeconds >= expectedDur ||
            Math.abs(expectedDur - saved.durationSeconds) / Math.max(1, saved.durationSeconds) >
              0.1);
        if (!durationChangedDrastically) {
          startSec = Math.max(0, saved.positionSeconds - 3);
        }
      }

      const audio = audioRef.current;
      if (audio) {
        audio.src = track.audioUrl;
        audio.playbackRate = playbackRate;
        setPlaybackGain(1);
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
    [
      activeEpisodeId,
      activeTrackId,
      ensureAudioGainGraph,
      markEpisodeOpened,
      playbackRate,
      progressMap,
      selectBestTrack,
      setPlaybackGain
    ]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (audio.paused) {
      ensureAudioGainGraph(activeTrack.audioUrl);
      setPlaybackGain(1);
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [activeTrack, ensureAudioGainGraph, setPlaybackGain]);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const dur = audio.duration || duration || 0;
      const clamped = Math.max(0, Math.min(seconds, dur));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
      if (dur - clamped > 8) {
        setPlaybackGain(1);
      }
    },
    [duration, setPlaybackGain]
  );

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo((audio.currentTime || 0) + deltaSeconds);
    },
    [seekTo]
  );

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
      ensureAudioGainGraph(newTrack.audioUrl);
      setPlaybackGain(1);
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
    [
      activeBook,
      activeEpisode,
      activeTrack,
      ensureAudioGainGraph,
      playbackRate,
      setPlaybackGain
    ]
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

  const findAdjacentAudioEpisode = useCallback(
    (dir: -1 | 1): HydratedEpisode | null => {
      if (!activeBook || !activeEpisode) return null;
      const audioEps = activeBook.episodes.filter((e) => !isEpisodeReadingOnly(e));
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
    hasManualSleepChoiceRef.current = true;
    setAutoNext((prev) => {
      const next = !prev;
      if (next && sleepTimerMode === 'end_of_episode') {
        setSleepTimerMode('off');
      }
      return next;
    });
  }, [sleepTimerMode]);

  const setSleepTimer = useCallback(
    (mode: SleepTimerMode) => {
      hasManualSleepChoiceRef.current = true;
      setSleepTimerMode(mode);
      setPlaybackGain(1);
      if (mode === 'off' || mode === 'end_of_episode') {
        sleepDeadlineMs.current = null;
        setSleepRemainingSeconds(null);
        if (mode === 'end_of_episode') setAutoNext(false);
        return;
      }
      const mins = Number(mode);
      const totalSec = mins * 60;
      sleepDeadlineMs.current = Date.now() + totalSec * 1000;
      setSleepRemainingSeconds(totalSec);
    },
    [setPlaybackGain]
  );

  const selectSleepChoice = useCallback(
    (choice: BedtimeSleepChoice) => {
      hasManualSleepChoiceRef.current = true;
      setPlaybackGain(1);
      if (choice === 'end_of_episode') {
        sleepDeadlineMs.current = null;
        setSleepRemainingSeconds(null);
        setSleepTimerMode('end_of_episode');
        setAutoNext(false);
        return;
      }
      if (choice === 'continuous') {
        sleepDeadlineMs.current = null;
        setSleepRemainingSeconds(null);
        setSleepTimerMode('off');
        setAutoNext(true);
        return;
      }
      const mins = Number(choice);
      const totalSec = mins * 60;
      sleepDeadlineMs.current = Date.now() + totalSec * 1000;
      setSleepRemainingSeconds(totalSec);
      setSleepTimerMode(choice);
    },
    [setPlaybackGain]
  );

  const activeSleepChoice: BedtimeSleepChoice = useMemo(() => {
    if (sleepTimerMode === '15') return '15';
    if (sleepTimerMode === '30') return '30';
    if (sleepTimerMode === 'end_of_episode' || !autoNext) return 'end_of_episode';
    return 'continuous';
  }, [autoNext, sleepTimerMode]);

  const retryPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    const savedPos = currentTime;
    ensureAudioGainGraph(activeTrack.audioUrl);
    setPlaybackGain(1);
    setPlayerError(null);
    audio.load();
    const onLoaded = () => {
      audio.currentTime = savedPos;
      audio.play().catch(() => {});
      audio.removeEventListener('loadedmetadata', onLoaded);
    };
    audio.addEventListener('loadedmetadata', onLoaded);
  }, [activeTrack, currentTime, ensureAudioGainGraph, setPlaybackGain]);

  // Minute-based Sleep Timer countdown + 8s gentle fade-out (native volume + iOS GainNode)
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
          setPlaybackGain(remMs / 8000);
        }
        if (remMs <= 0) {
          audio.pause();
          setPlaybackGain(1);
          sleepDeadlineMs.current = null;
          setSleepTimerMode('off');
          setSleepRemainingSeconds(null);
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [setPlaybackGain, sleepTimerMode]);

  // Media Session API for Lock Screen Controls
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

  // Save audio progress on pagehide
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

  // Unified Read & Listen Continue Suggestions (ranked by latest updatedAt across audio & reading)
  const continueItems = useMemo<ContinueSuggestion[]>(() => {
    type Candidate =
      | { mode: 'audio'; updatedAt: number; audio: LocalEpisodeProgress }
      | { mode: 'reading'; updatedAt: number; reading: LocalReadingProgress };

    const candidates: Candidate[] = [
      ...Object.values(progressMap).map((audio) => ({
        mode: 'audio' as const,
        updatedAt: audio.updatedAt || 0,
        audio
      })),
      ...Object.values(readingProgressMap).map((reading) => ({
        mode: 'reading' as const,
        updatedAt: reading.updatedAt || 0,
        reading
      }))
    ].sort((a, b) => b.updatedAt - a.updatedAt);

    const results: ContinueSuggestion[] = [];
    const seenBooks = new Set<string>();

    for (const item of candidates) {
      const bookId = item.mode === 'audio' ? item.audio.bookId : item.reading.bookId;
      const episodeId = item.mode === 'audio' ? item.audio.episodeId : item.reading.episodeId;
      if (seenBooks.has(bookId)) continue;

      const book = books.find((b) => b.id === bookId);
      if (!book) continue;
      const epIdx = book.episodes.findIndex((e) => e.id === episodeId);
      if (epIdx === -1) continue;
      const ep = book.episodes[epIdx];

      if (item.mode === 'audio') {
        const entry = item.audio;
        if (!entry.completed && !isEpisodeReadingOnly(ep)) {
          seenBooks.add(bookId);
          results.push({
            mode: 'audio',
            kind: 'in_progress',
            book,
            episode: ep,
            progressSeconds: entry.positionSeconds,
            durationSeconds:
              entry.durationSeconds || ep.audioTracks[0]?.durationSeconds || 0,
            scrollPercent: readingProgressMap[ep.id]?.scrollPercent || 0,
            updatedAt: entry.updatedAt
          });
        } else if (entry.completed) {
          const nextEp = book.episodes
            .slice(epIdx + 1)
            .find(
              (cand) =>
                !isEpisodeReadingOnly(cand) && !progressMap[cand.id]?.completed
            );
          if (nextEp) {
            seenBooks.add(bookId);
            results.push({
              mode: 'audio',
              kind: 'next_up',
              book,
              episode: nextEp,
              progressSeconds: 0,
              durationSeconds: nextEp.audioTracks[0]?.durationSeconds || 0,
              scrollPercent: 0,
              updatedAt: entry.updatedAt
            });
          }
        }
      } else {
        const entry = item.reading;
        if (!entry.completed) {
          seenBooks.add(bookId);
          results.push({
            mode: 'reading',
            kind: 'in_progress',
            book,
            episode: ep,
            progressSeconds: 0,
            durationSeconds: ep.audioTracks[0]?.durationSeconds || 0,
            scrollPercent: entry.scrollPercent,
            updatedAt: entry.updatedAt
          });
        } else {
          const nextEp = book.episodes
            .slice(epIdx + 1)
            .find((cand) => !readingProgressMap[cand.id]?.completed);
          if (nextEp) {
            seenBooks.add(bookId);
            results.push({
              mode: 'reading',
              kind: 'next_up',
              book,
              episode: nextEp,
              progressSeconds: 0,
              durationSeconds: nextEp.audioTracks[0]?.durationSeconds || 0,
              scrollPercent: 0,
              updatedAt: entry.updatedAt
            });
          }
        }
      }
    }
    return results;
  }, [books, progressMap, readingProgressMap]);

  return (
    <LibraryPlayerContext.Provider
      value={{
        books,
        isHydrated,
        isNight,
        toggleNight,
        favorites,
        toggleFavorite,
        progressMap,
        readingProgressMap,
        saveReadingProgress,
        openedEpisodeIds,
        isEpisodeNew,
        markEpisodeOpened,
        newEpisodesAcrossLibrary,
        preferredVoiceKey,
        selectVoicePreference,
        readerFontSize,
        adjustReaderFontSize,
        utilitySheetTab,
        openUtilitySheet,
        closeUtilitySheet,
        hasPassedGate,
        enterLibraryFromGate,
        returnToGate,
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
        activeSleepChoice,
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
        selectSleepChoice,
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

          // Gentle 8-second fade-out when "Hết tập dừng êm" is active (native volume + iOS GainNode)
          if (
            sleepTimerMode === 'end_of_episode' &&
            el.duration &&
            Number.isFinite(el.duration) &&
            el.duration > 20 &&
            !el.paused
          ) {
            const rem = el.duration - el.currentTime;
            const currentGain = gainNodeRef.current ? gainNodeRef.current.gain.value : el.volume;
            if (rem > 0 && rem <= 8) {
              setPlaybackGain(rem / 8);
            } else if (rem > 8 && (el.volume < 0.99 || currentGain < 0.99)) {
              setPlaybackGain(1);
            }
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
          setPlaybackGain(1);
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
          // "Hết tập dừng êm" stops playback cleanly without startling the child
          if (sleepTimerMode === 'end_of_episode') {
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
