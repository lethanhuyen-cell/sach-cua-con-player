export type BookPreset = 'moss' | 'ochre' | 'rosewood' | 'lavender';
export type CoverFocalPoint = 'top' | 'center' | 'bottom';
export type PublishStatus = 'draft' | 'published';
export type TocMode = 'thematic' | 'sequential';

export type PillarCode = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';

export type BookLineCode =
  | 'I.1'
  | 'I.2'
  | 'I.3'
  | 'I.4'
  | 'II.1'
  | 'II.2'
  | 'II.3'
  | 'III.1'
  | 'III.2'
  | 'III.3'
  | 'IV.1'
  | 'IV.2'
  | 'IV.3'
  | 'IV.4'
  | 'V.1'
  | 'V.2'
  | 'V.3'
  | 'VI.1'
  | 'VI.2';

export type AudienceBand = 'child_4_10' | 'bridge_8_12' | 'teen_11_15' | 'family_all';
export type ListeningRhythm = 'wind_down' | 'curious_evening';
export type CognitiveDensity = 'gentle' | 'balanced' | 'deep';

export type NarrativeForm =
  | 'du-ky-nhap-vai'
  | 'lich-su-phat-kien'
  | 'chan-dung-nghe-nghiep'
  | 'doi-thoai-suy-tuong'
  | 'giai-ma-doi-thuong'
  | 'van-chuong-huyen-thoai';

export interface CuriosityTrailLink {
  targetEpisodeId: string;
  bridgeQuestion: string;
}

export interface KnowledgeMetadata {
  primaryPillar?: PillarCode;
  primaryLine?: BookLineCode;
  secondaryLines?: BookLineCode[];
  audienceBand?: AudienceBand;
  recommendedGrades?: number[];
  listeningRhythm?: ListeningRhythm;
  cognitiveDensity?: CognitiveDensity;
  narrativeForm?: NarrativeForm;
  crossCuttingConcepts?: string[];
  liberalCompetencies?: string[];
  curriculumAnchors?: string[];
  topicKeywords?: string[];
  curiosityTrails?: CuriosityTrailLink[];
  isRecommended?: boolean;
  recommendedNote?: string;
  recommendedOrder?: number;
}

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
  knowledgeMeta?: KnowledgeMetadata;
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
  knowledgeMeta?: KnowledgeMetadata;
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

export interface LocalReadingProgress {
  episodeId: string;
  bookId: string;
  scrollPercent: number;
  completed: boolean;
  updatedAt: number;
}
