import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AudioTrack,
  Book,
  Episode,
  HydratedAudioTrack,
  HydratedBook,
  HydratedEpisode,
  Illustration,
  LibraryDatabase,
  Part,
  VoiceProfile
} from './types';
import { countWords } from './markdown';

const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'library_db.json');

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

function readLocalDb(): LibraryDatabase {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const empty: LibraryDatabase = {
      schemaVersion: '1.3',
      exportedAt: new Date().toISOString(),
      adminSessionVersion: 1,
      voiceProfiles: [],
      books: [],
      parts: [],
      episodes: [],
      audioTracks: [],
      illustrations: [],
      orphanedMediaQueue: []
    };
    fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(empty, null, 2), 'utf8');
    return empty;
  }
  const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
  return JSON.parse(raw) as LibraryDatabase;
}

function writeLocalDb(db: LibraryDatabase): void {
  db.exportedAt = new Date().toISOString();
  const tmpPath = `${LOCAL_DB_PATH}.tmp`;
  fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, LOCAL_DB_PATH);
}

export async function getAdminSessionVersion(): Promise<number> {
  if (!isSupabaseConfigured()) {
    const db = readLocalDb();
    return db.adminSessionVersion || 1;
  }
  return 1;
}

export async function bumpAdminSessionVersion(): Promise<number> {
  if (!isSupabaseConfigured()) {
    const db = readLocalDb();
    db.adminSessionVersion = (db.adminSessionVersion || 1) + 1;
    writeLocalDb(db);
    return db.adminSessionVersion;
  }
  return 1;
}

