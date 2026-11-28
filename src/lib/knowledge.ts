import {
  AudienceBand,
  Book,
  BookLineCode,
  CognitiveDensity,
  Episode,
  KnowledgeMetadata,
  ListeningRhythm,
  NarrativeForm,
  PillarCode
} from './types';
import type { ThematicHallSlug } from './halls';

export type AudienceFilterKey = 'ALL' | 'CHILD' | 'TEEN';

export interface KnowledgePillarDefinition {
  code: PillarCode;
  title: string;
  shortTitle: string;
  description: string;
  defaultHallSlug: ThematicHallSlug;
}

export interface BookLineDefinition {
  code: BookLineCode;
  pillar: PillarCode;
  title: string;
  scopeSummary: string;
  defaultHallSlug: ThematicHallSlug;
  isReservedFuture?: boolean;
}

export interface ControlledConceptDefinition {
  slug: string;
  label: string;
  hint: string;
}

export const KNOWLEDGE_PILLARS: KnowledgePillarDefinition[] = [
  {
    code: 'I',
    title: 'I. Tự nhiên, Vũ trụ & Sinh quyển',
    shortTitle: 'Tự nhiên & Vũ trụ',
    description: 'Khám phá bầu trời, Trái Đất, muôn loài và các quy luật tự nhiên.',
    defaultHallSlug: 'thien-nhien-ky-thu'
  },
  {
    code: 'II',
    title: 'II. Văn minh, Đất Việt & Địa văn hóa',
    shortTitle: 'Văn minh & Đất Việt',
    description: 'Theo dấu chân con người qua lịch sử nhân loại, cội nguồn Việt Nam và các vùng đất.',
    defaultHallSlug: 'chuyen-xua-va-the-gioi'
  },
  {
    code: 'III',
    title: 'III. Xã hội Hiện đại, Kinh tế & Công nghệ',
    shortTitle: 'Xã hội & Công nghệ',
    description: 'Giải mã kinh tế, luật lệ, máy móc, thế giới số và những người mở đường.',
    defaultHallSlug: 'the-gioi-hom-nay'
  },
  {
    code: 'IV',
    title: 'IV. Cơ thể, Tâm trí & Đời sống Tự chủ',
    shortTitle: 'Hiểu mình & Tự lập',
    description: 'Hiểu cơ thể đang lớn, cảm xúc bên trong, tình bạn và nếp sống tự lập.',
    defaultHallSlug: 'lon-len-moi-ngay'
  },
  {
    code: 'V',
    title: 'V. Tư duy, Ngôn ngữ & Triết học',
    shortTitle: 'Tư duy & Ngôn từ',
    description: 'Rèn cách đặt câu hỏi, tôn trọng sự thật, triết học gần gũi và vẻ đẹp tiếng nói.',
    defaultHallSlug: 'vuon-tri-tue'
  },
  {
    code: 'VI',
    title: 'VI. Văn chương, Âm nhạc & Mỹ học',
    shortTitle: 'Văn chương & Cái đẹp',
    description: 'Thần thoại, đồng thoại, văn học chọn lọc, âm nhạc và câu chuyện nghệ thuật.',
    defaultHallSlug: 'vuon-tri-tue'
  }
];

