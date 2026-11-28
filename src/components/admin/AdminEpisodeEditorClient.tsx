'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookLineCode,
  CuriosityTrailLink,
  HydratedBook,
  HydratedEpisode,
  KnowledgeMetadata,
  PublishStatus,
  VoiceProfile
} from '@/lib/types';
import {
  ACTIVE_BOOK_LINES,
  CROSS_CUTTING_CONCEPTS,
  KNOWLEDGE_PILLARS,
  getBookLineByCode
} from '@/lib/knowledge';
import { countWords, parseStoryMarkdown } from '@/lib/markdown';
import { formatDurationShort, isEpisodeReadingOnly } from '@/lib/presets';
import {
  measureAudioFileDuration,
  uploadMediaWithProgress
} from '@/lib/uploadClient';
import { BookCover } from '@/components/ui/BookCover';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CloseIcon,
  EyeIcon,
  ImageIcon,
  MicIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon
} from '@/components/ui/Icons';

interface EditableTrack {
  localKey: string;
  id?: string;
  voiceProfileId: string;
  audioUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  isDefault: boolean;
  uploadingPct: number | null;
  uploadError: string | null;
  pendingFile: File | null;
}

interface EditableIllustration {
  localKey: string;
  id?: string;
  imageUrl: string;
  altText: string;
  uploadingPct: number | null;
  uploadError: string | null;
  pendingFile: File | null;
}

interface AdminEpisodeEditorClientProps {
  books: HydratedBook[];
  voiceProfiles: VoiceProfile[];
  initialEpisode: HydratedEpisode | null;
  defaultBookId: string;
}