function hydrateLibrary(
  db: LibraryDatabase,
  options: { includeUnpublished: boolean; includeTrash: boolean }
): HydratedBook[] {
  const voiceMap = new Map<string, VoiceProfile>(
    db.voiceProfiles.map((v) => [v.id, v])
  );

  const filteredBooks = db.books
    .filter((b) => {
      if (!options.includeTrash && b.deletedAt) return false;
      if (!options.includeUnpublished && b.status !== 'published') return false;
      return true;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return filteredBooks.map((book) => {
    const parts = db.parts
      .filter((p) => p.bookId === book.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    const partMap = new Map(parts.map((p) => [p.id, p]));

    const episodes: HydratedEpisode[] = db.episodes
      .filter((ep) => {
        if (ep.bookId !== book.id) return false;
        if (!options.includeTrash && ep.deletedAt) return false;
        if (!options.includeUnpublished && ep.status !== 'published') return false;
        return true;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((ep) => {
        const tracks: HydratedAudioTrack[] = db.audioTracks
          .filter((t) => t.episodeId === ep.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((t) => ({
            ...t,
            voiceProfile: voiceMap.get(t.voiceProfileId) || {
              id: t.voiceProfileId,
              voiceKey: 'default',
              displayName: 'Giọng đọc',
              narratorName: '',
              notes: '',
              createdAt: t.updatedAt
            }
          }));

        const illustrations = db.illustrations
          .filter((ill) => ill.episodeId === ep.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        const partCover = ep.partId ? partMap.get(ep.partId)?.coverUrl : '';
        const effectiveCoverUrl =
          ep.coverUrl || partCover || book.coverUrl || '/images/books/lim-vacci-cover.jpg';

        return {
          ...ep,
          audioTracks: tracks,
          illustrations,
          effectiveCoverUrl
        };
      });

    return {
      ...book,
      parts,
      episodes
    };
  });
}

async function fetchDatabaseFromSupabase(): Promise<LibraryDatabase> {
  const sb = getSupabaseAdmin();
  const [vpRes, bRes, pRes, eRes, atRes, illRes] = await Promise.all([
    sb.from('voice_profiles').select('*').order('created_at'),
    sb.from('books').select('*').order('sort_order'),
    sb.from('parts').select('*').order('sort_order'),
    sb.from('episodes').select('*').order('sort_order'),
    sb.from('audio_tracks').select('*').order('sort_order'),
    sb.from('illustrations').select('*').order('sort_order')
  ]);

  return {
    schemaVersion: '1.3',
    exportedAt: new Date().toISOString(),
    adminSessionVersion: 1,
    voiceProfiles: (vpRes.data || []).map((r) => ({
      id: r.id,
      voiceKey: r.voice_key,
      displayName: r.display_name,
      narratorName: r.narrator_name || '',
      notes: r.notes || '',
      createdAt: r.created_at
    })),
    books: (bRes.data || []).map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      subtitle: r.subtitle || '',
      description: r.description || '',
      author: r.author || '',
      illustrator: r.illustrator || '',
      ageRange: r.age_range || '3–9 tuổi',
      genreTag: r.genre_tag || 'Thiên nhiên',
      rightsConfirmed: Boolean(r.rights_confirmed),
      coverUrl: r.cover_url || '',
      coverFocalPoint: r.cover_focal_point || 'center',
      themePreset: r.theme_preset || 'moss',
      defaultAutoNext: Boolean(r.default_auto_next),
      showEpisodeNumbers: r.show_episode_numbers !== false,
      sortOrder: r.sort_order || 0,
      status: r.status || 'draft',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deletedAt: r.deleted_at || null
    })),
    parts: (pRes.data || []).map((r) => ({
      id: r.id,
      bookId: r.book_id,
      title: r.title,
      description: r.description || '',
      coverUrl: r.cover_url || '',
      sortOrder: r.sort_order || 0,
      createdAt: r.created_at
    })),
    episodes: (eRes.data || []).map((r) => ({
      id: r.id,
      bookId: r.book_id,
      partId: r.part_id || null,
      episodeCode: r.episode_code || '01',
      title: r.title,
      summary: r.summary || '',
      categoryTag: r.category_tag || '',
      coverUrl: r.cover_url || '',
      contentMarkdown: r.content_markdown || '',
      wordCount: r.word_count || 0,
      isTextOnly: Boolean(r.is_text_only),
      sortOrder: r.sort_order || 0,
      status: r.status || 'draft',
      publishedAt: r.published_at || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deletedAt: r.deleted_at || null
    })),
    audioTracks: (atRes.data || []).map((r) => ({
      id: r.id,
      episodeId: r.episode_id,
      voiceProfileId: r.voice_profile_id,
      audioUrl: r.audio_url,
      durationSeconds: r.duration_seconds || 0,
      fileSizeBytes: Number(r.file_size_bytes || 0),
      mimeType: r.mime_type || 'audio/mpeg',
      isDefault: Boolean(r.is_default),
      sortOrder: r.sort_order || 0,
      updatedAt: r.updated_at
    })),
    illustrations: (illRes.data || []).map((r) => ({
      id: r.id,
      episodeId: r.episode_id,
      imageUrl: r.image_url,
      altText: r.alt_text || '',
      sortOrder: r.sort_order || 0,
      createdAt: r.created_at
    }))
  };
}

export async function getRawDatabase(): Promise<LibraryDatabase> {
  if (isSupabaseConfigured()) {
    return fetchDatabaseFromSupabase();
  }
  return readLocalDb();
}

export async function getPublishedLibrary(): Promise<HydratedBook[]> {
  const db = await getRawDatabase();
  // Only return published books that actually contain >= 1 published episode (ADM-003)
  return hydrateLibrary(db, { includeUnpublished: false, includeTrash: false }).filter(
    (b) => b.episodes.length > 0
  );
}

export async function getAdminLibrary(): Promise<{
  activeBooks: HydratedBook[];
  trashedBooks: Book[];
  trashedEpisodes: (Episode & { bookTitle: string })[];
  voiceProfiles: VoiceProfile[];
}> {
  const db = await getRawDatabase();
  const activeBooks = hydrateLibrary(db, { includeUnpublished: true, includeTrash: false });
  const bookMap = new Map(db.books.map((b) => [b.id, b.title]));
  const trashedBooks = db.books.filter((b) => Boolean(b.deletedAt));
  const trashedEpisodes = db.episodes
    .filter((e) => Boolean(e.deletedAt))
    .map((e) => ({ ...e, bookTitle: bookMap.get(e.bookId) || 'Không rõ bộ sách' }));

  return {
    activeBooks,
    trashedBooks,
    trashedEpisodes,
    voiceProfiles: db.voiceProfiles
  };
}

export async function getEpisodeWithContext(
  episodeId: string,
  allowUnpublished = false
): Promise<{
  book: HydratedBook;
  episode: HydratedEpisode;
  prevEpisode: HydratedEpisode | null;
  nextEpisode: HydratedEpisode | null;
} | null> {
  const db = await getRawDatabase();
  const books = hydrateLibrary(db, {
    includeUnpublished: allowUnpublished,
    includeTrash: false
  });
  for (const book of books) {
    const idx = book.episodes.findIndex((e) => e.id === episodeId);
    if (idx !== -1) {
      return {
        book,
        episode: book.episodes[idx],
        prevEpisode: idx > 0 ? book.episodes[idx - 1] : null,
        nextEpisode: idx < book.episodes.length - 1 ? book.episodes[idx + 1] : null
      };
    }
  }
  return null;
}

// ============================================================================
// ADMIN CRUD OPERATIONS (Dual-Engine: Local JSON + Supabase)
// ============================================================================

function slugifyVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function upsertVoiceProfile(input: {
  id?: string;
  voiceKey: string;
  displayName: string;
  narratorName?: string;
  notes?: string;
}): Promise<VoiceProfile> {
  const cleanKey = slugifyVietnamese(input.voiceKey).replace(/-/g, '_');
  if (!cleanKey || !input.displayName.trim()) {
    throw new Error('Vui lòng nhập đầy đủ mã giọng đọc và tên hiển thị.');
  }

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      voice_key: cleanKey,
      display_name: input.displayName.trim(),
      narrator_name: (input.narratorName || '').trim(),
      notes: (input.notes || '').trim()
    };
    const { data, error } = await sb
      .from('voice_profiles')
      .upsert(payload)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      voiceKey: data.voice_key,
      displayName: data.display_name,
      narratorName: data.narrator_name || '',
      notes: data.notes || '',
      createdAt: data.created_at
    };
  }

  const db = readLocalDb();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = db.voiceProfiles.findIndex((v) => v.id === input.id);
    if (idx !== -1) {
      db.voiceProfiles[idx] = {
        ...db.voiceProfiles[idx],
        voiceKey: cleanKey,
        displayName: input.displayName.trim(),
        narratorName: (input.narratorName || '').trim(),
        notes: (input.notes || '').trim()
      };
      writeLocalDb(db);
      return db.voiceProfiles[idx];
    }
  }
  const created: VoiceProfile = {
    id: crypto.randomUUID(),
    voiceKey: cleanKey,
    displayName: input.displayName.trim(),
    narratorName: (input.narratorName || '').trim(),
    notes: (input.notes || '').trim(),
    createdAt: now
  };
  db.voiceProfiles.push(created);
  writeLocalDb(db);
  return created;
}

