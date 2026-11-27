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
import { usePathname, useRouter } from 'next/navigation';
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
  navigateToGate: () => void;
  navigateToFoyer: () => void;

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
  showInAppBrowserAudioHint: boolean;

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
  dismissInAppBrowserAudioHint: () => void;
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
  gateSession: 'litibook_gate_session_v1',
  inAppHintDismissed: 'litibook_inapp_hint_dismissed_v1'
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

/**
 * Configures iOS 17+ / modern mobile Safari & PWA audio session to 'playback'
 * so audio continues through screen lock and plays even when the physical Silent switch is on.
 */
function configureNativeAudioSession() {
  if (typeof navigator === 'undefined') return;
  try {
    const navWithSession = navigator as Navigator & {
      audioSession?: { type: string };
    };
    if (navWithSession.audioSession && navWithSession.audioSession.type !== 'playback') {
      navWithSession.audioSession.type = 'playback';
    }
  } catch {}
}

function isDataSaverEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  try {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean };
      }
    ).connection;
    return Boolean(conn?.saveData);
  } catch {
    return false;
  }
}

function detectRestrictedInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Zalo|FBAN|FBAV|FB_IAB|Messenger|Instagram|Line\//i.test(ua);
}

function resolveMediaArtwork(rawUrl: string): { src: string; type: string } {
  let abs = rawUrl || '/icon-512.png';
  if (typeof window !== 'undefined') {
    try {
      abs = new URL(abs, window.location.origin).href;
    } catch {}
  }
  const clean = abs.split('?')[0].toLowerCase();
  let type = 'image/jpeg';
  if (clean.endsWith('.png')) type = 'image/png';
  else if (clean.endsWith('.webp')) type = 'image/webp';
  else if (clean.endsWith('.svg')) type = 'image/svg+xml';
  return { src: abs, type };
}

type PendingSeekSpec =
  | { mode: 'seconds'; seconds: number; fallbackDuration: number }
  | { mode: 'ratio'; ratio: number; fallbackDuration: number }
  | null;