export const BOOK_LINES: BookLineDefinition[] = [
  {
    code: 'I.1',
    pillar: 'I',
    title: 'Bên kia bầu trời',
    scopeSummary: 'Thiên văn học, vũ trụ học và hành trình quan sát không gian',
    defaultHallSlug: 'thien-nhien-ky-thu'
  },
  {
    code: 'I.2',
    pillar: 'I',
    title: 'Hành tinh sống',
    scopeSummary: 'Trái Đất, địa chất, đại dương, khí hậu và sinh thái bền vững',
    defaultHallSlug: 'thien-nhien-ky-thu'
  },
  {
    code: 'I.3',
    pillar: 'I',
    title: 'Kỳ quan sự sống',
    scopeSummary: 'Tế bào, vi sinh vật, nấm, thực vật, động vật và tiến hóa',
    defaultHallSlug: 'thien-nhien-ky-thu'
  },
  {
    code: 'I.4',
    pillar: 'I',
    title: 'Những quy luật vô hình',
    scopeSummary: 'Vật chất, lực, năng lượng, hóa lý tự nhiên và lịch sử phát kiến',
    defaultHallSlug: 'thien-nhien-ky-thu'
  },
  {
    code: 'II.1',
    pillar: 'II',
    title: 'Hành trình nhân loại',
    scopeSummary: 'Lịch sử thế giới, khảo cổ và những bước ngoặt văn minh',
    defaultHallSlug: 'chuyen-xua-va-the-gioi'
  },
  {
    code: 'II.2',
    pillar: 'II',
    title: 'Chuyện kể đất Việt',
    scopeSummary: 'Lịch sử, di sản, danh nhân, châu thổ và biển đảo Việt Nam',
    defaultHallSlug: 'chuyen-xua-va-the-gioi'
  },
  {
    code: 'II.3',
    pillar: 'II',
    title: 'Thế giới muôn màu',
    scopeSummary: 'Địa lý nhân văn, phong tục, ẩm thực văn hóa và đời sống các dân tộc',
    defaultHallSlug: 'chuyen-xua-va-the-gioi'
  },
  {
    code: 'III.1',
    pillar: 'III',
    title: 'Luật chơi của xã hội',
    scopeSummary: 'Kinh tế học, tiền tệ, pháp luật, quyền trẻ em và đời sống công dân',
    defaultHallSlug: 'the-gioi-hom-nay'
  },
  {
    code: 'III.2',
    pillar: 'III',
    title: 'Máy móc, Thế giới số & Tương lai',
    scopeSummary: 'Kỹ thuật đời sống, Internet, thuật toán, trí tuệ nhân tạo và an toàn số',
    defaultHallSlug: 'the-gioi-hom-nay'
  },
  {
    code: 'III.3',
    pillar: 'III',
    title: 'Những người mở đường',
    scopeSummary: 'Chân dung nhà khoa học, nhà tư tưởng, nghệ nhân và thế giới nghề nghiệp',
    defaultHallSlug: 'the-gioi-hom-nay'
  },
  {
    code: 'IV.1',
    pillar: 'IV',
    title: 'Cơ thể đang lớn',
    scopeSummary: 'Sinh học người, tuổi dậy thì, não bộ, dinh dưỡng và giấc ngủ',
    defaultHallSlug: 'lon-len-moi-ngay'
  },
  {
    code: 'IV.2',
    pillar: 'IV',
    title: 'Thế giới bên trong mình',
    scopeSummary: 'Tâm lý thiếu niên, nhận diện cảm xúc, lòng tự trọng và bản sắc',
    defaultHallSlug: 'lon-len-moi-ngay'
  },
  {
    code: 'IV.3',
    pillar: 'IV',
    title: 'Sống cùng nhau',
    scopeSummary: 'Gia đình, tình bạn, thấu cảm, ranh giới cá nhân và ứng xử học đường',
    defaultHallSlug: 'lon-len-moi-ngay'
  },
  {
    code: 'IV.4',
    pillar: 'IV',
    title: 'Nếp sống tự lập',
    scopeSummary: 'Phương pháp tự học, quản lý thời gian, bếp núc - nếp nhà và an toàn sống',
    defaultHallSlug: 'lon-len-moi-ngay'
  },
  {
    code: 'V.1',
    pillar: 'V',
    title: 'Học cách suy nghĩ',
    scopeSummary: 'Tư duy phản biện, kiểm chứng sự thật, nhận diện ngụy biện và câu hỏi triết học',
    defaultHallSlug: 'vuon-tri-tue'
  },
  {
    code: 'V.2',
    pillar: 'V',
    title: 'Tiếng nói và Ngôn từ',
    scopeSummary: 'Vẻ đẹp tiếng Việt, từ nguyên học, lắng nghe và nghệ thuật biểu đạt',
    defaultHallSlug: 'vuon-tri-tue'
  },
  {
    code: 'V.3',
    pillar: 'V',
    title: 'Tư duy Toán học & Vẻ đẹp Hình mẫu',
    scopeSummary: 'Khớp nối dự phòng giai đoạn sau (chưa phát triển trong giai đoạn hiện tại)',
    defaultHallSlug: 'vuon-tri-tue',
    isReservedFuture: true
  },
  {
    code: 'VI.1',
    pillar: 'VI',
    title: 'Chân trời văn chương',
    scopeSummary: 'Thần thoại, truyền thuyết, đồng thoại, truyện ngắn và tiểu thuyết chọn lọc',
    defaultHallSlug: 'vuon-tri-tue'
  },
  {
    code: 'VI.2',
    pillar: 'VI',
    title: 'Thanh âm và Cái đẹp',
    scopeSummary: 'Thường thức âm nhạc, thi ca và câu chuyện đằng sau hội họa - kiến trúc',
    defaultHallSlug: 'vuon-tri-tue'
  }
];