export function AdminEpisodeEditorClient({
  books,
  voiceProfiles,
  initialEpisode,
  defaultBookId
}: AdminEpisodeEditorClientProps) {
  const router = useRouter();
  const isNew = !initialEpisode;
  const draftStorageKey = `litibook_cms_draft_${initialEpisode?.id || `new_${defaultBookId}`}`;

  const [activeTab, setActiveTab] = useState<'info' | 'audio' | 'art' | 'text'>('info');
  const [bookId, setBookId] = useState(initialEpisode?.bookId || defaultBookId);
  const selectedBook = useMemo(
    () => books.find((b) => b.id === bookId) || books[0],
    [books, bookId]
  );

  const [partId, setPartId] = useState<string>(initialEpisode?.partId || '');
  const [episodeCode, setEpisodeCode] = useState(
    initialEpisode?.episodeCode ||
      String((selectedBook?.episodes.length || 0) + 1).padStart(2, '0')
  );
  const [title, setTitle] = useState(initialEpisode?.title || '');
  const [categoryTag, setCategoryTag] = useState(initialEpisode?.categoryTag || '');
  const [summary, setSummary] = useState(initialEpisode?.summary || '');
  const [coverUrl, setCoverUrl] = useState(initialEpisode?.coverUrl || '');
  const [coverUploadPct, setCoverUploadPct] = useState<number | null>(null);

  const [isTextOnly, setIsTextOnly] = useState(() => {
    if (initialEpisode) return initialEpisode.isTextOnly;
    if (
      selectedBook &&
      selectedBook.episodes.length > 0 &&
      selectedBook.episodes.every((ep) => isEpisodeReadingOnly(ep))
    ) {
      return true;
    }
    return false;
  });
  const [tracks, setTracks] = useState<EditableTrack[]>(() =>
    (initialEpisode?.audioTracks || []).map((t) => ({
      localKey: t.id,
      id: t.id,
      voiceProfileId: t.voiceProfileId,
      audioUrl: t.audioUrl,
      durationSeconds: t.durationSeconds,
      fileSizeBytes: t.fileSizeBytes,
      mimeType: t.mimeType,
      isDefault: t.isDefault,
      uploadingPct: null,
      uploadError: null,
      pendingFile: null
    }))
  );

  const [illustrations, setIllustrations] = useState<EditableIllustration[]>(() =>
    (initialEpisode?.illustrations || []).map((ill) => ({
      localKey: ill.id,
      id: ill.id,
      imageUrl: ill.imageUrl,
      altText: ill.altText,
      uploadingPct: null,
      uploadError: null,
      pendingFile: null
    }))
  );

  const [contentMarkdown, setContentMarkdown] = useState(
    initialEpisode?.contentMarkdown || ''
  );
  const [status, setStatus] = useState<PublishStatus>(initialEpisode?.status || 'draft');

  // Knowledge Architecture v2.0 (Episode-level Interdisciplinary Metadata & Curiosity Trails)
  const [knowledgeOpen, setKnowledgeOpen] = useState<boolean>(() =>
    Boolean(
      initialEpisode?.knowledgeMeta?.primaryLine ||
        initialEpisode?.knowledgeMeta?.curiosityTrails?.length ||
        isNew
    )
  );
  const [primaryLine, setPrimaryLine] = useState<BookLineCode | ''>(
    initialEpisode?.knowledgeMeta?.primaryLine ||
      selectedBook?.knowledgeMeta?.primaryLine ||
      ''
  );
  const [secondaryLines, setSecondaryLines] = useState<BookLineCode[]>(
    initialEpisode?.knowledgeMeta?.secondaryLines || []
  );
  const [crossCuttingConcepts, setCrossCuttingConcepts] = useState<string[]>(
    initialEpisode?.knowledgeMeta?.crossCuttingConcepts ||
      selectedBook?.knowledgeMeta?.crossCuttingConcepts?.slice(0, 2) ||
      []
  );
  const [topicKeywordsInput, setTopicKeywordsInput] = useState<string>(
    (initialEpisode?.knowledgeMeta?.topicKeywords || []).join(', ')
  );
  const [curriculumAnchorsInput, setCurriculumAnchorsInput] = useState<string>(
    (initialEpisode?.knowledgeMeta?.curriculumAnchors || []).join(', ')
  );
  const [curiosityTrails, setCuriosityTrails] = useState<CuriosityTrailLink[]>(
    initialEpisode?.knowledgeMeta?.curiosityTrails || []
  );

  const toggleSecondaryLine = (code: BookLineCode) => {
    setSecondaryLines((prev) => {
      if (prev.includes(code)) return prev.filter((item) => item !== code);
      if (prev.length >= 2) return [...prev.slice(1), code];
      return [...prev, code];
    });
    setIsDirty(true);
  };

  const toggleConcept = (conceptSlug: string) => {
    setCrossCuttingConcepts((prev) => {
      if (prev.includes(conceptSlug)) return prev.filter((s) => s !== conceptSlug);
      if (prev.length >= 6) return prev;
      return [...prev, conceptSlug];
    });
    setIsDirty(true);
  };

  const [isDirty, setIsDirty] = useState(false);
  const [autoSavedAt, setAutoSavedAt] = useState<string | null>(null);
  const [hasRestorableLocalDraft, setHasRestorableLocalDraft] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'story' | 'gallery'>('story');

  const mountedRef = useRef(false);

  // Check if a newer unsaved local draft exists in localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.savedAt) {
          const serverUpdated = initialEpisode
            ? new Date(initialEpisode.updatedAt).getTime()
            : 0;
          if (parsed.savedAt > serverUpdated + 2000) {
            setHasRestorableLocalDraft(true);
          }
        }
      }
    } catch {}
    mountedRef.current = true;
  }, [draftStorageKey, initialEpisode]);

  const restoreLocalDraft = () => {
    try {
      const raw = localStorage.getItem(draftStorageKey);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title !== undefined) setTitle(d.title);
      if (d.episodeCode !== undefined) setEpisodeCode(d.episodeCode);
      if (d.categoryTag !== undefined) setCategoryTag(d.categoryTag);
      if (d.summary !== undefined) setSummary(d.summary);
      if (d.coverUrl !== undefined) setCoverUrl(d.coverUrl);
      if (d.isTextOnly !== undefined) setIsTextOnly(d.isTextOnly);
      if (d.contentMarkdown !== undefined) setContentMarkdown(d.contentMarkdown);
      if (d.primaryLine !== undefined) setPrimaryLine(d.primaryLine);
      if (Array.isArray(d.secondaryLines)) setSecondaryLines(d.secondaryLines);
      if (Array.isArray(d.crossCuttingConcepts)) {
        setCrossCuttingConcepts(d.crossCuttingConcepts);
      }
      if (d.topicKeywordsInput !== undefined) setTopicKeywordsInput(d.topicKeywordsInput);
      if (d.curriculumAnchorsInput !== undefined) {
        setCurriculumAnchorsInput(d.curriculumAnchorsInput);
      }
      if (Array.isArray(d.curiosityTrails)) setCuriosityTrails(d.curiosityTrails);
      setHasRestorableLocalDraft(false);
      setSuccessMsg('Đã khôi phục bản nháp tự lưu gần nhất trên trình duyệt.');
    } catch {}
  };

  // Auto-save form + Markdown to localStorage every 3s when edited (ADM-008, AC-06)
  useEffect(() => {
    if (!mountedRef.current || !isDirty) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          draftStorageKey,
          JSON.stringify({
            savedAt: Date.now(),
            title,
            episodeCode,
            categoryTag,
            summary,
            coverUrl,
            isTextOnly,
            contentMarkdown,
            primaryLine,
            secondaryLines,
            crossCuttingConcepts,
            topicKeywordsInput,
            curriculumAnchorsInput,
            curiosityTrails
          })
        );
        const now = new Date();
        setAutoSavedAt(
          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        );
      } catch {}
    }, 3000);
    return () => clearTimeout(timer);
  }, [
    isDirty,
    draftStorageKey,
    title,
    episodeCode,
    categoryTag,
    summary,
    coverUrl,
    isTextOnly,
    contentMarkdown,
    primaryLine,
    secondaryLines,
    crossCuttingConcepts,
    topicKeywordsInput,
    curriculumAnchorsInput,
    curiosityTrails
  ]);

  // Warn before closing browser tab when dirty
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const wordCount = useMemo(() => countWords(contentMarkdown), [contentMarkdown]);

  // Cover upload
  const handleEpisodeCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploadPct(1);
    setError(null);
    try {
      const res = await uploadMediaWithProgress({
        file,
        kind: 'image',
        bookSlug: selectedBook?.slug || 'episode',
        onProgress: setCoverUploadPct
      });
      setCoverUrl(res.publicUrl);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải bìa tập thất bại.');
    } finally {
      setCoverUploadPct(null);
    }
  };

  // Audio Track Upload & Retry without losing Markdown/form state (AC-06)
  const performTrackUpload = async (localKey: string, file: File) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.localKey === localKey
          ? { ...t, uploadingPct: 1, uploadError: null, pendingFile: file }
          : t
      )
    );
    const measuredDuration = await measureAudioFileDuration(file);
    try {
      const res = await uploadMediaWithProgress({
        file,
        kind: 'audio',
        bookSlug: selectedBook?.slug || 'audio',
        onProgress: (pct) => {
          setTracks((prev) =>
            prev.map((t) => (t.localKey === localKey ? { ...t, uploadingPct: pct } : t))
          );
        }
      });
      setTracks((prev) =>
        prev.map((t) =>
          t.localKey === localKey
            ? {
                ...t,
                audioUrl: res.publicUrl,
                durationSeconds: measuredDuration || t.durationSeconds,
                fileSizeBytes: res.fileSizeBytes,
                mimeType: res.mimeType,
                uploadingPct: null,
                uploadError: null,
                pendingFile: null
              }
            : t
        )
      );
      setIsDirty(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Tải tệp âm thanh thất bại.';
      setTracks((prev) =>
        prev.map((t) =>
          t.localKey === localKey ? { ...t, uploadingPct: null, uploadError: msg } : t
        )
      );
    }
  };

  const addAudioTrackSlot = () => {
    if (tracks.length >= 5) return;
    const usedIds = new Set(tracks.map((t) => t.voiceProfileId));
    const nextVoice =
      voiceProfiles.find((v) => !usedIds.has(v.id)) || voiceProfiles[0];
    if (!nextVoice) return;
    setTracks((prev) => [
      ...prev,
      {
        localKey: `trk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        voiceProfileId: nextVoice.id,
        audioUrl: '',
        durationSeconds: 0,
        fileSizeBytes: 0,
        mimeType: 'audio/mpeg',
        isDefault: prev.length === 0,
        uploadingPct: null,
        uploadError: null,
        pendingFile: null
      }
    ]);
    setIsDirty(true);
  };

  // Portrait 3:4 Illustration Upload & Retry
  const performIllustrationUpload = async (localKey: string, file: File) => {
    setIllustrations((prev) =>
      prev.map((ill) =>
        ill.localKey === localKey
          ? { ...ill, uploadingPct: 1, uploadError: null, pendingFile: file }
          : ill
      )
    );
    try {
      const res = await uploadMediaWithProgress({
        file,
        kind: 'image',
        bookSlug: selectedBook?.slug || 'illustrations',
        onProgress: (pct) => {
          setIllustrations((prev) =>
            prev.map((ill) =>
              ill.localKey === localKey ? { ...ill, uploadingPct: pct } : ill
            )
          );
        }
      });
      setIllustrations((prev) =>
        prev.map((ill) =>
          ill.localKey === localKey
            ? {
                ...ill,
                imageUrl: res.publicUrl,
                uploadingPct: null,
                uploadError: null,
                pendingFile: null
              }
            : ill
        )
      );
      setIsDirty(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Tải tranh minh họa thất bại.';
      setIllustrations((prev) =>
        prev.map((ill) =>
          ill.localKey === localKey
            ? { ...ill, uploadingPct: null, uploadError: msg }
            : ill
        )
      );
    }
  };

  const handleMultiIllustrationSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remainingSlots = Math.max(0, 20 - illustrations.length);
    const toProcess = files.slice(0, remainingSlots);

    for (const file of toProcess) {
      const localKey = `ill-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setIllustrations((prev) => [
        ...prev,
        {
          localKey,
          imageUrl: '',
          altText: title || 'Tranh minh họa truyện',
          uploadingPct: 1,
          uploadError: null,
          pendingFile: file
        }
      ]);
      await performIllustrationUpload(localKey, file);
    }
    e.target.value = '';
  };

  const insertIllustrationIntoMarkdown = (ill: EditableIllustration) => {
    if (!ill.imageUrl) return;
    const snippet = `\n\n![${ill.altText || title || 'Tranh minh họa'}](${ill.imageUrl})\n\n`;
    setContentMarkdown((prev) => `${prev.trimEnd()}${snippet}`);
    setIsDirty(true);
    setSuccessMsg('Đã chèn tranh khổ dọc 3:4 vào cuối Bản chữ.');
  };

  // Pre-publish checklist evaluation
  const validTracksCount = tracks.filter((t) => Boolean(t.audioUrl.trim())).length;
  const checklist = [
    { label: 'Đã có Tiêu đề tập truyện', ok: Boolean(title.trim()) },
    {
      label: isTextOnly
        ? 'Chế độ Chỉ đọc chữ đã bật'
        : `Có ít nhất 1 tệp Audio hợp lệ (hiện có ${validTracksCount})`,
      ok: isTextOnly || validTracksCount > 0
    },
    {
      label: 'Bộ sách đã xác nhận bản quyền hợp lệ',
      ok: Boolean(selectedBook?.rightsConfirmed)
    },
    {
      label: `Bản chữ trong giới hạn 30.000 từ (${wordCount} từ)`,
      ok: wordCount <= 30000
    }
  ];
  const canPublish = checklist.every((c) => c.ok);

  const handleSave = async (targetStatus: PublishStatus) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    const parsedKeywords = topicKeywordsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedAnchors = curriculumAnchorsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const knowledgeMetaPayload: KnowledgeMetadata = {
      ...(initialEpisode?.knowledgeMeta || {}),
      primaryPillar: undefined,
      primaryLine: primaryLine || undefined,
      secondaryLines,
      crossCuttingConcepts,
      topicKeywords: parsedKeywords,
      curriculumAnchors: parsedAnchors,
      curiosityTrails: curiosityTrails.filter(
        (item) => item.targetEpisodeId.trim() && item.bridgeQuestion.trim()
      )
    };
    try {
      const res = await fetch('/api/admin/episodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialEpisode?.id,
          bookId,
          partId: partId || null,
          episodeCode,
          title,
          categoryTag,
          summary,
          coverUrl,
          contentMarkdown,
          isTextOnly,
          status: targetStatus,
          knowledgeMeta: knowledgeMetaPayload,
          audioTracks: tracks
            .filter((t) => t.audioUrl.trim())
            .map((t) => ({
              id: t.id,
              voiceProfileId: t.voiceProfileId,
              audioUrl: t.audioUrl,
              durationSeconds: t.durationSeconds,
              fileSizeBytes: t.fileSizeBytes,
              mimeType: t.mimeType,
              isDefault: t.isDefault
            })),
          illustrations: illustrations
            .filter((ill) => ill.imageUrl.trim())
            .map((ill) => ({
              id: ill.id,
              imageUrl: ill.imageUrl,
              altText: ill.altText
            }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể lưu Tập truyện.');
        setSaving(false);
        return;
      }

      setStatus(data.episode.status);
      setIsDirty(false);
      try {
        localStorage.removeItem(draftStorageKey);
      } catch {}

      setSuccessMsg(
        targetStatus === 'published'
          ? 'Đã xuất bản Tập truyện thành công.'
          : 'Đã lưu nháp Tập truyện.'
      );
      if (isNew) {
        router.push(`/admin/episodes/${data.episode.id}`);
      }
      router.refresh();
    } catch {
      setError('Mất kết nối mạng khi lưu. Nội dung Bản chữ vẫn được bảo toàn trên trình duyệt.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToTrash = async () => {
    if (!initialEpisode) return;
    if (
      !window.confirm(
        `Đưa tập "${initialEpisode.title}" vào Thùng rác? Bạn có thể khôi phục trong 30 ngày.`
      )
    ) {
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'episode', id: initialEpisode.id, action: 'trash' })
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Không thể đưa tập vào Thùng rác.');
      setSaving(false);
    }
  };

  const previewBlocks = useMemo(
    () => parseStoryMarkdown(contentMarkdown, title),
    [contentMarkdown, title]
  );

  const previewGallery = useMemo(() => {
    const urls: string[] = [];
    previewBlocks.forEach((b) => {
      if (b.type === 'image' && !urls.includes(b.url)) urls.push(b.url);
    });
    illustrations.forEach((ill) => {
      if (ill.imageUrl && !urls.includes(ill.imageUrl)) urls.push(ill.imageUrl);
    });
    if (urls.length === 0 && (coverUrl || selectedBook?.coverUrl)) {
      urls.push(coverUrl || selectedBook.coverUrl);
    }
    return urls;
  }, [previewBlocks, illustrations, coverUrl, selectedBook]);

  return (
    <div className="px-4 pt-3 pb-16 space-y-4">
      {/* Sticky Top Action Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 py-2.5 flex items-center justify-between gap-2"
      >
        <div className="min-w-0">
          <Link
            href="/admin"
            style={{ color: 'var(--text-secondary)' }}
            className="inline-flex items-center gap-0.5 text-xs font-medium"
          >
            <ChevronLeftIcon size={16} />
            <span>Xưởng sách</span>
          </Link>
          {autoSavedAt && (
            <span
              className="block text-[10px] tabular-nums"
              style={{ color: 'var(--text-secondary)' }}
            >
              Tự lưu cục bộ {autoSavedAt}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-2.5 rounded-[7px] text-xs inline-flex items-center gap-1"
          >
            <EyeIcon size={14} />
            <span>390px</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-2.5 rounded-[7px] text-xs font-medium"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)',
              opacity: canPublish ? 1 : 0.65
            }}
            className="h-9 px-3 rounded-[7px] text-xs font-semibold"
          >
            {status === 'published' ? 'Cập nhật' : 'Xuất bản'}
          </button>
        </div>
      </header>

      {hasRestorableLocalDraft && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)'
          }}
          className="p-3 rounded-[8px] text-xs flex items-center justify-between gap-2"
        >
          <span>Tìm thấy bản nháp chưa lưu trên trình duyệt này.</span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreLocalDraft}
              style={{ color: 'var(--accent-primary)' }}
              className="font-semibold underline"
            >
              Khôi phục
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem(draftStorageKey);
                setHasRestorableLocalDraft(false);
              }}
              style={{ color: 'var(--text-secondary)' }}
            >
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--accent-berry)'
          }}
          className="p-3 rounded-[8px] text-xs leading-relaxed"
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--accent-primary)'
          }}
          className="p-3 rounded-[8px] text-xs font-medium"
        >
          {successMsg}
        </div>
      )}

      {/* 4 Editor Tabs */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)'
        }}
        className="grid grid-cols-4 rounded-[8px] p-1 text-xs"
      >
        {(
          [
            { key: 'info', label: 'Thông tin' },
            { key: 'audio', label: `Audio (${validTracksCount})` },
            { key: 'art', label: `Tranh (${illustrations.length})` },
            { key: 'text', label: 'Bản chữ' }
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              backgroundColor: activeTab === t.key ? 'var(--bg-elevated)' : 'transparent',
              color: activeTab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
            className="h-9 rounded-[6px] font-semibold truncate px-1"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: INFO */}
      {activeTab === 'info' && (
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hairline)'
          }}
          className="rounded-[10px] p-4 space-y-3.5 text-xs"
        >
          <div>
            <label className="block font-medium mb-1">Thuộc Bộ sách *</label>
            <select
              value={bookId}
              onChange={(e) => {
                setBookId(e.target.value);
                setPartId('');
                setIsDirty(true);
              }}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {selectedBook && selectedBook.parts.length > 0 && (
            <div>
              <label className="block font-medium mb-1">Thuộc Phần / Mùa</label>
              <select
                value={partId}
                onChange={(e) => {
                  setPartId(e.target.value);
                  setIsDirty(true);
                }}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="w-full h-10 px-3 rounded-[7px] outline-none"
              >
                <option value="">-- Không chia phần --</option>
                {selectedBook.parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium mb-1">Mã số tập</label>
              <input
                type="text"
                value={episodeCode}
                onChange={(e) => {
                  setEpisodeCode(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="01"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="w-full h-10 px-3 rounded-[7px] outline-none tabular-nums"
              />
            </div>
            <div className="col-span-2">
              <label className="block font-medium mb-1">Nhãn chủ đề ngắn</label>
              <input
                type="text"
                value={categoryTag}
                onChange={(e) => {
                  setCategoryTag(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="vd: Miễn dịch học · Đêm 01"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="w-full h-10 px-3 rounded-[7px] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Tiêu đề Tập truyện *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              placeholder="Nhập tên văn học của tập truyện..."
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] text-sm font-editorial outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Tóm tắt ngắn (tùy chọn)</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                setIsDirty(true);
              }}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full p-3 rounded-[7px] outline-none"
            />
          </div>

          {/* Optional Episode Cover */}
          <div className="pt-1 flex gap-3.5 items-start">
            <div className="w-20 shrink-0">
              <BookCover
                src={coverUrl || selectedBook?.coverUrl || ''}
                alt={title || 'Bìa tập'}
              />
            </div>
            <div className="space-y-2">
              <span className="block font-medium">Bìa riêng của Tập (3:4, tùy chọn)</span>
              <p style={{ color: 'var(--text-secondary)' }}>
                Nếu để trống, tập sẽ kế thừa tranh bìa của Bộ sách.
              </p>
              <div className="flex items-center gap-2">
                <label
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="h-9 px-3 rounded-[7px] inline-flex items-center gap-1.5 font-medium cursor-pointer"
                >
                  <UploadIcon size={13} />
                  <span>
                    {coverUploadPct !== null ? `Đang tải ${coverUploadPct}%` : 'Tải bìa tập'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleEpisodeCoverUpload}
                    className="hidden"
                  />
                </label>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCoverUrl('');
                      setIsDirty(true);
                    }}
                    style={{ color: 'var(--text-secondary)' }}
                    className="underline"
                  >
                    Dùng bìa Bộ sách
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Collapsible Knowledge Metadata v2.0 & Curiosity Trails */}
          <div className="pt-3 border-t border-[var(--border-hairline)] space-y-3">
            <button
              type="button"
              onClick={() => setKnowledgeOpen((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 text-left"
            >
              <div>
                <span className="block text-sm font-semibold font-editorial">
                  Nhãn Tri thức Liên ngành &amp; Mạch kết nối (v2.0)
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Gắn dòng sách, khái niệm xuyên ngành và tối đa 2 cầu nối sang tập khác trên Mục lục Bộ sách.
                </span>
              </div>
              <span
                style={{ color: 'var(--text-secondary)' }}
                className={`shrink-0 transition-transform ${knowledgeOpen ? 'rotate-180' : ''}`}
              >
                <ChevronDownIcon size={16} />
              </span>
            </button>

            {knowledgeOpen && (
              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block font-medium mb-1">Dòng sách chính của tập</label>
                  <select
                    value={primaryLine}
                    onChange={(e) => {
                      const nextCode = e.target.value as BookLineCode | '';
                      setPrimaryLine(nextCode);
                      if (nextCode) {
                        setSecondaryLines((prev) => prev.filter((c) => c !== nextCode));
                      }
                      setIsDirty(true);
                    }}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="w-full h-10 px-3 rounded-[7px] outline-none"
                  >
                    <option value="">-- Kế thừa từ Bộ sách --</option>
                    {KNOWLEDGE_PILLARS.map((pillar) => (
                      <optgroup key={pillar.code} label={pillar.title}>
                        {ACTIVE_BOOK_LINES.filter((l) => l.pillar === pillar.code).map(
                          (line) => (
                            <option key={line.code} value={line.code}>
                              {line.code} · {line.title}
                            </option>
                          )
                        )}
                      </optgroup>
                    ))}
                  </select>
                  {primaryLine && (
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {getBookLineByCode(primaryLine)?.scopeSummary}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-1.5">
                    Dòng sách giao thoa (tối đa 2 dòng)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACTIVE_BOOK_LINES.filter((l) => l.code !== primaryLine).map((line) => {
                      const active = secondaryLines.includes(line.code);
                      return (
                        <button
                          key={line.code}
                          type="button"
                          onClick={() => toggleSecondaryLine(line.code)}
                          style={{
                            backgroundColor: active
                              ? 'var(--accent-warm)'
                              : 'var(--bg-canvas)',
                            color: active
                              ? 'var(--accent-primary-fg)'
                              : 'var(--text-primary)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="h-7 px-2.5 rounded-[6px] text-[11px] font-medium py-0.5"
                        >
                          {line.code} · {line.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1.5">
                    Khái niệm xuyên ngành ({crossCuttingConcepts.length}/6)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CROSS_CUTTING_CONCEPTS.map((concept) => {
                      const active = crossCuttingConcepts.includes(concept.slug);
                      return (
                        <button
                          key={concept.slug}
                          type="button"
                          title={concept.hint}
                          onClick={() => toggleConcept(concept.slug)}
                          style={{
                            backgroundColor: active
                              ? 'var(--accent-primary)'
                              : 'var(--bg-canvas)',
                            color: active
                              ? 'var(--accent-primary-fg)'
                              : 'var(--text-primary)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="h-7 px-2.5 rounded-[6px] text-[11px] font-medium py-0.5"
                        >
                          {concept.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium mb-1">
                      Từ khóa hạt nhân (phân tách dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={topicKeywordsInput}
                      onChange={(e) => {
                        setTopicKeywordsInput(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="vd: phát quang sinh học, enzyme luciferin"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="w-full h-10 px-3 rounded-[7px] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">
                      Neo chương trình phổ thông ẩn (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={curriculumAnchorsInput}
                      onChange={(e) => {
                        setCurriculumAnchorsInput(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="vd: KHTN-6:te-bao, CN-6:che-bien-thuc-pham"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="w-full h-10 px-3 rounded-[7px] outline-none"
                    />
                  </div>
                </div>

                {/* Curiosity Trails (max 2, rendered only on Book Detail TOC, never on Episode Reader) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="block font-medium">
                        Mạch kết nối liên ngành ({curiosityTrails.length}/2)
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Hiển thị dưới Mục lục Bộ sách (không bao giờ chèn hộp cuối trang đọc chữ).
                      </span>
                    </div>
                    {curiosityTrails.length < 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCuriosityTrails((prev) => [
                            ...prev,
                            { targetEpisodeId: '', bridgeQuestion: '' }
                          ]);
                          setIsDirty(true);
                        }}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="h-8 px-2.5 rounded-[6px] inline-flex items-center gap-1 font-medium shrink-0"
                      >
                        <PlusIcon size={13} />
                        <span>Thêm kết nối</span>
                      </button>
                    )}
                  </div>

                  {curiosityTrails.map((trail, tIdx) => (
                    <div
                      key={tIdx}
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="rounded-[8px] p-2.5 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={trail.targetEpisodeId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCuriosityTrails((prev) =>
                              prev.map((item, i) =>
                                i === tIdx ? { ...item, targetEpisodeId: val } : item
                              )
                            );
                            setIsDirty(true);
                          }}
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="flex-1 h-9 px-2.5 rounded-[6px] outline-none min-w-0"
                        >
                          <option value="">-- Chọn tập truyện đích --</option>
                          {books.map((b) => (
                            <optgroup key={b.id} label={b.title}>
                              {b.episodes
                                .filter((ep) => ep.id !== initialEpisode?.id)
                                .map((ep) => (
                                  <option key={ep.id} value={ep.id}>
                                    Tập {ep.episodeCode} · {ep.title}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label="Xóa kết nối này"
                          onClick={() => {
                            setCuriosityTrails((prev) =>
                              prev.filter((_, i) => i !== tIdx)
                            );
                            setIsDirty(true);
                          }}
                          style={{ color: 'var(--accent-berry)' }}
                          className="w-8 h-8 flex items-center justify-center shrink-0"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={trail.bridgeQuestion}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCuriosityTrails((prev) =>
                            prev.map((item, i) =>
                              i === tIdx ? { ...item, bridgeQuestion: val } : item
                            )
                          );
                          setIsDirty(true);
                        }}
                        placeholder="Câu hỏi gợi mở tò mò sang tập đích..."
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="w-full h-9 px-2.5 rounded-[6px] outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: MULTI-VOICE AUDIO */}
      {activeTab === 'audio' && (
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hairline)'
          }}
          className="rounded-[10px] p-4 space-y-4 text-xs"
        >
          <label className="flex items-center justify-between gap-3 cursor-pointer pb-3 border-b border-[var(--border-hairline)]">
            <div>
              <span className="font-semibold block text-sm font-editorial">
                Tập &ldquo;Chỉ đọc chữ&rdquo; (Chưa có bản thu âm)
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                Khi bật, giao diện đọc ẩn hoàn toàn thanh âm thanh để nhường trọn màn hình cho chữ và tranh.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isTextOnly}
              onChange={(e) => {
                setIsTextOnly(e.target.checked);
                setIsDirty(true);
              }}
              className="w-5 h-5 shrink-0"
            />
          </label>

          {!isTextOnly && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Danh sách Giọng đọc ({tracks.length}/5 bản thu, tối đa 150MB/tệp)
                </span>
                {tracks.length < 5 && (
                  <button
                    type="button"
                    onClick={addAudioTrackSlot}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="h-8 px-2.5 rounded-[6px] inline-flex items-center gap-1 font-medium"
                  >
                    <PlusIcon size={13} />
                    <span>Thêm Giọng</span>
                  </button>
                )}
              </div>

              {tracks.length === 0 && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Chưa có bản thu nào. Bấm &ldquo;Thêm Giọng&rdquo; để tải tệp MP3/M4A lên.
                </p>
              )}

              {tracks.map((trk, idx) => (
                <div
                  key={trk.localKey}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="rounded-[8px] p-3 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1">
                      <MicIcon size={14} />
                      <select
                        value={trk.voiceProfileId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTracks((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, voiceProfileId: val } : item
                            )
                          );
                          setIsDirty(true);
                        }}
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="h-9 px-2.5 rounded-[6px] flex-1 outline-none font-medium"
                      >
                        {voiceProfiles.map((vp) => (
                          <option key={vp.id} value={vp.id}>
                            {vp.displayName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="inline-flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="defaultVoice"
                        checked={trk.isDefault}
                        onChange={() => {
                          setTracks((prev) =>
                            prev.map((item, i) => ({ ...item, isDefault: i === idx }))
                          );
                          setIsDirty(true);
                        }}
                      />
                      <span>Mặc định</span>
                    </label>

                    <button
                      type="button"
                      aria-label="Xóa bản thu này"
                      onClick={() => {
                        setTracks((prev) => prev.filter((_, i) => i !== idx));
                        setIsDirty(true);
                      }}
                      style={{ color: 'var(--accent-berry)' }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-9 px-3 rounded-[6px] inline-flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <UploadIcon size={13} />
                      <span>
                        {trk.uploadingPct !== null
                          ? `Đang tải ${trk.uploadingPct}%...`
                          : trk.audioUrl
                            ? 'Thay tệp Audio'
                            : 'Chọn tệp MP3 / M4A'}
                      </span>
                      <input
                        type="file"
                        accept="audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/aac,audio/wav"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) performTrackUpload(trk.localKey, f);
                        }}
                        className="hidden"
                      />
                    </label>

                    {trk.durationSeconds > 0 && (
                      <span
                        className="tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Thời lượng: {formatDurationShort(trk.durationSeconds)} (
                        {trk.durationSeconds}s)
                      </span>
                    )}
                  </div>

                  {trk.uploadingPct !== null && (
                    <div className="h-1.5 w-full rounded-full bg-[var(--bg-surface)] overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${trk.uploadingPct}%`,
                          backgroundColor: 'var(--accent-primary)'
                        }}
                      />
                    </div>
                  )}

                  {trk.uploadError && (
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span style={{ color: 'var(--accent-berry)' }}>{trk.uploadError}</span>
                      {trk.pendingFile && (
                        <button
                          type="button"
                          onClick={() => performTrackUpload(trk.localKey, trk.pendingFile!)}
                          style={{ color: 'var(--accent-primary)' }}
                          className="font-semibold underline shrink-0"
                        >
                          Thử tải lại
                        </button>
                      )}
                    </div>
                  )}

                  {trk.audioUrl && (
                    <audio controls preload="metadata" src={trk.audioUrl} className="w-full h-9" />
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: PORTRAIT 3:4 ILLUSTRATIONS */}
      {activeTab === 'art' && (
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hairline)'
          }}
          className="rounded-[10px] p-4 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold font-editorial">
                Tranh minh họa đính kèm ({illustrations.length}/20)
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Tranh hiển thị gọn trong mạch cuộn dọc, không sinh hộp chú thích dưới ảnh.
              </p>
            </div>

            {illustrations.length < 20 && (
              <label
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)'
                }}
                className="h-9 px-3 rounded-[7px] inline-flex items-center gap-1.5 font-semibold cursor-pointer shrink-0"
              >
                <ImageIcon size={14} />
                <span>Tải tranh</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleMultiIllustrationSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {illustrations.length === 0 ? (
            <p className="py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              Chưa có tranh đính kèm. Tải tranh màu nước khổ dọc 3:4 và bấm &ldquo;Chèn vào Bản chữ&rdquo; để đặt xen kẽ nội dung.
            </p>
          ) : (
            <div className="space-y-3">
              {illustrations.map((ill, idx) => {
                const alreadyInMarkdown =
                  Boolean(ill.imageUrl) && contentMarkdown.includes(ill.imageUrl);
                return (
                  <div
                    key={ill.localKey}
                    style={{
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="rounded-[8px] p-3 flex gap-3 items-start"
                  >
                    <div className="w-16 aspect-[3/4] rounded-[6px] overflow-hidden shrink-0 border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                      {ill.imageUrl ? (
                        <img
                          src={ill.imageUrl}
                          alt={ill.altText}
                          className="w-full h-full object-cover block"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px]">
                          {ill.uploadingPct !== null ? `${ill.uploadingPct}%` : '...'}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={ill.altText}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIllustrations((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, altText: val } : item
                            )
                          );
                          setIsDirty(true);
                        }}
                        placeholder="Mô tả trợ năng ẩn (không hiện hộp chú thích dưới tranh)"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="w-full h-8 px-2.5 rounded-[6px] outline-none"
                      />

                      {ill.uploadError && (
                        <div className="flex items-center gap-2 text-[11px]">
                          <span style={{ color: 'var(--accent-berry)' }}>
                            {ill.uploadError}
                          </span>
                          {ill.pendingFile && (
                            <button
                              type="button"
                              onClick={() =>
                                performIllustrationUpload(ill.localKey, ill.pendingFile!)
                              }
                              style={{ color: 'var(--accent-primary)' }}
                              className="font-semibold underline"
                            >
                              Thử tải lại
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {ill.imageUrl && (
                          <button
                            type="button"
                            onClick={() => insertIllustrationIntoMarkdown(ill)}
                            style={{
                              backgroundColor: alreadyInMarkdown
                                ? 'var(--bg-surface)'
                                : 'var(--accent-primary)',
                              color: alreadyInMarkdown
                                ? 'var(--accent-primary)'
                                : 'var(--accent-primary-fg)',
                              border: '1px solid var(--border-hairline)'
                            }}
                            className="h-7 px-2.5 rounded-[5px] font-medium"
                          >
                            {alreadyInMarkdown
                              ? 'Đã có trong Bản chữ (Chèn thêm)'
                              : 'Chèn vào Bản chữ'}
                          </button>
                        )}

                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIllustrations((prev) => {
                                const copy = [...prev];
                                [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                                return copy;
                              });
                              setIsDirty(true);
                            }}
                            className="underline"
                          >
                            Lên
                          </button>
                        )}
                        {idx < illustrations.length - 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setIllustrations((prev) => {
                                const copy = [...prev];
                                [copy[idx], copy[idx + 1]] = [copy[idx + 1], copy[idx]];
                                return copy;
                              });
                              setIsDirty(true);
                            }}
                            className="underline"
                          >
                            Xuống
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setIllustrations((prev) => prev.filter((_, i) => i !== idx));
                            setIsDirty(true);
                          }}
                          style={{ color: 'var(--accent-berry)' }}
                          className="ml-auto"
                        >
                          Gỡ tranh
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 4: MARKDOWN STORY EDITOR */}
      {activeTab === 'text' && (
        <section
          style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-hairline)'
          }}
          className="rounded-[10px] p-4 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold font-editorial text-sm">
              Bản chữ văn học (Markdown sạch)
            </span>
            <span
              style={{
                color:
                  wordCount > 30000 ? 'var(--accent-berry)' : 'var(--text-secondary)'
              }}
              className="tabular-nums font-medium"
            >
              {wordCount.toLocaleString('vi-VN')} / 30.000 từ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setContentMarkdown((prev) => `${prev.trimEnd()}\n\n❦\n\n`);
                setIsDirty(true);
              }}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-7 px-2.5 rounded-[5px]"
            >
              + Dấu ngắt cảnh (&#10086;)
            </button>
            <span style={{ color: 'var(--text-secondary)' }}>
              Chèn tranh vào giữa các đoạn văn theo cú pháp <code>![mô tả](url)</code>
            </span>
          </div>

          <textarea
            rows={18}
            value={contentMarkdown}
            onChange={(e) => {
              setContentMarkdown(e.target.value);
              setIsDirty(true);
            }}
            placeholder="Nhập nội dung truyện liền mạch tại đây..."
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-full p-3.5 rounded-[8px] text-[15px] story-prose outline-none"
          />
        </section>
      )}

      {/* Pre-Publish Checklist */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-2.5 text-xs"
      >
        <h2 className="font-semibold font-editorial text-sm">Điều kiện Xuất bản</h2>
        {checklist.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              style={{
                color: item.ok ? 'var(--accent-primary)' : 'var(--accent-berry)'
              }}
              className="w-4 h-4 flex items-center justify-center shrink-0"
            >
              {item.ok ? <CheckIcon size={14} /> : '•'}
            </span>
            <span style={{ color: item.ok ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {item.label}
            </span>
          </div>
        ))}

        {!isNew && (
          <div className="pt-2 border-t border-[var(--border-hairline)] flex justify-end">
            <button
              type="button"
              onClick={handleMoveToTrash}
              style={{ color: 'var(--accent-berry)' }}
              className="inline-flex items-center gap-1 font-medium"
            >
              <TrashIcon size={14} />
              <span>Đưa tập này vào Thùng rác</span>
            </button>
          </div>
        )}
      </section>

      {/* Interactive 390px Mobile Reader Preview Modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3"
        >
          <div
            style={{
              backgroundColor: 'var(--bg-canvas)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-[390px] max-w-full h-[88vh] rounded-[14px] overflow-hidden flex flex-col"
          >
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderBottom: '1px solid var(--border-hairline)'
              }}
              className="h-11 px-3.5 flex items-center justify-between text-xs shrink-0"
            >
              <span className="font-semibold">Xem trước khung điện thoại 390px</span>
              <button
                type="button"
                aria-label="Đóng xem trước"
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 flex items-center justify-center"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                  Tập {episodeCode}
                </span>
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="inline-flex rounded-[6px] p-0.5 text-[11px]"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewMode('story')}
                    style={{
                      backgroundColor:
                        previewMode === 'story' ? 'var(--bg-elevated)' : 'transparent'
                    }}
                    className="px-2 py-1 rounded-[4px] font-medium"
                  >
                    Đọc truyện
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('gallery')}
                    style={{
                      backgroundColor:
                        previewMode === 'gallery' ? 'var(--bg-elevated)' : 'transparent'
                    }}
                    className="px-2 py-1 rounded-[4px] font-medium"
                  >
                    Chỉ xem tranh ({previewGallery.length})
                  </button>
                </div>
              </div>

              <h3 className="text-[20px] font-bold font-editorial">
                {title || 'Tiêu đề tập truyện'}
              </h3>

              {previewMode === 'story' ? (
                <div className="story-prose text-[17px] space-y-3.5 pt-1">
                  {previewBlocks.map((b, i) => {
                    if (b.type === 'heading') {
                      return (
                        <h4 key={i} className="font-semibold font-editorial pt-2">
                          {b.text}
                        </h4>
                      );
                    }
                    if (b.type === 'divider') {
                      return (
                        <div key={i} className="text-center opacity-70">
                          &#10086;
                        </div>
                      );
                    }
                    if (b.type === 'image') {
                      return (
                        <div
                          key={i}
                          style={{ border: '1px solid var(--border-hairline)' }}
                          className="w-full aspect-[3/4] rounded-[8px] overflow-hidden my-3"
                        >
                          <img
                            src={b.url}
                            alt={b.alt}
                            className="w-full h-full object-cover block"
                          />
                        </div>
                      );
                    }
                    return <p key={i}>{b.text}</p>;
                  })}
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  {previewGallery.map((url, i) => (
                    <div
                      key={i}
                      style={{ border: '1px solid var(--border-hairline)' }}
                      className="w-full aspect-[3/4] rounded-[8px] overflow-hidden"
                    >
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