export function LibraryPlayerProvider({
  initialBooks,
  children
}: {
  initialBooks: HydratedBook[];
  children: React.ReactNode;
}) {
  const pathname = usePathname() || '/';
  const router = useRouter();
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
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [inAppHintDismissed, setInAppHintDismissed] = useState(false);
  const [saveDataMode, setSaveDataMode] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingSeekRef = useRef<PendingSeekSpec>(null);
  const wantedPlayRef = useRef<boolean>(false);
  const lastKnownTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prewarmedUrlRef = useRef<string | null>(null);
  const lastSaveWallMs = useRef<number>(0);
  const lastPositionSyncWallMs = useRef<number>(0);
  const sleepDeadlineMs = useRef<number | null>(null);
  const hasManualSleepChoiceRef = useRef<boolean>(false);
  const isReturningToGateRef = useRef<boolean>(false);

  // Live mirrors for background-throttled event callbacks
  const activeBookRef = useRef<HydratedBook | null>(null);
  const activeEpisodeRef = useRef<HydratedEpisode | null>(null);
  const activeTrackRef = useRef<HydratedAudioTrack | null>(null);
  const autoNextRef = useRef<boolean>(false);
  const sleepTimerModeRef = useRef<SleepTimerMode>('off');
  const playbackRateRef = useRef<PlaybackRateOption>(1.0);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  // Hydrate circadian theme & local progress from localStorage + unregister legacy SW
  useEffect(() => {
    configureNativeAudioSession();
    setIsInAppBrowser(detectRestrictedInAppBrowser());
    setSaveDataMode(isDataSaverEnabled());

    try {
      if (sessionStorage.getItem(STORAGE_KEYS.inAppHintDismissed) === '1') {
        setInAppHintDismissed(true);
      }
    } catch {}

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
        sleepTimerModeRef.current = 'end_of_episode';
        setAutoNext(false);
        autoNextRef.current = false;
      } else {
        setSleepTimerMode('off');
        sleepTimerModeRef.current = 'off';
        setAutoNext(true);
        autoNextRef.current = true;
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

  const dismissInAppBrowserAudioHint = useCallback(() => {
    setInAppHintDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEYS.inAppHintDismissed, '1');
    } catch {}
  }, []);

  const enterLibraryFromGate = useCallback(() => {
    isReturningToGateRef.current = false;
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
    if (pathname === '/') {
      isReturningToGateRef.current = false;
      return;
    }
    if (
      isHydrated &&
      !hasPassedGate &&
      !isReturningToGateRef.current &&
      !pathname.startsWith('/admin')
    ) {
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

  const navigateToGate = useCallback(() => {
    isReturningToGateRef.current = true;
    returnToGate();
    closeUtilitySheet();
    setFullPlayerOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  }, [closeUtilitySheet, pathname, returnToGate, router]);

  const navigateToFoyer = useCallback(() => {
    isReturningToGateRef.current = false;
    enterLibraryFromGate();
    closeUtilitySheet();
    setFullPlayerOpen(false);
    if (pathname !== '/') {
      router.push('/');
    }
  }, [closeUtilitySheet, enterLibraryFromGate, pathname, router]);

  /**
   * Pure HTMLAudioElement volume control (0 Web Audio API routing).
   * Keeps <audio> 100% attached to the mobile OS hardware background media pipeline.
   */
  const setPlaybackGain = useCallback((level: number) => {
    const clamped = Math.max(0.02, Math.min(1, level));
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.volume = clamped;
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

  useEffect(() => {
    activeBookRef.current = activeBook;
    activeEpisodeRef.current = activeEpisode;
    activeTrackRef.current = activeTrack;
  }, [activeBook, activeEpisode, activeTrack]);

  useEffect(() => {
    autoNextRef.current = autoNext;
  }, [autoNext]);

  useEffect(() => {
    sleepTimerModeRef.current = sleepTimerMode;
  }, [sleepTimerMode]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  const syncMediaSessionPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration;
    if (!dur || !Number.isFinite(dur) || dur <= 0) return;
    try {
      if (typeof navigator.mediaSession.setPositionState === 'function') {
        navigator.mediaSession.setPositionState({
          duration: dur,
          playbackRate: audio.playbackRate || 1,
          position: Math.max(0, Math.min(dur, audio.currentTime || 0))
        });
      }
    } catch {}
  }, []);

  const setMediaSessionPlaybackState = useCallback((state: MediaSessionPlaybackState) => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {}
  }, []);

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

  const flushActiveAudioProgress = useCallback(() => {
    const audio = audioRef.current;
    const book = activeBookRef.current;
    const ep = activeEpisodeRef.current;
    const trk = activeTrackRef.current;
    if (!audio || !book || !ep || !trk) return;
    const pos = audio.currentTime > 0 ? audio.currentTime : lastKnownTimeRef.current;
    const dur =
      (audio.duration && Number.isFinite(audio.duration) ? audio.duration : 0) ||
      trk.durationSeconds;
    if (pos > 0 && dur > 0) {
      persistProgress(book.id, ep.id, trk.voiceProfile.voiceKey, trk.updatedAt, pos, dur);
    }
  }, [persistProgress]);

  const evaluateSleepDeadline = useCallback((): boolean => {
    const deadline = sleepDeadlineMs.current;
    const mode = sleepTimerModeRef.current;
    if (!deadline || mode === 'off' || mode === 'end_of_episode') {
      return false;
    }
    const remMs = deadline - Date.now();
    const remSec = Math.max(0, Math.ceil(remMs / 1000));
    setSleepRemainingSeconds(remSec);

    const audio = audioRef.current;
    if (remMs <= 8000 && remMs > 0 && audio && !audio.paused) {
      setPlaybackGain(remMs / 8000);
    }
    if (remMs <= 0) {
      wantedPlayRef.current = false;
      if (audio && !audio.paused) {
        audio.pause();
      }
      setPlaybackGain(1);
      sleepDeadlineMs.current = null;
      sleepTimerModeRef.current = 'off';
      setSleepTimerMode('off');
      setSleepRemainingSeconds(null);
      return true;
    }
    return false;
  }, [setPlaybackGain]);

  /**
   * Starts or switches the singleton <audio> element synchronously in the current gesture/media turn
   * so mobile Safari & Chrome preserve background playback privilege when the screen is locked.
   */
  const startAudioSource = useCallback(
    (
      url: string,
      rate: PlaybackRateOption,
      seekSpec: PendingSeekSpec,
      shouldPlay: boolean
    ) => {
      const audio = audioRef.current;
      if (!audio) return;

      clearRetryTimer();
      retryCountRef.current = 0;
      prewarmedUrlRef.current = null;
      pendingSeekRef.current = seekSpec;
      if (seekSpec?.mode === 'seconds') {
        lastKnownTimeRef.current = seekSpec.seconds;
        setCurrentTime(seekSpec.seconds);
      } else if (!seekSpec) {
        lastKnownTimeRef.current = 0;
        setCurrentTime(0);
      }
      if (seekSpec?.fallbackDuration) {
        setDuration(seekSpec.fallbackDuration);
      }

      configureNativeAudioSession();
      setPlaybackGain(1);

      const saveData = isDataSaverEnabled();
      setSaveDataMode(saveData);
      audio.preload = saveData ? 'metadata' : 'auto';
      audio.src = url;
      audio.defaultPlaybackRate = rate;
      audio.playbackRate = rate;

      if (shouldPlay) {
        wantedPlayRef.current = true;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch((err: unknown) => {
            const errName = (err as { name?: string })?.name;
            if (errName === 'AbortError') return;
          });
        }
      } else {
        wantedPlayRef.current = false;
        audio.load();
      }
    },
    [clearRetryTimer, setPlaybackGain]
  );

  // Persist progress immediately when locking screen (hidden) & resync UI + library when returning (visible)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushActiveAudioProgress();
        return;
      }

      if (document.visibilityState === 'visible') {
        const audio = audioRef.current;
        if (audio && activeTrackRef.current) {
          if (Number.isFinite(audio.currentTime)) {
            setCurrentTime(audio.currentTime);
          }
          if (audio.duration && Number.isFinite(audio.duration)) {
            setDuration(audio.duration);
          }
          setIsPlaying(!audio.paused);
        }
        evaluateSleepDeadline();

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
  }, [evaluateSleepDeadline, flushActiveAudioProgress]);

  // Reconnect immediately if mobile Wi-Fi / 4G returns after a drop while playing in background
  useEffect(() => {
    const handleOnline = () => {
      const audio = audioRef.current;
      const trk = activeTrackRef.current;
      if (!audio || !trk || !wantedPlayRef.current) return;
      if (audio.error || retryTimerRef.current) {
        clearRetryTimer();
        retryCountRef.current = 0;
        setPlayerError(null);
        setIsBuffering(true);
        startAudioSource(
          trk.audioUrl,
          playbackRateRef.current,
          {
            mode: 'seconds',
            seconds: lastKnownTimeRef.current,
            fallbackDuration: trk.durationSeconds || 0
          },
          true
        );
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [clearRetryTimer, startAudioSource]);

  useEffect(() => {
    return () => clearRetryTimer();
  }, [clearRetryTimer]);

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

      // Toggle if already loaded on this exact track
      if (activeEpisodeId === episode.id && activeTrackId === track.id && audioRef.current) {
        if (audioRef.current.paused) {
          configureNativeAudioSession();
          wantedPlayRef.current = true;
          setPlaybackGain(1);
          audioRef.current.play().catch(() => {});
        } else {
          wantedPlayRef.current = false;
          audioRef.current.pause();
        }
        return;
      }

      activeBookRef.current = book;
      activeEpisodeRef.current = episode;
      activeTrackRef.current = track;
      setActiveBookId(book.id);
      setActiveEpisodeId(episode.id);
      setActiveTrackId(track.id);

      // Circadian Defaults: Bedtime (19:30–05:30) stops after 1 episode; Daytime auto-advances
      if (!hasManualSleepChoiceRef.current) {
        if (isBedtimeHours()) {
          sleepTimerModeRef.current = 'end_of_episode';
          autoNextRef.current = false;
          setSleepTimerMode('end_of_episode');
          setAutoNext(false);
          sleepDeadlineMs.current = null;
          setSleepRemainingSeconds(null);
        } else {
          sleepTimerModeRef.current = 'off';
          autoNextRef.current = true;
          setSleepTimerMode('off');
          setAutoNext(true);
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

      startAudioSource(
        track.audioUrl,
        playbackRateRef.current,
        {
          mode: 'seconds',
          seconds: startSec,
          fallbackDuration: track.durationSeconds || 0
        },
        true
      );
    },
    [
      activeEpisodeId,
      activeTrackId,
      markEpisodeOpened,
      progressMap,
      selectBestTrack,
      setPlaybackGain,
      startAudioSource
    ]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (audio.paused) {
      configureNativeAudioSession();
      wantedPlayRef.current = true;
      setPlaybackGain(1);
      audio.play().catch(() => {});
    } else {
      wantedPlayRef.current = false;
      audio.pause();
    }
  }, [activeTrack, setPlaybackGain]);

  const seekTo = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const dur = audio.duration || duration || 0;
      const clamped = Math.max(0, Math.min(seconds, dur));
      audio.currentTime = clamped;
      lastKnownTimeRef.current = clamped;
      setCurrentTime(clamped);
      if (dur - clamped > 8) {
        setPlaybackGain(1);
      }
      syncMediaSessionPosition();
    },
    [duration, setPlaybackGain, syncMediaSessionPosition]
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

      const wasPlaying = !audio.paused || wantedPlayRef.current;
      const oldDur = audio.duration || activeTrack?.durationSeconds || 1;
      const ratio = Math.max(0, Math.min(1, (audio.currentTime || 0) / Math.max(1, oldDur)));

      activeTrackRef.current = newTrack;
      setActiveTrackId(newTrack.id);
      setPlayerError(null);

      startAudioSource(
        newTrack.audioUrl,
        playbackRateRef.current,
        {
          mode: 'ratio',
          ratio,
          fallbackDuration: newTrack.durationSeconds || oldDur
        },
        wasPlaying
      );
    },
    [activeBook, activeEpisode, activeTrack, startAudioSource]
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
      const book = activeBookRef.current || activeBook;
      const episode = activeEpisodeRef.current || activeEpisode;
      if (!book || !episode) return null;
      const audioEps = book.episodes.filter((e) => !isEpisodeReadingOnly(e));
      const idx = audioEps.findIndex((e) => e.id === episode.id);
      if (idx === -1) return null;
      return audioEps[idx + dir] || null;
    },
    [activeBook, activeEpisode]
  );

  const prevAudioEpisode = useMemo(() => {
    if (!activeBook || !activeEpisode) return null;
    const audioEps = activeBook.episodes.filter((e) => !isEpisodeReadingOnly(e));
    const idx = audioEps.findIndex((e) => e.id === activeEpisode.id);
    return idx > 0 ? audioEps[idx - 1] : null;
  }, [activeBook, activeEpisode]);

  const nextAudioEpisode = useMemo(() => {
    if (!activeBook || !activeEpisode) return null;
    const audioEps = activeBook.episodes.filter((e) => !isEpisodeReadingOnly(e));
    const idx = audioEps.findIndex((e) => e.id === activeEpisode.id);
    return idx >= 0 && idx + 1 < audioEps.length ? audioEps[idx + 1] : null;
  }, [activeBook, activeEpisode]);

  const skipPrev = useCallback(() => {
    const book = activeBookRef.current || activeBook;
    const prev = findAdjacentAudioEpisode(-1);
    if (prev && book) playEpisode(book, prev);
  }, [activeBook, findAdjacentAudioEpisode, playEpisode]);

  const skipNext = useCallback(() => {
    const book = activeBookRef.current || activeBook;
    const next = findAdjacentAudioEpisode(1);
    if (next && book) playEpisode(book, next);
  }, [activeBook, findAdjacentAudioEpisode, playEpisode]);

  const cyclePlaybackRate = useCallback(() => {
    const rates: PlaybackRateOption[] = [0.85, 1.0, 1.15, 1.25];
    setPlaybackRate((prev) => {
      const next = rates[(rates.indexOf(prev) + 1) % rates.length];
      playbackRateRef.current = next;
      if (audioRef.current) {
        audioRef.current.defaultPlaybackRate = next;
        audioRef.current.playbackRate = next;
      }
      syncMediaSessionPosition();
      return next;
    });
  }, [syncMediaSessionPosition]);

  const toggleAutoNext = useCallback(() => {
    hasManualSleepChoiceRef.current = true;
    setAutoNext((prev) => {
      const next = !prev;
      autoNextRef.current = next;
      if (next && sleepTimerModeRef.current === 'end_of_episode') {
        sleepTimerModeRef.current = 'off';
        setSleepTimerMode('off');
      }
      return next;
    });
  }, []);

  const setSleepTimer = useCallback(
    (mode: SleepTimerMode) => {
      hasManualSleepChoiceRef.current = true;
      sleepTimerModeRef.current = mode;
      setSleepTimerMode(mode);
      setPlaybackGain(1);
      if (mode === 'off' || mode === 'end_of_episode') {
        sleepDeadlineMs.current = null;
        setSleepRemainingSeconds(null);
        if (mode === 'end_of_episode') {
          autoNextRef.current = false;
          setAutoNext(false);
        }
        return;
      }
      const mins = Number(mode);
      const totalSec = mins * 60;
      sleepDeadlineMs.current = Date.now() + totalSec * 1000;
      setSleepRemainingSeconds(totalSec);
      autoNextRef.current = true;
      setAutoNext(true);
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
        sleepTimerModeRef.current = 'end_of_episode';
        autoNextRef.current = false;
        setSleepTimerMode('end_of_episode');
        setAutoNext(false);
        return;
      }
      if (choice === 'continuous') {
        sleepDeadlineMs.current = null;
        setSleepRemainingSeconds(null);
        sleepTimerModeRef.current = 'off';
        autoNextRef.current = true;
        setSleepTimerMode('off');
        setAutoNext(true);
        return;
      }
      const mins = Number(choice);
      const totalSec = mins * 60;
      sleepDeadlineMs.current = Date.now() + totalSec * 1000;
      setSleepRemainingSeconds(totalSec);
      sleepTimerModeRef.current = choice;
      autoNextRef.current = true;
      setSleepTimerMode(choice);
      setAutoNext(true);
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
    if (!activeTrack) return;
    const savedPos = currentTime > 0 ? currentTime : lastKnownTimeRef.current;
    setPlayerError(null);
    setIsBuffering(true);
    startAudioSource(
      activeTrack.audioUrl,
      playbackRateRef.current,
      {
        mode: 'seconds',
        seconds: savedPos,
        fallbackDuration: activeTrack.durationSeconds || duration || 0
      },
      true
    );
  }, [activeTrack, currentTime, duration, startAudioSource]);

  // Minute-based Sleep Timer UI countdown (supplemented by hardware <audio onTimeUpdate> when screen is off)
  useEffect(() => {
    if (!sleepDeadlineMs.current || sleepTimerMode === 'off' || sleepTimerMode === 'end_of_episode') {
      return;
    }
    const timer = setInterval(() => {
      evaluateSleepDeadline();
    }, 1000);

    return () => clearInterval(timer);
  }, [evaluateSleepDeadline, sleepTimerMode]);

  // Media Session API for Lock Screen Controls (Prev/Next Episode + Scrubber Bar)
  const activeEpisodeTitle = activeEpisode?.title || '';
  const activeBookTitle = activeBook?.title || '';
  const activeVoiceName = activeTrack?.voiceProfile.displayName || 'Thư viện Đồi Mơ';
  const activeCoverUrl = activeEpisode?.effectiveCoverUrl || '';
  const hasPrevAudioEpisode = Boolean(prevAudioEpisode);
  const hasNextAudioEpisode = Boolean(nextAudioEpisode);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    if (!activeEpisodeId || !activeEpisodeTitle) return;

    try {
      const art = resolveMediaArtwork(activeCoverUrl);
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeEpisodeTitle,
        artist: activeBookTitle,
        album: activeVoiceName,
        artwork: [
          { src: art.src, sizes: '192x192', type: art.type },
          { src: art.src, sizes: '512x512', type: art.type }
        ]
      });
    } catch {}

    const safeSetHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {}
    };

    safeSetHandler('play', () => {
      configureNativeAudioSession();
      wantedPlayRef.current = true;
      setPlaybackGain(1);
      audioRef.current?.play().catch(() => {});
    });
    safeSetHandler('pause', () => {
      wantedPlayRef.current = false;
      audioRef.current?.pause();
    });
    safeSetHandler('stop', () => {
      wantedPlayRef.current = false;
      audioRef.current?.pause();
    });
    // Clear ±15s handlers so iOS Lock Screen renders Prev/Next episode buttons alongside scrubber
    safeSetHandler('seekbackward', null);
    safeSetHandler('seekforward', null);
    safeSetHandler('previoustrack', hasPrevAudioEpisode ? skipPrev : null);
    safeSetHandler('nexttrack', hasNextAudioEpisode ? skipNext : null);
    safeSetHandler('seekto', (details) => {
      if (typeof details.seekTime === 'number' && Number.isFinite(details.seekTime)) {
        const audio = audioRef.current;
        if (audio) {
          const dur = audio.duration || 0;
          const target = dur > 0 ? Math.max(0, Math.min(details.seekTime, dur)) : details.seekTime;
          if (details.fastSeek && typeof audio.fastSeek === 'function') {
            audio.fastSeek(target);
          } else {
            audio.currentTime = target;
          }
          lastKnownTimeRef.current = target;
          setCurrentTime(target);
          syncMediaSessionPosition();
        }
      }
    });
  }, [
    activeBookTitle,
    activeCoverUrl,
    activeEpisodeId,
    activeEpisodeTitle,
    activeVoiceName,
    hasNextAudioEpisode,
    hasPrevAudioEpisode,
    setPlaybackGain,
    skipNext,
    skipPrev,
    syncMediaSessionPosition
  ]);

  // Save audio progress on pagehide
  useEffect(() => {
    window.addEventListener('pagehide', flushActiveAudioProgress);
    return () => window.removeEventListener('pagehide', flushActiveAudioProgress);
  }, [flushActiveAudioProgress]);

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

  const showInAppBrowserAudioHint =
    isHydrated && isInAppBrowser && !inAppHintDismissed && Boolean(activeTrack);

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
        navigateToGate,
        navigateToFoyer,
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
        showInAppBrowserAudioHint,
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
        dismissInAppBrowserAudioHint,
        retryPlayback,
        continueItems
      }}
    >
      {children}
      {/* Persistent Singleton Hardware-Backed Audio Element */}
      <audio
        ref={audioRef}
        preload={activeTrack ? (saveDataMode ? 'metadata' : 'auto') : 'metadata'}
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          const pending = pendingSeekRef.current;
          pendingSeekRef.current = null;

          const dur =
            (el.duration && Number.isFinite(el.duration) ? el.duration : 0) ||
            pending?.fallbackDuration ||
            activeTrackRef.current?.durationSeconds ||
            0;
          if (dur > 0) {
            setDuration(dur);
          }

          el.defaultPlaybackRate = playbackRateRef.current;
          el.playbackRate = playbackRateRef.current;

          if (pending?.mode === 'seconds') {
            if (pending.seconds > 0 && (!dur || pending.seconds < dur - 1)) {
              try {
                el.currentTime = pending.seconds;
                lastKnownTimeRef.current = pending.seconds;
                setCurrentTime(pending.seconds);
              } catch {}
            } else {
              lastKnownTimeRef.current = 0;
              setCurrentTime(0);
            }
          } else if (pending?.mode === 'ratio' && dur > 0) {
            const mapped = Math.max(0, Math.min(dur - 0.5, pending.ratio * dur));
            try {
              el.currentTime = mapped;
              lastKnownTimeRef.current = mapped;
              setCurrentTime(mapped);
            } catch {}
          }

          syncMediaSessionPosition();
        }}
        onPlay={() => {
          wantedPlayRef.current = true;
          setIsPlaying(true);
          setIsBuffering(false);
          setMediaSessionPlaybackState('playing');
          syncMediaSessionPosition();
        }}
        onPause={() => {
          setIsPlaying(false);
          setMediaSessionPlaybackState('paused');
          syncMediaSessionPosition();
          flushActiveAudioProgress();
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          clearRetryTimer();
          retryCountRef.current = 0;
          setIsBuffering(false);
          setPlayerError(null);
          setMediaSessionPlaybackState('playing');
          syncMediaSessionPosition();
        }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          const pos = el.currentTime;
          if (Number.isFinite(pos)) {
            setCurrentTime(pos);
            if (pos > 0) {
              lastKnownTimeRef.current = pos;
            }
          }
          const dur = el.duration && Number.isFinite(el.duration) ? el.duration : 0;
          if (dur > 0) {
            setDuration(dur);
          }

          // Hardware-driven sleep timer check (works reliably even when phone screen is locked)
          if (evaluateSleepDeadline()) {
            return;
          }

          const rem = dur > 0 ? dur - pos : 0;

          // Gentle 8-second fade-out on platforms supporting HTMLAudioElement.volume
          if (
            sleepTimerModeRef.current === 'end_of_episode' &&
            dur > 20 &&
            !el.paused
          ) {
            if (rem > 0 && rem <= 8) {
              setPlaybackGain(rem / 8);
            } else if (rem > 8 && el.volume < 0.99) {
              setPlaybackGain(1);
            }
          }

          // Pre-warm next episode's initial 512 KB in final 20s when Auto-Next is active & Data Saver is off
          if (
            rem > 0 &&
            rem <= 20 &&
            !el.paused &&
            sleepTimerModeRef.current !== 'end_of_episode' &&
            autoNextRef.current &&
            (!sleepDeadlineMs.current ||
              sleepDeadlineMs.current - Date.now() > (rem + 2) * 1000) &&
            !isDataSaverEnabled()
          ) {
            const nextEp = findAdjacentAudioEpisode(1);
            const nextTrk = nextEp ? selectBestTrack(nextEp) : null;
            if (nextTrk?.audioUrl && prewarmedUrlRef.current !== nextTrk.audioUrl) {
              prewarmedUrlRef.current = nextTrk.audioUrl;
              fetch(nextTrk.audioUrl, {
                headers: { Range: 'bytes=0-524287' },
                credentials: 'same-origin'
              }).catch(() => {});
            }
          }

          const now = Date.now();
          if (now - lastPositionSyncWallMs.current >= 5000) {
            lastPositionSyncWallMs.current = now;
            syncMediaSessionPosition();
          }

          const book = activeBookRef.current;
          const ep = activeEpisodeRef.current;
          const trk = activeTrackRef.current;
          if (now - lastSaveWallMs.current >= 5000 && book && ep && trk) {
            lastSaveWallMs.current = now;
            persistProgress(
              book.id,
              ep.id,
              trk.voiceProfile.voiceKey,
              trk.updatedAt,
              pos,
              dur || trk.durationSeconds
            );
          }
        }}
        onError={() => {
          const trk = activeTrackRef.current;
          if (trk && wantedPlayRef.current && retryCountRef.current < 3) {
            retryCountRef.current += 1;
            const attempt = retryCountRef.current;
            const delayMs = attempt === 1 ? 1200 : attempt === 2 ? 2800 : 5500;
            setIsBuffering(true);
            clearRetryTimer();
            retryTimerRef.current = setTimeout(() => {
              retryTimerRef.current = null;
              const currentTrk = activeTrackRef.current;
              const el = audioRef.current;
              if (!currentTrk || !el || !wantedPlayRef.current) return;
              pendingSeekRef.current = {
                mode: 'seconds',
                seconds: lastKnownTimeRef.current,
                fallbackDuration: currentTrk.durationSeconds || 0
              };
              configureNativeAudioSession();
              setPlaybackGain(1);
              el.src = currentTrk.audioUrl;
              el.defaultPlaybackRate = playbackRateRef.current;
              el.playbackRate = playbackRateRef.current;
              el.play().catch(() => {});
            }, delayMs);
            return;
          }

          setIsBuffering(false);
          setIsPlaying(false);
          setMediaSessionPlaybackState('paused');
          setPlayerError('Đang chờ kết nối mạng hoặc tệp âm thanh tạm gián đoạn.');
        }}
        onEnded={() => {
          setPlaybackGain(1);
          const book = activeBookRef.current;
          const ep = activeEpisodeRef.current;
          const trk = activeTrackRef.current;
          if (book && ep && trk) {
            const dur =
              (audioRef.current?.duration && Number.isFinite(audioRef.current.duration)
                ? audioRef.current.duration
                : 0) ||
              duration ||
              trk.durationSeconds ||
              1;
            persistProgress(
              book.id,
              ep.id,
              trk.voiceProfile.voiceKey,
              trk.updatedAt,
              dur,
              dur
            );
          }

          if (evaluateSleepDeadline()) {
            setIsPlaying(false);
            setMediaSessionPlaybackState('paused');
            return;
          }

          if (sleepTimerModeRef.current === 'end_of_episode' || !autoNextRef.current) {
            wantedPlayRef.current = false;
            setIsPlaying(false);
            setMediaSessionPlaybackState('paused');
            setSleepRemainingSeconds(null);
            return;
          }

          const next = findAdjacentAudioEpisode(1);
          if (next && book) {
            playEpisode(book, next);
          } else {
            wantedPlayRef.current = false;
            setIsPlaying(false);
            setMediaSessionPlaybackState('paused');
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