export const ACTIVE_BOOK_LINES = BOOK_LINES.filter((line) => !line.isReservedFuture);

export const CROSS_CUTTING_CONCEPTS: ControlledConceptDefinition[] = [
  { slug: 'he-thong', label: 'Hệ thống & Mạng lưới', hint: 'Các phần tử liên kết tạo nên chỉnh thể' },
  { slug: 'nhan-qua', label: 'Nguyên nhân & Hệ quả', hint: 'Mạch dẫn từ căn nguyên tới kết quả' },
  { slug: 'bien-doi-tien-hoa', label: 'Biến đổi & Thích nghi', hint: 'Sự chuyển hóa của vật chất và muôn loài' },
  { slug: 'can-bang-ben-vung', label: 'Cân bằng & Bền vững', hint: 'Sự hài hòa giữa con người và tự nhiên' },
  { slug: 'ban-sac-coi-nguon', label: 'Bản sắc & Cội nguồn', hint: 'Ký ức văn hóa, quê hương và căn cốt cá nhân' },
  { slug: 'da-goc-nhin', label: 'Đa góc nhìn', hint: 'Nhìn một sự việc từ nhiều điểm đứng khác nhau' },
  { slug: 'quy-luat-mau-hinh', label: 'Quy luật & Hình mẫu', hint: 'Những trật tự lặp lại âm thầm trong tự nhiên' },
  { slug: 'cong-bang-trach-nhiem', label: 'Công bằng & Trách nhiệm', hint: 'Quyền lợi, bổn phận và lòng tử tế' },
  { slug: 'phat-kien-sang-tao', label: 'Phát kiến & Sáng tạo', hint: 'Từ câu hỏi tò mò đến giải pháp mới' },
  { slug: 'tuong-thuoc-ket-noi', label: 'Giao thoa & Tương thuộc', hint: 'Sự gắn kết giữa các vùng đất và cộng đồng' },
  { slug: 'su-that-bang-chung', label: 'Sự thật & Bằng chứng', hint: 'Kiểm chứng thông tin thay vì tin theo lời đồn' },
  { slug: 'cai-dep-hai-hoa', label: 'Cái đẹp & Sự tinh tế', hint: 'Cảm thụ thanh âm, ngôn từ và nếp sống đẹp' }
];

export const LIBERAL_COMPETENCIES: { slug: string; label: string }[] = [
  { slug: 'tu-duy-phan-bien', label: 'Tư duy phản biện' },
  { slug: 'tu-duy-he-thong', label: 'Tư duy hệ thống' },
  { slug: 'thau-cam-nhan-van', label: 'Thấu cảm nhân văn' },
  { slug: 'tu-nhan-thuc-cam-xuc', label: 'Tự nhận thức & Cảm xúc' },
  { slug: 'nang-luc-so-thong-tin', label: 'Năng lực số & Thông tin' },
  { slug: 'tu-chu-doi-song', label: 'Tự chủ đời sống' },
  { slug: 'cam-thu-tham-my', label: 'Cảm thụ thẩm mỹ' }
];

