'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AudienceBand,
  BookLineCode,
  BookPreset,
  CognitiveDensity,
  CoverFocalPoint,
  HydratedBook,
  KnowledgeMetadata,
  ListeningRhythm,
  NarrativeForm,
  PublishStatus,
  TocMode
} from '@/lib/types';
import { BOOK_PRESETS } from '@/lib/presets';
import {
  formatAdminHallGenre,
  getThematicHallBySlug,
  parseAdminHallGenre,
  THEMATIC_HALLS,
  ThematicHallSlug
} from '@/lib/halls';
import {
  ACTIVE_BOOK_LINES,
  AUDIENCE_BAND_OPTIONS,
  COGNITIVE_DENSITY_OPTIONS,
  CROSS_CUTTING_CONCEPTS,
  KNOWLEDGE_PILLARS,
  LIBERAL_COMPETENCIES,
  LISTENING_RHYTHM_OPTIONS,
  NARRATIVE_FORM_OPTIONS,
  getBookLineByCode,
  inferBookAudienceBand
} from '@/lib/knowledge';
import { uploadMediaWithProgress } from '@/lib/uploadClient';
import { BookCover } from '@/components/ui/BookCover';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon
} from '@/components/ui/Icons';

export function AdminBookEditorClient({
  initialBook
}: {
  initialBook: HydratedBook | null;
}) {
  const router = useRouter();
  const isNew = !initialBook;

  const [title, setTitle] = useState(initialBook?.title || '');
  const [slug, setSlug] = useState(initialBook?.slug || '');
  const [subtitle, setSubtitle] = useState(initialBook?.subtitle || '');
  const [author, setAuthor] = useState(initialBook?.author || '');
  const [illustrator, setIllustrator] = useState(initialBook?.illustrator || '');
  const [ageRange, setAgeRange] = useState(initialBook?.ageRange || '3–9 tuổi');
  const initialHallInfo = parseAdminHallGenre(initialBook?.genreTag || '');
  const [selectedHallSlug, setSelectedHallSlug] = useState<ThematicHallSlug>(
    initialHallInfo.hallSlug
  );
  const [secondaryHallSlug, setSecondaryHallSlug] = useState<ThematicHallSlug | ''>(
    initialHallInfo.secondaryHallSlug || ''
  );
  const [subTopic, setSubTopic] = useState(initialHallInfo.subTag);
  const genreTag = formatAdminHallGenre(
    selectedHallSlug,
    subTopic,
    secondaryHallSlug || null
  );
  const [description, setDescription] = useState(initialBook?.description || '');
  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl || '');
  const [coverFocalPoint, setCoverFocalPoint] = useState<CoverFocalPoint>(
    initialBook?.coverFocalPoint || 'center'
  );
  const [themePreset, setThemePreset] = useState<BookPreset>(
    initialBook?.themePreset || 'moss'
  );
  const [tocMode, setTocMode] = useState<TocMode>(
    initialBook?.tocMode || 'thematic'
  );
  const [defaultAutoNext, setDefaultAutoNext] = useState(
    initialBook?.defaultAutoNext ?? false
  );
  const [showEpisodeNumbers, setShowEpisodeNumbers] = useState(
    initialBook?.showEpisodeNumbers ?? true
  );
  const [rightsConfirmed, setRightsConfirmed] = useState(
    initialBook?.rightsConfirmed ?? false
  );
  const [status, setStatus] = useState<PublishStatus>(initialBook?.status || 'draft');
  const [parts, setParts] = useState<{ id?: string; title: string }[]>(
    (initialBook?.parts || []).map((p) => ({ id: p.id, title: p.title }))
  );

  // Knowledge Architecture v2.0 (7-Facet Interdisciplinary Metadata)
  const [knowledgeOpen, setKnowledgeOpen] = useState<boolean>(() =>
    Boolean(initialBook?.knowledgeMeta?.primaryLine || isNew)
  );
  const [primaryLine, setPrimaryLine] = useState<BookLineCode | ''>(
    initialBook?.knowledgeMeta?.primaryLine || ''
  );
  const [secondaryLines, setSecondaryLines] = useState<BookLineCode[]>(
    initialBook?.knowledgeMeta?.secondaryLines || []
  );
  const [audienceBand, setAudienceBand] = useState<AudienceBand>(() =>
    initialBook ? inferBookAudienceBand(initialBook) : 'teen_11_15'
  );
  const [listeningRhythm, setListeningRhythm] = useState<ListeningRhythm | ''>(
    initialBook?.knowledgeMeta?.listeningRhythm || ''
  );
  const [cognitiveDensity, setCognitiveDensity] = useState<CognitiveDensity | ''>(
    initialBook?.knowledgeMeta?.cognitiveDensity || ''
  );
  const [narrativeForm, setNarrativeForm] = useState<NarrativeForm | ''>(
    initialBook?.knowledgeMeta?.narrativeForm || ''
  );
  const [crossCuttingConcepts, setCrossCuttingConcepts] = useState<string[]>(
    initialBook?.knowledgeMeta?.crossCuttingConcepts || []
  );
  const [liberalCompetencies, setLiberalCompetencies] = useState<string[]>(
    initialBook?.knowledgeMeta?.liberalCompetencies || []
  );
  const [recommendedGradesInput, setRecommendedGradesInput] = useState<string>(
    (initialBook?.knowledgeMeta?.recommendedGrades || []).join(', ')
  );
  const [topicKeywordsInput, setTopicKeywordsInput] = useState<string>(
    (initialBook?.knowledgeMeta?.topicKeywords || []).join(', ')
  );
  const [curriculumAnchorsInput, setCurriculumAnchorsInput] = useState<string>(
    (initialBook?.knowledgeMeta?.curriculumAnchors || []).join(', ')
  );

  const toggleSecondaryLine = (code: BookLineCode) => {
    setSecondaryLines((prev) => {
      if (prev.includes(code)) return prev.filter((item) => item !== code);
      if (prev.length >= 2) return [...prev.slice(1), code];
      return [...prev, code];
    });
  };

  const toggleConcept = (conceptSlug: string) => {
    setCrossCuttingConcepts((prev) => {
      if (prev.includes(conceptSlug)) return prev.filter((s) => s !== conceptSlug);
      if (prev.length >= 6) return prev;
      return [...prev, conceptSlug];
    });
  };

  const toggleCompetency = (compSlug: string) => {
    setLiberalCompetencies((prev) =>
      prev.includes(compSlug) ? prev.filter((s) => s !== compSlug) : [...prev, compSlug]
    );
  };

  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadPct(1);
    try {
      const res = await uploadMediaWithProgress({
        file,
        kind: 'image',
        bookSlug: slug || title || 'book-cover',
        onProgress: setUploadPct
      });
      setCoverUrl(res.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải ảnh bìa thất bại.');
    } finally {
      setUploadPct(null);
    }
  };

  const handleSave = async (targetStatus: PublishStatus) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    const parsedGrades = recommendedGradesInput
      .split(/[,;\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12);
    const parsedKeywords = topicKeywordsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedAnchors = curriculumAnchorsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const knowledgeMetaPayload: KnowledgeMetadata = {
      ...(initialBook?.knowledgeMeta || {}),
      primaryLine: primaryLine || undefined,
      secondaryLines,
      audienceBand,
      recommendedGrades: parsedGrades,
      listeningRhythm: listeningRhythm || undefined,
      cognitiveDensity: cognitiveDensity || undefined,
      narrativeForm: narrativeForm || undefined,
      crossCuttingConcepts,
      liberalCompetencies,
      topicKeywords: parsedKeywords,
      curriculumAnchors: parsedAnchors
    };
    try {
      const res = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialBook?.id,
          slug: slug || undefined,
          title,
          subtitle,
          author,
          illustrator,
          ageRange,
          genreTag,
          description,
          coverUrl,
          coverFocalPoint,
          themePreset,
          tocMode,
          defaultAutoNext,
          showEpisodeNumbers,
          rightsConfirmed,
          status: targetStatus,
          knowledgeMeta: knowledgeMetaPayload,
          parts: parts
            .filter((p) => p.title.trim())
            .map((p, idx) => ({ id: p.id, title: p.title.trim(), sortOrder: idx }))
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không thể lưu Bộ sách.');
        setSaving(false);
        return;
      }
      setStatus(data.book.status);
      setSuccessMsg(
        targetStatus === 'published'
          ? 'Đã xuất bản Bộ sách lên Tủ sách gia đình.'
          : 'Đã lưu Bộ sách thành công.'
      );
      if (isNew) {
        router.push(`/admin/books/${data.book.id}`);
      }
      router.refresh();
    } catch {
      setError('Mất kết nối máy chủ khi lưu Bộ sách.');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveToTrash = async () => {
    if (!initialBook) return;
    if (
      !window.confirm(
        `Đưa bộ sách "${initialBook.title}" vào Thùng rác? Người nghe sẽ không còn thấy bộ sách này cho tới khi bạn khôi phục.`
      )
    ) {
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/trash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity: 'book', id: initialBook.id, action: 'trash' })
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('Không thể đưa bộ sách vào Thùng rác.');
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-3 pb-14 space-y-5">
      {/* Top Sticky Bar */}
      <header
        style={{
          backgroundColor: 'var(--bg-canvas)',
          borderBottom: '1px solid var(--border-hairline)'
        }}
        className="sticky top-0 z-20 py-2.5 flex items-center justify-between gap-2"
      >
        <Link
          href="/admin"
          style={{ color: 'var(--text-secondary)' }}
          className="h-9 inline-flex items-center gap-1 text-xs font-medium"
        >
          <ChevronLeftIcon size={16} />
          <span>Xưởng sách</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3 rounded-[7px] text-xs font-medium"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('published')}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)'
            }}
            className="h-9 px-3.5 rounded-[7px] text-xs font-semibold"
          >
            {status === 'published' ? 'Cập nhật xuất bản' : 'Xuất bản sách'}
          </button>
        </div>
      </header>

      <div>
        <h1 className="text-[20px] font-bold font-editorial">
          {isNew ? 'Tạo Bộ Sách Mới' : `Biên tập: ${initialBook.title}`}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Thiết lập bìa dọc 3:4, thông tin tác giả, sắc thái màu giấy và phân mục Phần (nếu có).
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)',
            color: 'var(--accent-berry)'
          }}
          className="p-3 rounded-[8px] text-xs"
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

      {/* 3:4 Cover Upload & Focal Point */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3"
      >
        <h2 className="text-sm font-semibold font-editorial">Tranh bìa khổ dọc (3:4)</h2>
        <div className="flex gap-4 items-start">
          <div className="w-[104px] shrink-0">
            <BookCover
              src={coverUrl}
              alt={title || 'Xem trước bìa 3:4'}
              focalPoint={coverFocalPoint}
            />
          </div>

          <div className="flex-1 space-y-2.5 text-xs">
            <label
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)'
              }}
              className="h-10 px-3 rounded-[8px] inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <UploadIcon size={14} />
              <span>{uploadPct !== null ? `Đang tải ${uploadPct}%...` : 'Tải ảnh bìa mới'}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </label>

            <div>
              <span className="block mb-1" style={{ color: 'var(--text-secondary)' }}>
                Điểm căn khung bìa (chống cắt mặt nhân vật):
              </span>
              <div className="inline-flex rounded-[7px] p-0.5 bg-[var(--bg-surface)] border border-[var(--border-hairline)]">
                {(
                  [
                    { key: 'top', label: 'Trên' },
                    { key: 'center', label: 'Giữa' },
                    { key: 'bottom', label: 'Dưới' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setCoverFocalPoint(opt.key)}
                    style={{
                      backgroundColor:
                        coverFocalPoint === opt.key ? 'var(--bg-elevated)' : 'transparent',
                      color:
                        coverFocalPoint === opt.key
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)'
                    }}
                    className="px-2.5 h-7 rounded-[5px] font-medium"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Metadata */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3 text-xs"
      >
        <div>
          <label className="block font-medium mb-1">Tên Bộ sách *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="vd: Lim và Mẹ Vacci"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-full h-10 px-3 rounded-[7px] text-sm outline-none font-editorial"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Phụ đề ngắn</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Đồng thoại khoa học ấm áp trước giờ đi ngủ..."
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-full h-10 px-3 rounded-[7px] outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium mb-1">Tác giả lời</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Họa sĩ minh họa</label>
            <input
              type="text"
              value={illustrator}
              onChange={(e) => setIllustrator(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block font-medium mb-1">Độ tuổi phù hợp</label>
            <input
              type="text"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
              placeholder="3–9 tuổi"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1.5">
              Gian sách *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {THEMATIC_HALLS.map((hall) => {
                const active = selectedHallSlug === hall.slug;
                return (
                  <button
                    key={hall.slug}
                    type="button"
                    onClick={() => {
                      setSelectedHallSlug(hall.slug);
                      if (secondaryHallSlug === hall.slug) {
                        setSecondaryHallSlug('');
                      }
                    }}
                    style={{
                      backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-canvas)',
                      color: active ? 'var(--accent-primary-fg)' : 'var(--text-primary)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="px-3 py-2.5 rounded-[8px] text-left transition"
                  >
                    <span className="block text-xs font-semibold truncate">
                      {hall.shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1.5">
              Gian giao thoa (tùy chọn)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSecondaryHallSlug('')}
                style={{
                  backgroundColor:
                    secondaryHallSlug === '' ? 'var(--accent-warm)' : 'var(--bg-canvas)',
                  color:
                    secondaryHallSlug === ''
                      ? 'var(--accent-primary-fg)'
                      : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-8 px-2.5 rounded-[7px] text-[11px] font-medium"
              >
                Không gắn thêm
              </button>
              {THEMATIC_HALLS.filter((h) => h.slug !== selectedHallSlug).map((hall) => {
                const active = secondaryHallSlug === hall.slug;
                return (
                  <button
                    key={hall.slug}
                    type="button"
                    onClick={() => setSecondaryHallSlug(active ? '' : hall.slug)}
                    style={{
                      backgroundColor: active
                        ? 'var(--accent-warm)'
                        : 'var(--bg-canvas)',
                      color: active
                        ? 'var(--accent-primary-fg)'
                        : 'var(--text-primary)',
                      border: '1px solid var(--border-hairline)'
                    }}
                    className="h-8 px-2.5 rounded-[7px] text-[11px] font-medium"
                  >
                    {hall.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">
              Nhánh chủ đề phụ (tùy chọn)
            </label>
            <input
              type="text"
              value={subTopic}
              onChange={(e) => setSubTopic(e.target.value)}
              placeholder="vd: Muông thú, Thiên văn, Bánh mùa thu..."
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Nhãn hiển thị lưu trữ: <strong>{genreTag}</strong>
            </p>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Đường dẫn tĩnh (Slug)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Tự sinh từ tên sách nếu để trống"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-full h-10 px-3 rounded-[7px] outline-none"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Lời giới thiệu Bộ sách</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-hairline)'
            }}
            className="w-full p-3 rounded-[7px] outline-none leading-relaxed"
          />
        </div>
      </section>

      {/* Knowledge Architecture v2.0 (7-Facet Interdisciplinary Metadata) */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3.5 text-xs"
      >
        <button
          type="button"
          onClick={() => setKnowledgeOpen((prev) => !prev)}
          className="w-full flex items-center justify-between gap-2 text-left"
        >
          <div>
            <h2 className="text-sm font-semibold font-editorial">
              Kiến trúc Tri thức &amp; Nhãn Liên ngành (v2.0)
            </h2>
            <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Định vị Dòng sách 6 trụ cột, dải độ tuổi chuẩn, nhịp nghe và khái niệm xuyên ngành.
            </p>
          </div>
          <span
            style={{ color: 'var(--text-secondary)' }}
            className={`shrink-0 transition-transform ${knowledgeOpen ? 'rotate-180' : ''}`}
          >
            <ChevronDownIcon size={16} />
          </span>
        </button>

        {knowledgeOpen && (
          <div className="pt-2 border-t border-[var(--border-hairline)] space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">Dải độc giả mục tiêu</label>
                <select
                  value={audienceBand}
                  onChange={(e) => {
                    const nextBand = e.target.value as AudienceBand;
                    setAudienceBand(nextBand);
                    const matchedOpt = AUDIENCE_BAND_OPTIONS.find(
                      (o) => o.value === nextBand
                    );
                    const isDefaultAgeText =
                      !ageRange.trim() ||
                      ageRange === '3–9 tuổi' ||
                      AUDIENCE_BAND_OPTIONS.some((o) => o.defaultAgeRange === ageRange.trim());
                    if (matchedOpt && isDefaultAgeText) {
                      setAgeRange(matchedOpt.defaultAgeRange);
                    }
                  }}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] outline-none"
                >
                  {AUDIENCE_BAND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Khối lớp tham chiếu (tùy chọn)
                </label>
                <input
                  type="text"
                  value={recommendedGradesInput}
                  onChange={(e) => setRecommendedGradesInput(e.target.value)}
                  placeholder="vd: 6, 7"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] outline-none tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium mb-1">
                Dòng sách chính (18 Dòng xuất bản khai phóng)
              </label>
              <select
                value={primaryLine}
                onChange={(e) => {
                  const nextCode = e.target.value as BookLineCode | '';
                  setPrimaryLine(nextCode);
                  if (nextCode) {
                    setSecondaryLines((prev) => prev.filter((c) => c !== nextCode));
                    const lineDef = getBookLineByCode(nextCode);
                    if (lineDef && isNew) {
                      setSelectedHallSlug(lineDef.defaultHallSlug);
                    }
                  }
                }}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="w-full h-10 px-3 rounded-[7px] outline-none"
              >
                <option value="">-- Chưa chọn dòng sách --</option>
                {KNOWLEDGE_PILLARS.map((pillar) => (
                  <optgroup key={pillar.code} label={pillar.title}>
                    {ACTIVE_BOOK_LINES.filter((l) => l.pillar === pillar.code).map((line) => (
                      <option key={line.code} value={line.code}>
                        {line.code} · {line.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {primaryLine && (() => {
                const lineDef = getBookLineByCode(primaryLine);
                const mappedHall = lineDef ? getThematicHallBySlug(lineDef.defaultHallSlug) : undefined;
                if (!lineDef) return null;
                return (
                  <div
                    className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>{lineDef.scopeSummary}</span>
                    {mappedHall && selectedHallSlug !== mappedHall.slug && (
                      <button
                        type="button"
                        onClick={() => setSelectedHallSlug(mappedHall.slug)}
                        style={{ color: 'var(--accent-primary)' }}
                        className="font-medium underline shrink-0"
                      >
                        Đồng bộ sang {mappedHall.title}
                      </button>
                    )}
                  </div>
                );
              })()}
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
                        backgroundColor: active ? 'var(--accent-warm)' : 'var(--bg-canvas)',
                        color: active ? 'var(--accent-primary-fg)' : 'var(--text-primary)',
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium mb-1">Nhịp nghe gợi ý</label>
                <select
                  value={listeningRhythm}
                  onChange={(e) => setListeningRhythm(e.target.value as ListeningRhythm | '')}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-2.5 rounded-[7px] outline-none"
                >
                  <option value="">-- Tự động --</option>
                  {LISTENING_RHYTHM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Độ sâu nhận thức</label>
                <select
                  value={cognitiveDensity}
                  onChange={(e) =>
                    setCognitiveDensity(e.target.value as CognitiveDensity | '')
                  }
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-2.5 rounded-[7px] outline-none"
                >
                  <option value="">-- Tự động --</option>
                  {COGNITIVE_DENSITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1">Hình thái tự sự</label>
                <select
                  value={narrativeForm}
                  onChange={(e) => setNarrativeForm(e.target.value as NarrativeForm | '')}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-2.5 rounded-[7px] outline-none"
                >
                  <option value="">-- Tự động --</option>
                  {NARRATIVE_FORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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

            <div>
              <label className="block font-medium mb-1.5">Năng lực khai phóng</label>
              <div className="flex flex-wrap gap-1.5">
                {LIBERAL_COMPETENCIES.map((comp) => {
                  const active = liberalCompetencies.includes(comp.slug);
                  return (
                    <button
                      key={comp.slug}
                      type="button"
                      onClick={() => toggleCompetency(comp.slug)}
                      style={{
                        backgroundColor: active ? 'var(--accent-warm)' : 'var(--bg-canvas)',
                        color: active
                          ? 'var(--accent-primary-fg)'
                          : 'var(--text-primary)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-7 px-2.5 rounded-[6px] text-[11px] font-medium py-0.5"
                    >
                      {comp.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium mb-1">
                  Từ khóa chủ đề tìm kiếm (phân tách dấu phẩy)
                </label>
                <input
                  type="text"
                  value={topicKeywordsInput}
                  onChange={(e) => setTopicKeywordsInput(e.target.value)}
                  placeholder="vd: tế bào, đom đóm, hóa học bếp núc"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Neo chương trình phổ thông ẩn (phân tách dấu phẩy)
                </label>
                <input
                  type="text"
                  value={curriculumAnchorsInput}
                  onChange={(e) => setCurriculumAnchorsInput(e.target.value)}
                  placeholder="vd: KHTN-6:da-dang-the-gioi-song, CN-6:bao-quan-thuc-pham"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Preset Watercolor Wash & Playback Defaults */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3 text-xs"
      >
        <h2 className="text-sm font-semibold font-editorial">Sắc thái màu giấy & Phát mặc định</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.values(BOOK_PRESETS).map((preset) => {
            const active = themePreset === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => setThemePreset(preset.key)}
                style={{
                  backgroundColor: preset.dayWash,
                  border: active
                    ? `2px solid ${preset.dayAccent}`
                    : '1px solid var(--border-hairline)',
                  color: '#222923'
                }}
                className="h-11 px-3 rounded-[8px] flex items-center justify-between font-medium"
              >
                <span>{preset.label}</span>
                <span
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: preset.dayAccent }}
                />
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={defaultAutoNext}
            onChange={(e) => setDefaultAutoNext(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Mặc định tự chuyển sang tập kế tiếp khi nghe hết tập</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showEpisodeNumbers}
            onChange={(e) => setShowEpisodeNumbers(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Hiển thị cột số thứ tự tập (00, 01, 02...) trong mục lục</span>
        </label>

        <div className="pt-2 border-t border-[var(--border-hairline)] space-y-2">
          <span className="font-semibold block font-editorial text-sm">
            Kiểu tổ chức Mục lục tập truyện (Quy mô 100–365 tập)
          </span>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="tocMode"
              checked={tocMode === 'thematic'}
              onChange={() => setTocMode('thematic')}
              className="mt-0.5"
            />
            <span>
              <strong>Chia theo Tuyển tập chủ đề + Chặng 20 tập:</strong> Phù hợp bộ sách nhiều nhánh nội dung (như <em>Lim &amp; Mẹ Vacci</em>: Thú, Cây, Nấm...); tự động gom theo Phần hoặc Nhãn chủ đề.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="tocMode"
              checked={tocMode === 'sequential'}
              onChange={() => setTocMode('sequential')}
              className="mt-0.5"
            />
            <span>
              <strong>Xếp tuần tự theo Chặng 20 tập (01–20, 21–40...):</strong> Phù hợp truyện nối tiếp mạch thời gian từ đầu tới cuối (như <em>Tiểu Hạt Dẻ</em>).
            </span>
          </label>
        </div>
      </section>

      {/* Optional Parts / Seasons */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3 text-xs"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold font-editorial">Phân chia Phần / Mùa (Tùy chọn)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Để trống nếu bộ sách liệt kê thẳng danh sách Tập.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setParts((prev) => [...prev, { title: '' }])}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-8 px-2.5 rounded-[6px] inline-flex items-center gap-1 font-medium"
          >
            <PlusIcon size={13} />
            <span>Thêm Phần</span>
          </button>
        </div>

        {parts.map((part, idx) => (
          <div key={part.id || idx} className="flex items-center gap-2">
            <input
              type="text"
              value={part.title}
              onChange={(e) =>
                setParts((prev) =>
                  prev.map((item, i) => (i === idx ? { ...item, title: e.target.value } : item))
                )
              }
              placeholder={`Phần ${idx + 1}: Tên phần...`}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="flex-1 h-9 px-3 rounded-[7px] outline-none"
            />
            <button
              type="button"
              aria-label="Xóa phần này"
              onClick={() => setParts((prev) => prev.filter((_, i) => i !== idx))}
              style={{ color: 'var(--accent-berry)' }}
              className="w-9 h-9 flex items-center justify-center"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        ))}
      </section>

      {/* Rights Confirmation & Trash */}
      <section
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid var(--border-hairline)'
        }}
        className="rounded-[10px] p-4 space-y-3 text-xs"
      >
        <label className="flex items-start gap-2.5 cursor-pointer leading-relaxed">
          <input
            type="checkbox"
            checked={rightsConfirmed}
            onChange={(e) => setRightsConfirmed(e.target.checked)}
            className="w-4 h-4 mt-0.5 shrink-0"
          />
          <span>
            Tôi xác nhận gia đình sở hữu bản quyền tác phẩm hoặc có quyền lưu hành hợp lệ đối với văn bản, tranh minh họa và bản thu âm của bộ sách này.
          </span>
        </label>

        {!isNew && (
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border-hairline)]">
            <Link
              href={`/admin/episodes/new?bookId=${initialBook.id}`}
              style={{ color: 'var(--accent-primary)' }}
              className="font-semibold underline"
            >
              + Thêm Tập truyện vào bộ sách này
            </Link>
            <button
              type="button"
              onClick={handleMoveToTrash}
              style={{ color: 'var(--accent-berry)' }}
              className="inline-flex items-center gap-1 font-medium"
            >
              <TrashIcon size={14} />
              <span>Đưa vào Thùng rác</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