export async function upsertBook(input: {
  id?: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description?: string;
  author?: string;
  illustrator?: string;
  ageRange?: string;
  genreTag?: string;
  rightsConfirmed: boolean;
  coverUrl?: string;
  coverFocalPoint?: Book['coverFocalPoint'];
  themePreset?: Book['themePreset'];
  defaultAutoNext?: boolean;
  showEpisodeNumbers?: boolean;
  sortOrder?: number;
  status?: Book['status'];
  parts?: { id?: string; title: string; sortOrder?: number }[];
}): Promise<Book> {
  const title = (input.title || '').trim();
  if (!title) {
    throw new Error('Tên bộ sách không được để trống.');
  }

  const db = await getRawDatabase();
  const targetStatus = input.status || 'draft';

  if (targetStatus === 'published') {
    if (!input.rightsConfirmed) {
      throw new Error(
        'Không thể xuất bản Bộ sách khi chưa xác nhận quyền sở hữu / lưu hành nội dung hợp lệ.'
      );
    }
    const publishedEps = db.episodes.filter(
      (e) => e.bookId === input.id && e.status === 'published' && !e.deletedAt
    );
    if (!input.id || publishedEps.length === 0) {
      throw new Error(
        'Chưa thể xuất bản Bộ sách rỗng. Hãy lưu ở trạng thái Nháp, xuất bản ít nhất 1 Tập rồi bật Xuất bản Bộ sách.'
      );
    }
  }

  const baseSlug = slugifyVietnamese(input.slug || title) || `book-${Date.now()}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const payload = {
      ...(input.id ? { id: input.id } : {}),
      slug: baseSlug,
      title,
      subtitle: (input.subtitle || '').trim(),
      description: (input.description || '').trim(),
      author: (input.author || '').trim(),
      illustrator: (input.illustrator || '').trim(),
      age_range: (input.ageRange || '3–9 tuổi').trim(),
      genre_tag: (input.genreTag || 'Thiên nhiên').trim(),
      rights_confirmed: Boolean(input.rightsConfirmed),
      cover_url: (input.coverUrl || '').trim(),
      cover_focal_point: input.coverFocalPoint || 'center',
      theme_preset: input.themePreset || 'moss',
      default_auto_next: Boolean(input.defaultAutoNext),
      show_episode_numbers: input.showEpisodeNumbers !== false,
      sort_order: input.sortOrder ?? db.books.length,
      status: targetStatus,
      updated_at: now
    };
    const { data, error } = await sb.from('books').upsert(payload).select('*').single();
    if (error) throw new Error(error.message);

    if (input.parts) {
      const keepIds = new Set<string>();
      for (let i = 0; i < input.parts.length; i++) {
        const pt = input.parts[i];
        if (!pt.title.trim()) continue;
        const pRes = await sb
          .from('parts')
          .upsert({
            ...(pt.id ? { id: pt.id } : {}),
            book_id: data.id,
            title: pt.title.trim(),
            sort_order: pt.sortOrder ?? i
          })
          .select('id')
          .single();
        if (pRes.data?.id) keepIds.add(pRes.data.id);
      }
      const existingParts = db.parts.filter((p) => p.bookId === data.id);
      for (const oldP of existingParts) {
        if (!keepIds.has(oldP.id)) {
          await sb.from('parts').delete().eq('id', oldP.id);
        }
      }
    }

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || '',
      description: data.description || '',
      author: data.author || '',
      illustrator: data.illustrator || '',
      ageRange: data.age_range || '',
      genreTag: data.genre_tag || '',
      rightsConfirmed: Boolean(data.rights_confirmed),
      coverUrl: data.cover_url || '',
      coverFocalPoint: data.cover_focal_point || 'center',
      themePreset: data.theme_preset || 'moss',
      defaultAutoNext: Boolean(data.default_auto_next),
      showEpisodeNumbers: data.show_episode_numbers !== false,
      sortOrder: data.sort_order || 0,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at || null
    };
  }

  // Local JSON storage
  const localDb = readLocalDb();
  let bookRecord: Book;
  if (input.id) {
    const idx = localDb.books.findIndex((b) => b.id === input.id);
    if (idx === -1) throw new Error('Không tìm thấy Bộ sách.');
    bookRecord = {
      ...localDb.books[idx],
      slug: baseSlug,
      title,
      subtitle: (input.subtitle || '').trim(),
      description: (input.description || '').trim(),
      author: (input.author || '').trim(),
      illustrator: (input.illustrator || '').trim(),
      ageRange: (input.ageRange || '3–9 tuổi').trim(),
      genreTag: (input.genreTag || 'Thiên nhiên').trim(),
      rightsConfirmed: Boolean(input.rightsConfirmed),
      coverUrl: (input.coverUrl ?? localDb.books[idx].coverUrl).trim(),
      coverFocalPoint: input.coverFocalPoint || localDb.books[idx].coverFocalPoint || 'center',
      themePreset: input.themePreset || localDb.books[idx].themePreset || 'moss',
      defaultAutoNext: input.defaultAutoNext ?? localDb.books[idx].defaultAutoNext,
      showEpisodeNumbers: input.showEpisodeNumbers ?? localDb.books[idx].showEpisodeNumbers,
      sortOrder: input.sortOrder ?? localDb.books[idx].sortOrder,
      status: targetStatus,
      updatedAt: now
    };
    localDb.books[idx] = bookRecord;
  } else {
    let uniqueSlug = baseSlug;
    let suffix = 2;
    while (localDb.books.some((b) => b.slug === uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${suffix++}`;
    }
    bookRecord = {
      id: crypto.randomUUID(),
      slug: uniqueSlug,
      title,
      subtitle: (input.subtitle || '').trim(),
      description: (input.description || '').trim(),
      author: (input.author || '').trim(),
      illustrator: (input.illustrator || '').trim(),
      ageRange: (input.ageRange || '3–9 tuổi').trim(),
      genreTag: (input.genreTag || 'Thiên nhiên').trim(),
      rightsConfirmed: Boolean(input.rightsConfirmed),
      coverUrl: (input.coverUrl || '').trim(),
      coverFocalPoint: input.coverFocalPoint || 'center',
      themePreset: input.themePreset || 'moss',
      defaultAutoNext: Boolean(input.defaultAutoNext),
      showEpisodeNumbers: input.showEpisodeNumbers !== false,
      sortOrder: input.sortOrder ?? localDb.books.length,
      status: targetStatus,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    localDb.books.push(bookRecord);
  }

  if (input.parts) {
    const keepIds = new Set<string>();
    const nextParts: Part[] = localDb.parts.filter((p) => p.bookId !== bookRecord.id);
    input.parts.forEach((pt, idx) => {
      if (!pt.title.trim()) return;
      const existing = localDb.parts.find((p) => p.id === pt.id && p.bookId === bookRecord.id);
      const id = existing ? existing.id : crypto.randomUUID();
      keepIds.add(id);
      nextParts.push({
        id,
        bookId: bookRecord.id,
        title: pt.title.trim(),
        description: existing?.description || '',
        coverUrl: existing?.coverUrl || '',
        sortOrder: pt.sortOrder ?? idx,
        createdAt: existing?.createdAt || now
      });
    });
    // Detach episodes cleanly without data loss if a Part was removed (AC-10)
    localDb.episodes = localDb.episodes.map((ep) =>
      ep.bookId === bookRecord.id && ep.partId && !keepIds.has(ep.partId)
        ? { ...ep, partId: null }
        : ep
    );
    localDb.parts = nextParts;
  }

  writeLocalDb(localDb);
  return bookRecord;
}