export const AUDIENCE_BAND_OPTIONS: {
  value: AudienceBand;
  label: string;
  shortLabel: string;
  defaultAgeRange: string;
}[] = [
  {
    value: 'child_4_10',
    label: 'Thiếu nhi (4–10 tuổi)',
    shortLabel: '4–10 tuổi',
    defaultAgeRange: '4–10 tuổi'
  },
  {
    value: 'bridge_8_12',
    label: 'Giao thoa Tiểu học & Đầu THCS (7–13 tuổi)',
    shortLabel: '7–13 tuổi',
    defaultAgeRange: '7–13 tuổi'
  },
  {
    value: 'teen_11_15',
    label: 'Thiếu niên THCS (11–15 tuổi)',
    shortLabel: '11–15 tuổi',
    defaultAgeRange: '11–15 tuổi'
  },
  {
    value: 'family_all',
    label: 'Gia đình nghe chung mọi lứa tuổi',
    shortLabel: 'Mọi lứa tuổi',
    defaultAgeRange: 'Mọi lứa tuổi'
  }
];

export const AUDIENCE_FILTER_PILLS: {
  key: AudienceFilterKey;
  label: string;
}[] = [
  { key: 'ALL', label: 'Tất cả độ tuổi' },
  { key: 'CHILD', label: 'Thiếu nhi (4–10)' },
  { key: 'TEEN', label: 'Thiếu niên (11–15)' }
];

export const LISTENING_RHYTHM_OPTIONS: { value: ListeningRhythm; label: string }[] = [
  { value: 'wind_down', label: 'Nhịp Tĩnh · Đọc & nghe êm trước giờ ngủ' },
  { value: 'curious_evening', label: 'Nhịp Mở · Khám phá chiều tối & cuối tuần' }
];

export const COGNITIVE_DENSITY_OPTIONS: { value: CognitiveDensity; label: string }[] = [
  { value: 'gentle', label: 'Nhẹ nhàng, thư giãn' },
  { value: 'balanced', label: 'Vừa sức suy ngẫm' },
  { value: 'deep', label: 'Chuyên sâu khai phóng' }
];

export const NARRATIVE_FORM_OPTIONS: { value: NarrativeForm; label: string }[] = [
  { value: 'van-chuong-huyen-thoai', label: 'Đồng thoại / Huyền thoại / Văn chương' },
  { value: 'giai-ma-doi-thuong', label: 'Giải mã hiện tượng từ đời thường' },
  { value: 'du-ky-nhap-vai', label: 'Du ký không gian & thời gian' },
  { value: 'lich-su-phat-kien', label: 'Lịch sử câu hỏi & phát kiến' },
  { value: 'chan-dung-nghe-nghiep', label: 'Chân dung con người & nghề nghiệp' },
  { value: 'doi-thoai-suy-tuong', label: 'Đối thoại & suy tưởng triết học' }
];

export function getBookLineByCode(code?: string | null): BookLineDefinition | undefined {
  if (!code) return undefined;
  return BOOK_LINES.find((line) => line.code === code);
}

export function getPillarByCode(code?: string | null): KnowledgePillarDefinition | undefined {
  if (!code) return undefined;
  return KNOWLEDGE_PILLARS.find((p) => p.code === code);
}

export function getConceptBySlug(slug: string): ControlledConceptDefinition | undefined {
  return CROSS_CUTTING_CONCEPTS.find((c) => c.slug === slug);
}

export function inferBookAudienceBand(
  book: Pick<Book, 'ageRange' | 'knowledgeMeta'>
): AudienceBand {
  if (book.knowledgeMeta?.audienceBand) {
    return book.knowledgeMeta.audienceBand;
  }
  const raw = (book.ageRange || '').normalize('NFC').toLowerCase();
  if (raw.includes('mọi') || raw.includes('gia đình')) return 'family_all';

  const nums = (raw.match(/\d+/g) || []).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
  if (nums.length >= 2) {
    const minAge = Math.min(...nums);
    const maxAge = Math.max(...nums);
    if (minAge >= 11) return 'teen_11_15';
    if (minAge <= 9 && maxAge >= 12) return 'bridge_8_12';
    if (maxAge <= 10) return 'child_4_10';
  }
  if (raw.includes('thiếu niên') || raw.includes('thcs') || raw.includes('lớp 6')) {
    return 'teen_11_15';
  }
  return 'child_4_10';
}

