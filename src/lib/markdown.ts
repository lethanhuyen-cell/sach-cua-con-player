import { HydratedEpisode } from './types';

export type StoryBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'divider' }
  | { type: 'image'; url: string; alt: string };

/**
 * Parses Episode Markdown into clean literary blocks per GEMINI.md Constitution:
 * - Strips redundant top # H1 / ## H2 headers that duplicate book/episode titles
 * - Extracts inline ![alt](url) images as uncaptioned 3:4 portrait blocks
 * - Never emits caption boxes or end-note boxes
 */
export function parseStoryMarkdown(markdown: string, episodeTitle?: string): StoryBlock[] {
  if (!markdown) return [];
  const normalized = markdown.normalize('NFC').replace(/\r\n/g, '\n').trim();
  const rawParagraphs = normalized.split(/\n{2,}/);
  const blocks: StoryBlock[] = [];
  let passedOpeningBody = false;

  for (const raw of rawParagraphs) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Scene divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '❦' || trimmed === '* * *') {
      if (passedOpeningBody) {
        blocks.push({ type: 'divider' });
      }
      continue;
    }

    // Standalone Markdown image ![alt](url)
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      blocks.push({
        type: 'image',
        alt: imgMatch[1]?.trim() || episodeTitle || 'Tranh minh họa truyện',
        url: imgMatch[2].trim()
      });
      passedOpeningBody = true;
      continue;
    }

    // Headings
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '').trim();
      // Skip opening redundant book/episode headers before prose begins
      if (!passedOpeningBody) {
        const upper = headingText.toUpperCase();
        if (
          upper.includes('LIM VÀ MẸ VACCI') ||
          upper.startsWith('CHƯƠNG ') ||
          upper.startsWith('TẬP ') ||
          upper.startsWith('CHUYẾN KHÁM PHÁ') ||
          (episodeTitle && upper === episodeTitle.toUpperCase())
        ) {
          continue;
        }
        // Guardrail: if an accidental >80 char paragraph was prefixed with ##, render as paragraph
        if (headingText.length > 85) {
          blocks.push({ type: 'paragraph', text: headingText });
          passedOpeningBody = true;
          continue;
        }
      }
      if (headingText.length > 85) {
        blocks.push({ type: 'paragraph', text: headingText });
      } else {
        blocks.push({ type: 'heading', text: headingText });
      }
      passedOpeningBody = true;
      continue;
    }

    // Check if paragraph contains inline image mixed with text lines
    const lines = trimmed.split('\n');
    let textBuffer: string[] = [];
    for (const line of lines) {
      const l = line.trim();
      const lineImg = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (lineImg) {
        if (textBuffer.length > 0) {
          blocks.push({ type: 'paragraph', text: textBuffer.join(' ') });
          textBuffer = [];
        }
        blocks.push({
          type: 'image',
          alt: lineImg[1]?.trim() || episodeTitle || 'Tranh minh họa truyện',
          url: lineImg[2].trim()
        });
      } else if (l) {
        textBuffer.push(l);
      }
    }
    if (textBuffer.length > 0) {
      blocks.push({ type: 'paragraph', text: textBuffer.join(' ') });
    }
    passedOpeningBody = true;
  }

  return blocks;
}

/**
 * Collects all unique 3:4 portrait illustrations for an episode in narrative order:
 * 1. Inline Markdown images in exact story order
 * 2. Any additional attached episode.illustrations not yet in Markdown
 * 3. Fallback to effectiveCoverUrl if none exist
 */
export function collectEpisodeIllustrations(episode: HydratedEpisode): { url: string; alt: string }[] {
  const seen = new Set<string>();
  const list: { url: string; alt: string }[] = [];

  const blocks = parseStoryMarkdown(episode.contentMarkdown, episode.title);
  for (const b of blocks) {
    if (b.type === 'image' && b.url && !seen.has(b.url)) {
      seen.add(b.url);
      list.push({ url: b.url, alt: b.alt });
    }
  }

  for (const ill of episode.illustrations || []) {
    if (ill.imageUrl && !seen.has(ill.imageUrl)) {
      seen.add(ill.imageUrl);
      list.push({ url: ill.imageUrl, alt: ill.altText || episode.title });
    }
  }

  if (list.length === 0 && episode.effectiveCoverUrl) {
    list.push({ url: episode.effectiveCoverUrl, alt: episode.title });
  }

  return list;
}

export function countWords(text: string): number {
  if (!text) return 0;
  const withoutImages = text.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');
  const tokens = withoutImages.trim().split(/\s+/).filter(Boolean);
  return tokens.length;
}
