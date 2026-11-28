'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Book, Episode, HydratedBook, VoiceProfile } from '@/lib/types';
import { isEpisodeReadingOnly } from '@/lib/presets';
import { BookCover } from '@/components/ui/BookCover';
import {
  BookOpenIcon,
  CheckIcon,
  CuratedSparkIcon,
  DownloadIcon,
  EyeIcon,
  MicIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon
} from '@/components/ui/Icons';

interface CuratedDraftItem {
  isRecommended: boolean;
  recommendedNote: string;
}

function buildInitialBookCurated(books: HydratedBook[]): Record<string, CuratedDraftItem> {
  const map: Record<string, CuratedDraftItem> = {};
  for (const b of books) {
    map[b.id] = {
      isRecommended: Boolean(b.knowledgeMeta?.isRecommended),
      recommendedNote: b.knowledgeMeta?.recommendedNote || ''
    };
  }
  return map;
}

function buildInitialEpisodeCurated(books: HydratedBook[]): Record<string, CuratedDraftItem> {
  const map: Record<string, CuratedDraftItem> = {};
  for (const b of books) {
    for (const ep of b.episodes) {
      map[ep.id] = {
        isRecommended: Boolean(ep.knowledgeMeta?.isRecommended),
        recommendedNote: ep.knowledgeMeta?.recommendedNote || ''
      };
    }
  }
  return map;
}

interface AdminDashboardClientProps {
  activeBooks: HydratedBook[];
  trashedBooks: Book[];
  trashedEpisodes: (Episode & { bookTitle: string })[];
  voiceProfiles: VoiceProfile[];
}