export async function upsertEpisode(input: {
  id?: string;
  bookId: string;
  partId?: string | null;
  episodeCode: string;
  title: string;
  summary?: string;
  categoryTag?: string;
  coverUrl?: string;
  contentMarkdown: string;
  isTextOnly: boolean;
  sortOrder?: number;
  status: Episode['status'];
  audioTracks: {
    id?: string;
    voiceProfileId: string;
    audioUrl: string;
    durationSeconds: number;
    fileSizeBytes?: number;
    mimeType?: string;
    isDefault?: boolean;
  }[];
  illustrations: {
    id?: string;
    imageUrl: string;
    altText?: string;
  }[];
}): Promise<Episode> {
  const title = (input.title || '').trim();
  const contentMarkdown = (input.contentMarkdown || '').normalize('NFC');
  const wordCount = countWords(contentMarkdown);

  if (wordCount > 30000) {
    throw new Error(`Bản chữ vượt quá giới hạn 30.000 từ/tập (hiện tại: ${wordCount} từ).`);
  }
  if (input.audioTracks.length > 5) {
    throw new Error('Mỗi tập hỗ trợ tối đa 5 bản thu giọng đọc.');
  }
  if (input.illustrations.length > 20) {
    throw new Error('Mỗi tập hỗ trợ tối đa 20 tranh minh họa.');
  }

  const db = await getRawDatabase();
  const book = db.books.find((b) => b.id === input.bookId && !b.deletedAt);
  if (!book) {
    throw new Error('Bộ sách chứa tập này không tồn tại hoặc đang nằm trong Thùng rác.');
  }

  // Pre-publish validation (PUB-002, AC-05)
  if (input.status === 'published') {
    const missing: string[] = [];
    if (!title) missing.push('Tiêu đề tập');
    if (!book.rightsConfirmed) missing.push('Xác nhận bản quyền trên Bộ sách');
    if (!input.isTextOnly && input.audioTracks.filter((t) => t.audioUrl.trim()).length === 0) {
      missing.push('Ít nhất 1 tệp Audio hợp lệ (hoặc bật chế độ "Chỉ đọc chữ")');
    }
    if (missing.length > 0) {
      throw new Error(`Chưa đủ điều kiện Xuất bản — còn thiếu: ${missing.join('; ')}.`);
    }
  } else if (!title) {
    throw new Error('Vui lòng nhập Tiêu đề tập trước khi lưu nháp.');
  }

  const now = new Date().toISOString();
  const normalizedTracks = input.isTextOnly
    ? []
    : input.audioTracks
        .filter((t) => t.audioUrl.trim() && t.voiceProfileId)
        .map((t, i) => ({
          id: t.id || crypto.randomUUID(),
          voiceProfileId: t.voiceProfileId,
          audioUrl: t.audioUrl.trim(),
          durationSeconds: Math.max(0, Math.round(t.durationSeconds || 0)),
          fileSizeBytes: t.fileSizeBytes || 0,
          mimeType: t.mimeType || 'audio/mpeg',
          isDefault: i === 0 ? true : Boolean(t.isDefault),
          sortOrder: i,
          updatedAt: now
        }));

  if (normalizedTracks.length > 0 && !normalizedTracks.some((t) => t.isDefault)) {
    normalizedTracks[0].isDefault = true;
  }

  const normalizedIllustrations = input.illustrations
    .filter((ill) => ill.imageUrl.trim())
    .map((ill, i) => ({
      id: ill.id || crypto.randomUUID(),
      imageUrl: ill.imageUrl.trim(),
      altText: (ill.altText || title).trim(),
      sortOrder: i,
      createdAt: now
    }));

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const epPayload = {
      ...(input.id ? { id: input.id } : {}),
      book_id: input.bookId,
      part_id: input.partId || null,
      episode_code: (input.episodeCode || '01').trim(),
      title,
      summary: (input.summary || '').trim(),
      category_tag: (input.categoryTag || '').trim(),
      cover_url: (input.coverUrl || '').trim(),
      content_markdown: contentMarkdown,
      word_count: wordCount,
      is_text_only: Boolean(input.isTextOnly),
      sort_order:
        input.sortOrder ??
        db.episodes.filter((e) => e.bookId === input.bookId).length,
      status: input.status,
      published_at: input.status === 'published' ? now : null,
      updated_at: now
    };
    const { data, error } = await sb.from('episodes').upsert(epPayload).select('*').single();
    if (error) throw new Error(error.message);

    await sb.from('audio_tracks').delete().eq('episode_id', data.id);
    if (normalizedTracks.length > 0) {
      await sb.from('audio_tracks').insert(
        normalizedTracks.map((t) => ({
          id: t.id,
          episode_id: data.id,
          voice_profile_id: t.voiceProfileId,
          audio_url: t.audioUrl,
          duration_seconds: t.durationSeconds,
          file_size_bytes: t.fileSizeBytes,
          mime_type: t.mimeType,
          is_default: t.isDefault,
          sort_order: t.sortOrder,
          updated_at: now
        }))
      );
    }

    await sb.from('illustrations').delete().eq('episode_id', data.id);
    if (normalizedIllustrations.length > 0) {
      await sb.from('illustrations').insert(
        normalizedIllustrations.map((ill) => ({
          id: ill.id,
          episode_id: data.id,
          image_url: ill.imageUrl,
          alt_text: ill.altText,
          sort_order: ill.sortOrder
        }))
      );
    }

    return {
      id: data.id,
      bookId: data.book_id,
      partId: data.part_id || null,
      episodeCode: data.episode_code,
      title: data.title,
      summary: data.summary || '',
      categoryTag: data.category_tag || '',
      coverUrl: data.cover_url || '',
      contentMarkdown: data.content_markdown || '',
      wordCount: data.word_count || 0,
      isTextOnly: Boolean(data.is_text_only),
      sortOrder: data.sort_order || 0,
      status: data.status,
      publishedAt: data.published_at || null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at || null
    };
  }

  // Local JSON storage
  const localDb = readLocalDb();
  let epRecord: Episode;
  if (input.id) {
    const idx = localDb.episodes.findIndex((e) => e.id === input.id);
    if (idx === -1) throw new Error('Không tìm thấy Tập truyện.');
    const prev = localDb.episodes[idx];
    epRecord = {
      ...prev,
      bookId: input.bookId,
      partId: input.partId || null,
      episodeCode: (input.episodeCode || prev.episodeCode || '01').trim(),
      title,
      summary: (input.summary ?? prev.summary).trim(),
      categoryTag: (input.categoryTag ?? prev.categoryTag).trim(),
      coverUrl: (input.coverUrl ?? prev.coverUrl).trim(),
      contentMarkdown,
      wordCount,
      isTextOnly: Boolean(input.isTextOnly),
      sortOrder: input.sortOrder ?? prev.sortOrder,
      status: input.status,
      publishedAt:
        input.status === 'published' ? prev.publishedAt || now : prev.publishedAt,
      updatedAt: now
    };
    localDb.episodes[idx] = epRecord;
  } else {
    const bookEps = localDb.episodes.filter((e) => e.bookId === input.bookId);
    epRecord = {
      id: crypto.randomUUID(),
      bookId: input.bookId,
      partId: input.partId || null,
      episodeCode: (input.episodeCode || String(bookEps.length + 1).padStart(2, '0')).trim(),
      title,
      summary: (input.summary || '').trim(),
      categoryTag: (input.categoryTag || '').trim(),
      coverUrl: (input.coverUrl || '').trim(),
      contentMarkdown,
      wordCount,
      isTextOnly: Boolean(input.isTextOnly),
      sortOrder: input.sortOrder ?? bookEps.length,
      status: input.status,
      publishedAt: input.status === 'published' ? now : null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    localDb.episodes.push(epRecord);
  }

  // Queue replaced media for 48h orphan cleanup (ADM-006, ADM-007)
  const oldUrls = new Set<string>([
    ...localDb.audioTracks.filter((t) => t.episodeId === epRecord.id).map((t) => t.audioUrl),
    ...localDb.illustrations.filter((i) => i.episodeId === epRecord.id).map((i) => i.imageUrl)
  ]);
  const newUrls = new Set<string>([
    ...normalizedTracks.map((t) => t.audioUrl),
    ...normalizedIllustrations.map((i) => i.imageUrl)
  ]);
  const deleteAfter = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
  localDb.orphanedMediaQueue = localDb.orphanedMediaQueue || [];
  oldUrls.forEach((u) => {
    if (u && !newUrls.has(u)) {
      localDb.orphanedMediaQueue!.push({ url: u, scheduledDeleteAfter: deleteAfter });
    }
  });

  localDb.audioTracks = [
    ...localDb.audioTracks.filter((t) => t.episodeId !== epRecord.id),
    ...normalizedTracks.map((t) => ({ ...t, episodeId: epRecord.id }))
  ];
  localDb.illustrations = [
    ...localDb.illustrations.filter((i) => i.episodeId !== epRecord.id),
    ...normalizedIllustrations.map((i) => ({ ...i, episodeId: epRecord.id }))
  ];

  writeLocalDb(localDb);
  return epRecord;
}

