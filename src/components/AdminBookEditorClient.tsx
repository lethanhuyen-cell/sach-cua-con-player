'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookPreset, CoverFocalPoint, HydratedBook, PublishStatus } from '@/lib/types';
import { BOOK_PRESETS } from '@/lib/presets';
import { uploadMediaWithProgress } from '@/lib/uploadClient';
import { BookCover } from './BookCover';
import { ChevronLeftIcon, PlusIcon, TrashIcon, UploadIcon } from './Icons';

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
  const [genreTag, setGenreTag] = useState(initialBook?.genreTag || 'Thiên nhiên');
  const [description, setDescription] = useState(initialBook?.description || '');
  const [coverUrl, setCoverUrl] = useState(initialBook?.coverUrl || '');
  const [coverFocalPoint, setCoverFocalPoint] = useState<CoverFocalPoint>(
    initialBook?.coverFocalPoint || 'center'
  );
  const [themePreset, setThemePreset] = useState<BookPreset>(
    initialBook?.themePreset || 'moss'
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
          defaultAutoNext,
          showEpisodeNumbers,
          rightsConfirmed,
          status: targetStatus,
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

        <div className="grid grid-cols-2 gap-3">
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
            <label className="block font-medium mb-1">Chủ đề kệ sách</label>
            <input
              type="text"
              value={genreTag}
              onChange={(e) => setGenreTag(e.target.value)}
              placeholder="Đồng thoại khoa học"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-hairline)'
              }}
              className="w-full h-10 px-3 rounded-[7px] outline-none"
            />
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