export function AdminDashboardClient({
  activeBooks,
  trashedBooks,
  trashedEpisodes,
  voiceProfiles: initialVoices
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'books' | 'curated' | 'voices' | 'trash'>('books');
  const [expandedBookId, setExpandedBookId] = useState<string | null>(
    activeBooks[0]?.id || null
  );

  // Curated shelf ("Có thể bạn sẽ thích") state
  const [bookCurated, setBookCurated] = useState<Record<string, CuratedDraftItem>>(() =>
    buildInitialBookCurated(activeBooks)
  );
  const [episodeCurated, setEpisodeCurated] = useState<Record<string, CuratedDraftItem>>(() =>
    buildInitialEpisodeCurated(activeBooks)
  );
  const [curatedBookFilter, setCuratedBookFilter] = useState<string>('ALL');
  const [curatedEpQuery, setCuratedEpQuery] = useState<string>('');
  const [onlySelectedCuratedEps, setOnlySelectedCuratedEps] = useState<boolean>(false);

  useEffect(() => {
    setBookCurated(buildInitialBookCurated(activeBooks));
    setEpisodeCurated(buildInitialEpisodeCurated(activeBooks));
  }, [activeBooks]);

  // Voice profile form state
  const [voices, setVoices] = useState<VoiceProfile[]>(initialVoices);
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [voiceKey, setVoiceKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [narratorName, setNarratorName] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogout = async (allDevices: boolean) => {
    setBusy(true);
    await fetch(`/api/admin/login${allDevices ? '?all=1' : ''}`, { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleSaveVoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/voices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingVoiceId || undefined,
          voiceKey,
          displayName,
          narratorName,
          notes
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Không thể lưu hồ sơ giọng đọc.');
      } else {
        const saved: VoiceProfile = data.voiceProfile;
        setVoices((prev) => {
          const exists = prev.some((v) => v.id === saved.id);
          return exists ? prev.map((v) => (v.id === saved.id ? saved : v)) : [...prev, saved];
        });
        setEditingVoiceId(null);
        setVoiceKey('');
        setDisplayName('');
        setNarratorName('');
        setNotes('');
        setFeedback('Đã lưu hồ sơ giọng đọc.');
        router.refresh();
      }
    } catch {
      setFeedback('Lỗi kết nối khi lưu giọng đọc.');
    } finally {
      setBusy(false);
    }
  };

  const handleTrashAction = async (
    entity: 'book' | 'episode',
    id: string,
    action: 'restore' | 'purge',
    label: string
  ) => {
    if (
      action === 'purge' &&
      !window.confirm(`Xóa vĩnh viễn "${label}"? Hành động này không thể hoàn tác.`)
    ) {
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/trash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id, action })
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Thao tác thùng rác thất bại.');
      } else {
        setFeedback(
          action === 'restore'
            ? `Đã khôi phục "${label}" về trạng thái Nháp.`
            : `Đã xóa vĩnh viễn "${label}".`
        );
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  const trashTotal = trashedBooks.length + trashedEpisodes.length;

  const curatedBooksCount = useMemo(
    () => activeBooks.filter((b) => bookCurated[b.id]?.isRecommended).length,
    [activeBooks, bookCurated]
  );

  const curatedEpisodesCount = useMemo(
    () =>
      activeBooks.reduce(
        (sum, b) =>
          sum + b.episodes.filter((ep) => episodeCurated[ep.id]?.isRecommended).length,
        0
      ),
    [activeBooks, episodeCurated]
  );

  const curatedTotal = curatedBooksCount + curatedEpisodesCount;

  const filteredCuratedEpisodes = useMemo(() => {
    const q = curatedEpQuery.normalize('NFC').trim().toLowerCase();
    const list: { book: HydratedBook; episode: HydratedBook['episodes'][number] }[] = [];
    for (const book of activeBooks) {
      if (curatedBookFilter !== 'ALL' && book.id !== curatedBookFilter) continue;
      for (const ep of book.episodes) {
        const isRec = Boolean(episodeCurated[ep.id]?.isRecommended);
        if (onlySelectedCuratedEps && !isRec) continue;
        if (q) {
          const hay = `${ep.episodeCode} ${ep.title} ${book.title}`
            .normalize('NFC')
            .toLowerCase();
          if (!hay.includes(q)) continue;
        }
        list.push({ book, episode: ep });
      }
    }
    return list;
  }, [activeBooks, curatedBookFilter, curatedEpQuery, episodeCurated, onlySelectedCuratedEps]);

  const handleSaveCurated = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      const booksPayload = activeBooks.map((b) => {
        const state = bookCurated[b.id] || { isRecommended: false, recommendedNote: '' };
        return {
          id: b.id,
          isRecommended: state.isRecommended,
          recommendedNote: state.recommendedNote
        };
      });
      const episodesPayload = activeBooks.flatMap((b) =>
        b.episodes.map((ep) => {
          const state = episodeCurated[ep.id] || { isRecommended: false, recommendedNote: '' };
          return {
            id: ep.id,
            isRecommended: state.isRecommended,
            recommendedNote: state.recommendedNote
          };
        })
      );

      const res = await fetch('/api/admin/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: booksPayload,
          episodes: episodesPayload
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data.error || 'Không thể lưu thiết lập kệ gợi ý.');
      } else {
        setFeedback('Đã lưu thiết lập kệ Có thể bạn sẽ thích.');
        router.refresh();
      }
    } catch {
      setFeedback('Lỗi kết nối khi lưu thiết lập kệ gợi ý.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="px-4 pt-3 pb-12 space-y-5">
      {/* Top Bar */}
      <header
        style={{ borderBottom: '1px solid var(--border-hairline)' }}
        className="pb-3 space-y-2.5"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="vn-eyebrow" style={{ color: 'var(--accent-primary)' }}>
              Quản trị thư viện
            </span>
            <h1 className="text-[21px] font-bold font-editorial">Xưởng Sách Gia Đình</h1>
          </div>
          <Link
            href="/"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-9 px-3 rounded-[8px] text-xs font-medium inline-flex items-center gap-1.5"
          >
            <EyeIcon size={14} />
            <span>Trang nghe</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <a
            href="/api/admin/backup"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="h-8 px-3 rounded-[7px] inline-flex items-center gap-1.5 font-medium"
          >
            <DownloadIcon size={13} />
            <span>Sao lưu JSON</span>
          </a>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleLogout(false)}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="h-8 px-3 rounded-[7px]"
          >
            Đăng xuất
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handleLogout(true)}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--accent-berry)'
            }}
            className="h-8 px-3 rounded-[7px]"
          >
            Đăng xuất mọi thiết bị
          </button>
        </div>
      </header>

      {feedback && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-hairline)'
          }}
          className="px-3.5 py-2.5 rounded-[8px] text-xs font-medium"
        >
          {feedback}
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)'
        }}
        className="grid grid-cols-4 gap-0.5 rounded-[8px] p-1 text-[11px] sm:text-xs"
      >
        <button
          type="button"
          onClick={() => setTab('books')}
          style={{
            backgroundColor: tab === 'books' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'books' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 px-1 rounded-[6px] font-semibold truncate"
        >
          Bộ sách ({activeBooks.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('curated')}
          style={{
            backgroundColor: tab === 'curated' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'curated' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 px-1 rounded-[6px] font-semibold truncate"
        >
          Kệ gợi ý ({curatedTotal})
        </button>
        <button
          type="button"
          onClick={() => setTab('voices')}
          style={{
            backgroundColor: tab === 'voices' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'voices' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 px-1 rounded-[6px] font-semibold truncate"
        >
          Giọng đọc ({voices.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('trash')}
          style={{
            backgroundColor: tab === 'trash' ? 'var(--bg-elevated)' : 'transparent',
            color: tab === 'trash' ? 'var(--text-primary)' : 'var(--text-secondary)'
          }}
          className="h-9 px-1 rounded-[6px] font-semibold truncate"
        >
          Thùng rác ({trashTotal})
        </button>
      </div>

      {/* TAB 1: BOOKS & EPISODES */}
      {tab === 'books' && (
        <div className="space-y-4">
          <Link
            href="/admin/books/new"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)'
            }}
            className="w-full h-11 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <PlusIcon size={15} />
            <span>Tạo Bộ Sách Mới</span>
          </Link>

          {activeBooks.map((book) => {
            const isExpanded = expandedBookId === book.id;
            const publishedEps = book.episodes.filter((e) => e.status === 'published').length;

            return (
              <div
                key={book.id}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="rounded-[10px] overflow-hidden"
              >
                <div className="p-3.5 flex gap-3.5 items-start">
                  <div className="w-16 shrink-0">
                    <BookCover
                      src={book.coverUrl}
                      alt={book.title}
                      focalPoint={book.coverFocalPoint}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color:
                            book.status === 'published'
                              ? 'var(--accent-primary)'
                              : 'var(--accent-warm)'
                        }}
                        className="vn-eyebrow"
                      >
                        {book.status === 'published' ? 'Đã xuất bản' : 'Bản nháp / Ẩn'}
                      </span>
                      <span className="text-[11px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                        · {publishedEps}/{book.episodes.length} tập công khai
                      </span>
                    </div>

                    <h2 className="text-[16px] font-bold font-editorial truncate mt-0.5">
                      {book.title}
                    </h2>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                      <Link
                        href={`/admin/books/${book.id}`}
                        style={{
                          backgroundColor: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="h-8 px-3 rounded-[6px] inline-flex items-center font-medium"
                      >
                        Sửa Bộ sách
                      </Link>
                      <Link
                        href={`/admin/episodes/new?bookId=${book.id}`}
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--accent-primary-fg)'
                        }}
                        className="h-8 px-3 rounded-[6px] inline-flex items-center gap-1 font-medium"
                      >
                        <PlusIcon size={13} />
                        <span>Thêm Tập</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                        style={{ color: 'var(--text-secondary)' }}
                        className="h-8 px-2 underline"
                      >
                        {isExpanded ? 'Ẩn danh sách tập' : `Xem ${book.episodes.length} tập`}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{ borderTop: '1px solid var(--border-hairline)' }}
                    className="divide-y divide-[var(--border-hairline)] bg-[var(--bg-canvas)]"
                  >
                    {book.episodes.length === 0 ? (
                      <p
                        className="p-3.5 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Bộ sách này chưa có tập nào. Hãy bấm &ldquo;Thêm Tập&rdquo; để bắt đầu.
                      </p>
                    ) : (
                      book.episodes.map((ep) => (
                        <div
                          key={ep.id}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold font-editorial truncate">
                              Tập {ep.episodeCode}: {ep.title}
                            </p>
                            <p
                              className="text-[11px] mt-0.5 tabular-nums"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {ep.status === 'published' ? 'Đã xuất bản' : 'Nháp'} ·{' '}
                              {isEpisodeReadingOnly(ep)
                                ? 'Chỉ đọc chữ'
                                : `${ep.audioTracks.length} giọng đọc`}{' '}
                              · {ep.wordCount} từ
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Link
                              href={`/episodes/${ep.id}?preview=1`}
                              style={{
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-hairline)'
                              }}
                              className="h-8 px-2.5 rounded-[6px] inline-flex items-center"
                            >
                              Xem
                            </Link>
                            <Link
                              href={`/admin/episodes/${ep.id}`}
                              style={{
                                backgroundColor: 'var(--bg-elevated)',
                                border: '1px solid var(--border-hairline)',
                                color: 'var(--accent-primary)'
                              }}
                              className="h-8 px-2.5 rounded-[6px] inline-flex items-center font-semibold"
                            >
                              Biên tập
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: CURATED SHELF ("CÓ THỂ BẠN SẼ THÍCH") */}
      {tab === 'curated' && (
        <div className="space-y-5">
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)'
            }}
            className="rounded-[9px] p-3 text-xs leading-relaxed"
          >
            Các bộ sách và tập đánh dấu tại đây sẽ được ưu tiên kết hợp cùng hành vi người đọc trên kệ{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Có thể bạn sẽ thích</strong>.
          </div>

          {/* Block 1: Curated Books */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--accent-primary)' }}>
                  <BookOpenIcon size={15} />
                </span>
                <h2 className="text-sm font-bold font-editorial">Bộ sách đề cử</h2>
              </div>
              <span
                className="text-[11px] font-medium tabular-nums"
                style={{ color: 'var(--text-secondary)' }}
              >
                {curatedBooksCount} bộ đang bật
              </span>
            </div>

            <div className="space-y-2.5">
              {activeBooks.map((book) => {
                const state = bookCurated[book.id] || {
                  isRecommended: false,
                  recommendedNote: ''
                };
                return (
                  <div
                    key={book.id}
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      border: state.isRecommended
                        ? '1px solid rgba(53, 79, 62, 0.45)'
                        : '1px solid var(--border-hairline)'
                    }}
                    className="rounded-[10px] p-3 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 shrink-0">
                        <BookCover
                          src={book.coverUrl}
                          alt={book.title}
                          focalPoint={book.coverFocalPoint}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold font-editorial truncate">{book.title}</h3>
                        <p
                          className="text-[11px] tabular-nums mt-0.5"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {book.episodes.length} tập ·{' '}
                          {book.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setBookCurated((prev) => ({
                            ...prev,
                            [book.id]: {
                              ...state,
                              isRecommended: !state.isRecommended
                            }
                          }))
                        }
                        style={{
                          backgroundColor: state.isRecommended
                            ? 'var(--accent-primary)'
                            : 'var(--bg-surface)',
                          color: state.isRecommended
                            ? 'var(--accent-primary-fg)'
                            : 'var(--text-primary)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="h-9 px-3 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition"
                      >
                        {state.isRecommended && <CheckIcon size={12} />}
                        <span>{state.isRecommended ? 'Đang đề cử' : 'Đề cử'}</span>
                      </button>
                    </div>

                    <div>
                      <label
                        htmlFor={`book-note-${book.id}`}
                        className="block text-[11px] mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        Lời nhắn gợi ý ngắn
                      </label>
                      <input
                        id={`book-note-${book.id}`}
                        type="text"
                        maxLength={140}
                        value={state.recommendedNote}
                        onChange={(e) =>
                          setBookCurated((prev) => ({
                            ...prev,
                            [book.id]: {
                              ...state,
                              recommendedNote: e.target.value
                            }
                          }))
                        }
                        placeholder="vd: Thư viện chọn lọc · Hợp nghe chung cả nhà"
                        style={{
                          backgroundColor: 'var(--bg-canvas)',
                          border: '1px solid var(--border-hairline)'
                        }}
                        className="w-full h-9 px-3 rounded-[7px] text-xs outline-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Block 2: Curated Episodes */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span style={{ color: 'var(--accent-warm)' }}>
                  <CuratedSparkIcon size={15} />
                </span>
                <h2 className="text-sm font-bold font-editorial">Tập truyện lẻ đề cử</h2>
              </div>
              <span
                className="text-[11px] font-medium tabular-nums"
                style={{ color: 'var(--text-secondary)' }}
              >
                {curatedEpisodesCount} tập đang chọn
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                aria-label="Lọc theo bộ sách"
                value={curatedBookFilter}
                onChange={(e) => setCuratedBookFilter(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-9 px-2.5 rounded-[7px] text-xs outline-none sm:max-w-[180px]"
              >
                <option value="ALL">Tất cả bộ sách</option>
                {activeBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>

              <div
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="flex-1 h-9 px-2.5 rounded-[7px] flex items-center gap-1.5"
              >
                <SearchIcon size={13} className="shrink-0 opacity-65" />
                <input
                  type="search"
                  value={curatedEpQuery}
                  onChange={(e) => setCuratedEpQuery(e.target.value)}
                  placeholder="Tìm tên hoặc mã tập..."
                  className="flex-1 bg-transparent text-xs outline-none min-w-0"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlySelectedCuratedEps((prev) => !prev)}
                style={{
                  backgroundColor: onlySelectedCuratedEps
                    ? 'var(--accent-warm)'
                    : 'var(--bg-surface)',
                  color: onlySelectedCuratedEps ? '#1B140A' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
                className="h-9 px-3 rounded-[7px] text-xs font-medium whitespace-nowrap shrink-0"
              >
                Chỉ tập đang chọn
              </button>
            </div>

            {filteredCuratedEpisodes.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-secondary)'
                }}
                className="rounded-[10px] p-5 text-center text-xs"
              >
                Không có tập truyện nào khớp bộ lọc hiện tại.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCuratedEpisodes.map(({ book, episode }) => {
                  const state = episodeCurated[episode.id] || {
                    isRecommended: false,
                    recommendedNote: ''
                  };
                  const showNoteInput = state.isRecommended || Boolean(state.recommendedNote);
                  return (
                    <div
                      key={episode.id}
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        border: state.isRecommended
                          ? '1px solid rgba(158, 123, 67, 0.55)'
                          : '1px solid var(--border-hairline)'
                      }}
                      className="rounded-[10px] p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-[10.5px] font-semibold uppercase tracking-wider truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {book.title}
                          </p>
                          <p className="text-xs font-bold font-editorial truncate mt-0.5">
                            Tập {episode.episodeCode}: {episode.title}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setEpisodeCurated((prev) => ({
                              ...prev,
                              [episode.id]: {
                                ...state,
                                isRecommended: !state.isRecommended
                              }
                            }))
                          }
                          style={{
                            backgroundColor: state.isRecommended
                              ? 'var(--accent-warm)'
                              : 'var(--bg-surface)',
                            color: state.isRecommended ? '#1B140A' : 'var(--text-secondary)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="h-8 px-2.5 rounded-[7px] text-xs font-semibold inline-flex items-center gap-1 shrink-0 transition"
                        >
                          {state.isRecommended && <CheckIcon size={12} />}
                          <span>Đề cử</span>
                        </button>
                      </div>

                      {showNoteInput && (
                        <input
                          type="text"
                          maxLength={140}
                          aria-label={`Lời nhắn gợi ý cho ${episode.title}`}
                          value={state.recommendedNote}
                          onChange={(e) =>
                            setEpisodeCurated((prev) => ({
                              ...prev,
                              [episode.id]: {
                                ...state,
                                recommendedNote: e.target.value
                              }
                            }))
                          }
                          placeholder="Ghi chú ngắn lý do gợi ý (tùy chọn)..."
                          style={{
                            backgroundColor: 'var(--bg-canvas)',
                            border: '1px solid var(--border-hairline)'
                          }}
                          className="w-full h-8 px-2.5 rounded-[7px] text-xs outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <button
            type="button"
            disabled={busy}
            onClick={handleSaveCurated}
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)'
            }}
            className="w-full h-11 rounded-[8px] text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:brightness-110"
          >
            <CheckIcon size={14} />
            <span>{busy ? 'Đang lưu thiết lập...' : 'Lưu thiết lập kệ gợi ý'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: VOICE PROFILES */}
      {tab === 'voices' && (
        <div className="space-y-5">
          <form
            onSubmit={handleSaveVoice}
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] p-4 space-y-3"
          >
            <div className="flex items-center gap-1.5 font-semibold text-sm font-editorial">
              <MicIcon size={15} />
              <span>
                {editingVoiceId ? 'Cập nhật Hồ sơ Giọng đọc' : 'Thêm Hồ sơ Giọng đọc mới'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Mã định danh (voice_key)</label>
                <input
                  type="text"
                  required
                  value={voiceKey}
                  onChange={(e) => setVoiceKey(e.target.value)}
                  placeholder="vd: me_uyen_am_ap"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Tên hiển thị trên trình phát</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="vd: Mẹ Uyên kể"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] text-xs outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">Người thể hiện</label>
                <input
                  type="text"
                  value={narratorName}
                  onChange={(e) => setNarratorName(e.target.value)}
                  placeholder="Tên người đọc"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Ghi chú âm sắc</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ấm áp, chậm rãi..."
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="w-full h-10 px-3 rounded-[7px] text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={busy}
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)'
                }}
                className="h-10 px-4 rounded-[8px] text-xs font-semibold"
              >
                {editingVoiceId ? 'Lưu cập nhật' : 'Thêm Giọng đọc'}
              </button>
              {editingVoiceId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingVoiceId(null);
                    setVoiceKey('');
                    setDisplayName('');
                    setNarratorName('');
                    setNotes('');
                  }}
                  className="h-10 px-3 text-xs underline"
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>

          <div
            style={{
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-hairline)'
            }}
            className="rounded-[10px] divide-y divide-[var(--border-hairline)]"
          >
            {voices.map((v) => (
              <div key={v.id} className="p-3.5 flex items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-semibold font-editorial text-sm">{v.displayName}</p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Mã: <code>{v.voiceKey}</code>
                    {v.narratorName ? ` · Người đọc: ${v.narratorName}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingVoiceId(v.id);
                    setVoiceKey(v.voiceKey);
                    setDisplayName(v.displayName);
                    setNarratorName(v.narratorName);
                    setNotes(v.notes);
                  }}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="h-8 px-3 rounded-[6px] font-medium"
                >
                  Sửa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRASH (SOFT DELETE RECOVERY & PURGE) */}
      {tab === 'trash' && (
        <div className="space-y-4">
          {trashTotal === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-hairline)',
                color: 'var(--text-secondary)'
              }}
              className="rounded-[10px] p-6 text-center text-xs"
            >
              Thùng rác đang trống. Các bộ sách hoặc tập truyện đưa vào thùng rác có thể khôi phục trong 30 ngày.
            </div>
          ) : (
            <>
              {trashedBooks.map((b) => (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="rounded-[10px] p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="vn-eyebrow" style={{ color: 'var(--accent-berry)' }}>
                      Bộ sách đã ẩn
                    </span>
                    <p className="font-semibold font-editorial text-sm truncate">{b.title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTrashAction('book', b.id, 'restore', b.title)}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-8 px-2.5 rounded-[6px] font-medium"
                    >
                      Khôi phục
                    </button>
                    <button
                      type="button"
                      aria-label="Xóa vĩnh viễn"
                      onClick={() => handleTrashAction('book', b.id, 'purge', b.title)}
                      style={{ color: 'var(--accent-berry)' }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {trashedEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-hairline)'
                  }}
                  className="rounded-[10px] p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <span className="vn-eyebrow" style={{ color: 'var(--text-secondary)' }}>
                      Tập thuộc {ep.bookTitle}
                    </span>
                    <p className="font-semibold font-editorial text-sm truncate">
                      Tập {ep.episodeCode}: {ep.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleTrashAction('episode', ep.id, 'restore', ep.title)}
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-hairline)'
                      }}
                      className="h-8 px-2.5 rounded-[6px] font-medium"
                    >
                      Khôi phục
                    </button>
                    <button
                      type="button"
                      aria-label="Xóa vĩnh viễn"
                      onClick={() => handleTrashAction('episode', ep.id, 'purge', ep.title)}
                      style={{ color: 'var(--accent-berry)' }}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
