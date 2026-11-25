export type BookPreset = 'moss' | 'ochre' | 'rosewood' | 'lavender';
export type CoverFocalPoint = 'top' | 'center' | 'bottom';
export type PublishStatus = 'draft' | 'published';
export type TocMode = 'thematic' | 'sequential';

export interface VoiceProfile {
  id: string;
  voiceKey: string;
  displayName: string;
  narratorName: string;
  notes: string;
  createdAt: string;
}

export interface AudioTrack {
  id: string;
  episodeId: string;
  voiceProfileId: string;
  audioUrl: string;
  durationSeconds: number;
  fileSizeBytes: number;
  mimeType: string;
  isDefault: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface Illustration {
  id: string;
  episodeId: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
  createdAt: string;
}

export interface Part {
  id: string;
  bookId: string;
  title: string;
  description: string;
  coverUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  bookId: string;
  partId: string | null;
  episodeCode: string;
  title: string;
  summary: string;
  categoryTag: string;
  coverUrl: string;
  contentMarkdown: string;
  wordCount: number;
  isTextOnly: boolean;
  sortOrder: number;
  status: PublishStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  illustrator: string;
  ageRange: string;
  genreTag: string;
  rightsConfirmed: boolean;
  coverUrl: string;
  coverFocalPoint: CoverFocalPoint;
  themePreset: BookPreset;
  tocMode?: TocMode;
  defaultAutoNext: boolean;
  showEpisodeNumbers: boolean;
  sortOrder: number;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface HydratedAudioTrack extends AudioTrack {
  voiceProfile: VoiceProfile;
}

export interface HydratedEpisode extends Episode {
  audioTracks: HydratedAudioTrack[];
  illustrations: Illustration[];
  effectiveCoverUrl: string;
}

export interface HydratedBook extends Book {
  parts: Part[];
  episodes: HydratedEpisode[];
}

export interface LibraryDatabase {
  schemaVersion: string;
  exportedAt: string;
  adminSessionVersion: number;
  voiceProfiles: VoiceProfile[];
  books: Book[];
  parts: Part[];
  episodes: Episode[];
  audioTracks: AudioTrack[];
  illustrations: Illustration[];
  orphanedMediaQueue?: { url: string; scheduledDeleteAfter: string }[];
}

export interface LocalEpisodeProgress {
  episodeId: string;
  bookId: string;
  voiceKey: string;
  trackUpdatedAt: string;
  positionSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: number;
}