export async function updateTrashState(params: {
  entity: 'book' | 'episode';
  id: string;
  action: 'trash' | 'restore' | 'purge';
}): Promise<void> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured()) {
    const sb = getSupabaseAdmin();
    const table = params.entity === 'book' ? 'books' : 'episodes';
    if (params.action === 'trash') {
      await sb.from(table).update({ deleted_at: now }).eq('id', params.id);
    } else if (params.action === 'restore') {
      // Restoring from Trash returns item safely to Draft/Hidden state (PRD 6.2)
      await sb
        .from(table)
        .update({ deleted_at: null, status: 'draft' })
        .eq('id', params.id);
    } else {
      await sb.from(table).delete().eq('id', params.id);
    }
    return;
  }

  const db = readLocalDb();
  if (params.entity === 'book') {
    if (params.action === 'purge') {
      const epIds = new Set(
        db.episodes.filter((e) => e.bookId === params.id).map((e) => e.id)
      );
      db.books = db.books.filter((b) => b.id !== params.id);
      db.parts = db.parts.filter((p) => p.bookId !== params.id);
      db.episodes = db.episodes.filter((e) => e.bookId !== params.id);
      db.audioTracks = db.audioTracks.filter((t) => !epIds.has(t.episodeId));
      db.illustrations = db.illustrations.filter((i) => !epIds.has(i.episodeId));
    } else {
      db.books = db.books.map((b) =>
        b.id === params.id
          ? {
              ...b,
              deletedAt: params.action === 'trash' ? now : null,
              status: params.action === 'restore' ? 'draft' : b.status,
              updatedAt: now
            }
          : b
      );
    }
  } else {
    if (params.action === 'purge') {
      db.episodes = db.episodes.filter((e) => e.id !== params.id);
      db.audioTracks = db.audioTracks.filter((t) => t.episodeId !== params.id);
      db.illustrations = db.illustrations.filter((i) => i.episodeId !== params.id);
    } else {
      db.episodes = db.episodes.map((e) =>
        e.id === params.id
          ? {
              ...e,
              deletedAt: params.action === 'trash' ? now : null,
              status: params.action === 'restore' ? 'draft' : e.status,
              updatedAt: now
            }
          : e
      );
    }
  }
  writeLocalDb(db);
}