export function matchesAudienceFilter(
  book: Pick<Book, 'ageRange' | 'knowledgeMeta'>,
  filter: AudienceFilterKey
): boolean {
  if (filter === 'ALL') return true;
  const band = inferBookAudienceBand(book);
  if (band === 'family_all' || band === 'bridge_8_12') return true;
  if (filter === 'CHILD') return band === 'child_4_10';
  if (filter === 'TEEN') return band === 'teen_11_15';
  return true;
}

function normalizeText(input?: string | null): string {
  return (input || '').normalize('NFC').toLowerCase().trim();
}

export function buildKnowledgeSearchBlob(meta?: KnowledgeMetadata): string {
  if (!meta) return '';
  const parts: string[] = [];
  if (meta.primaryLine) {
    const line = getBookLineByCode(meta.primaryLine);
    if (line) parts.push(line.code, line.title, line.scopeSummary);
  }
  if (meta.secondaryLines) {
    for (const code of meta.secondaryLines) {
      const line = getBookLineByCode(code);
      if (line) parts.push(line.code, line.title);
    }
  }
  if (meta.crossCuttingConcepts) {
    for (const slug of meta.crossCuttingConcepts) {
      const c = getConceptBySlug(slug);
      parts.push(slug.replace(/-/g, ' '));
      if (c) parts.push(c.label);
    }
  }
  if (meta.topicKeywords) {
    parts.push(...meta.topicKeywords);
  }
  if (meta.curriculumAnchors) {
    for (const anchor of meta.curriculumAnchors) {
      parts.push(anchor, anchor.replace(/[-_:]/g, ' '));
    }
  }
  if (meta.recommendedGrades && meta.recommendedGrades.length > 0) {
    for (const g of meta.recommendedGrades) {
      parts.push(`lớp ${g}`, `lop ${g}`);
    }
  }
  return normalizeText(parts.join(' '));
}

export function matchesEpisodeKnowledgeQuery(
  episode: Pick<Episode, 'title' | 'episodeCode' | 'categoryTag' | 'summary' | 'knowledgeMeta'>,
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return true;
  if (
    normalizeText(episode.title).includes(normalizedQuery) ||
    normalizeText(episode.episodeCode).includes(normalizedQuery) ||
    normalizeText(episode.categoryTag).includes(normalizedQuery) ||
    normalizeText(episode.summary).includes(normalizedQuery)
  ) {
    return true;
  }
  return buildKnowledgeSearchBlob(episode.knowledgeMeta).includes(normalizedQuery);
}

export function matchesBookKnowledgeQuery(
  book: Pick<Book, 'title' | 'subtitle' | 'author' | 'ageRange' | 'genreTag' | 'knowledgeMeta'> & {
    episodes?: Pick<
      Episode,
      'title' | 'episodeCode' | 'categoryTag' | 'summary' | 'knowledgeMeta'
    >[];
  },
  normalizedQuery: string
): boolean {
  if (!normalizedQuery) return true;
  if (
    normalizeText(book.title).includes(normalizedQuery) ||
    normalizeText(book.subtitle).includes(normalizedQuery) ||
    normalizeText(book.author).includes(normalizedQuery) ||
    normalizeText(book.ageRange).includes(normalizedQuery) ||
    normalizeText(book.genreTag).includes(normalizedQuery)
  ) {
    return true;
  }
  if (buildKnowledgeSearchBlob(book.knowledgeMeta).includes(normalizedQuery)) {
    return true;
  }
  if (book.episodes) {
    return book.episodes.some((ep) => matchesEpisodeKnowledgeQuery(ep, normalizedQuery));
  }
  return false;
}