export async function buildBackupExportPayload(): Promise<Record<string, unknown>> {
  const db = await getRawDatabase();
  const mediaManifest: { type: string; ownerId: string; url: string }[] = [];

  db.books.forEach((b) => {
    if (b.coverUrl) mediaManifest.push({ type: 'book_cover', ownerId: b.id, url: b.coverUrl });
  });
  db.episodes.forEach((e) => {
    if (e.coverUrl) mediaManifest.push({ type: 'episode_cover', ownerId: e.id, url: e.coverUrl });
  });
  db.audioTracks.forEach((t) => {
    mediaManifest.push({ type: 'audio_track', ownerId: t.episodeId, url: t.audioUrl });
  });
  db.illustrations.forEach((ill) => {
    mediaManifest.push({ type: 'illustration_3x4', ownerId: ill.episodeId, url: ill.imageUrl });
  });

  return {
    product: 'Thư viện Đồi Mơ — Sách đọc và nghe trước giờ ngủ',
    copyright: 'Copyright © Nancy & Liti',
    schemaVersion: '1.3',
    exportedAt: new Date().toISOString(),
    summary: {
      totalBooks: db.books.length,
      totalParts: db.parts.length,
      totalEpisodes: db.episodes.length,
      totalVoiceProfiles: db.voiceProfiles.length,
      totalAudioTracks: db.audioTracks.length,
      totalIllustrations: db.illustrations.length
    },
    voiceProfiles: db.voiceProfiles,
    books: db.books,
    parts: db.parts,
    episodes: db.episodes,
    audioTracks: db.audioTracks,
    illustrations: db.illustrations,
    mediaManifest
  };
}