export function sanitizeKnowledgeMetadata(
  raw?: Partial<KnowledgeMetadata> | null
): KnowledgeMetadata | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const primaryLine = raw.primaryLine && getBookLineByCode(raw.primaryLine) ? raw.primaryLine : undefined;
  const lineDef = primaryLine ? getBookLineByCode(primaryLine) : undefined;
  const primaryPillar = lineDef?.pillar || raw.primaryPillar;

  const secondaryLines = Array.isArray(raw.secondaryLines)
    ? Array.from(
        new Set(
          raw.secondaryLines.filter(
            (code): code is BookLineCode =>
              Boolean(getBookLineByCode(code)) && code !== primaryLine
          )
        )
      ).slice(0, 2)
    : undefined;

  const crossCuttingConcepts = Array.isArray(raw.crossCuttingConcepts)
    ? Array.from(
        new Set(
          raw.crossCuttingConcepts
            .map((s) => String(s).trim())
            .filter(Boolean)
        )
      ).slice(0, 6)
    : undefined;

  const liberalCompetencies = Array.isArray(raw.liberalCompetencies)
    ? Array.from(new Set(raw.liberalCompetencies.map((s) => String(s).trim()).filter(Boolean)))
    : undefined;

  const curriculumAnchors = Array.isArray(raw.curriculumAnchors)
    ? Array.from(
        new Set(
          raw.curriculumAnchors
            .map((s) => String(s).normalize('NFC').trim())
            .filter(Boolean)
        )
      )
    : undefined;

  const topicKeywords = Array.isArray(raw.topicKeywords)
    ? Array.from(
        new Set(
          raw.topicKeywords
            .map((s) => String(s).normalize('NFC').trim())
            .filter(Boolean)
        )
      )
    : undefined;

  const recommendedGrades = Array.isArray(raw.recommendedGrades)
    ? Array.from(
        new Set(
          raw.recommendedGrades
            .map((n) => Number(n))
            .filter((n) => Number.isInteger(n) && n >= 1 && n <= 12)
        )
      ).sort((a, b) => a - b)
    : undefined;

  const curiosityTrails = Array.isArray(raw.curiosityTrails)
    ? raw.curiosityTrails
        .filter(
          (item) =>
            item &&
            typeof item.targetEpisodeId === 'string' &&
            item.targetEpisodeId.trim() &&
            typeof item.bridgeQuestion === 'string' &&
            item.bridgeQuestion.trim()
        )
        .map((item) => ({
          targetEpisodeId: item.targetEpisodeId.trim(),
          bridgeQuestion: item.bridgeQuestion.normalize('NFC').trim()
        }))
        .slice(0, 2)
    : undefined;

  const isRecommended = raw.isRecommended === true ? true : undefined;
  const recommendedNote =
    typeof raw.recommendedNote === 'string'
      ? raw.recommendedNote.normalize('NFC').trim().slice(0, 140)
      : '';
  const recommendedOrder =
    typeof raw.recommendedOrder === 'number' &&
    Number.isInteger(raw.recommendedOrder) &&
    raw.recommendedOrder >= 0
      ? raw.recommendedOrder
      : undefined;

  const cleaned: KnowledgeMetadata = {
    ...(primaryPillar ? { primaryPillar } : {}),
    ...(primaryLine ? { primaryLine } : {}),
    ...(secondaryLines && secondaryLines.length > 0 ? { secondaryLines } : {}),
    ...(raw.audienceBand ? { audienceBand: raw.audienceBand } : {}),
    ...(recommendedGrades && recommendedGrades.length > 0 ? { recommendedGrades } : {}),
    ...(raw.listeningRhythm ? { listeningRhythm: raw.listeningRhythm } : {}),
    ...(raw.cognitiveDensity ? { cognitiveDensity: raw.cognitiveDensity } : {}),
    ...(raw.narrativeForm ? { narrativeForm: raw.narrativeForm } : {}),
    ...(crossCuttingConcepts && crossCuttingConcepts.length > 0
      ? { crossCuttingConcepts }
      : {}),
    ...(liberalCompetencies && liberalCompetencies.length > 0 ? { liberalCompetencies } : {}),
    ...(curriculumAnchors && curriculumAnchors.length > 0 ? { curriculumAnchors } : {}),
    ...(topicKeywords && topicKeywords.length > 0 ? { topicKeywords } : {}),
    ...(curiosityTrails && curiosityTrails.length > 0 ? { curiosityTrails } : {}),
    ...(isRecommended ? { isRecommended: true } : {}),
    ...(recommendedNote ? { recommendedNote } : {}),
    ...(recommendedOrder !== undefined ? { recommendedOrder } : {})
  };

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
