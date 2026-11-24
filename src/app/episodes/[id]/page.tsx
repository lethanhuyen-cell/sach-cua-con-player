import React from 'react';
import { notFound } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getEpisodeWithContext } from '@/lib/repository';
import { EpisodeReaderClient } from '@/components/EpisodeReaderClient';

export const dynamic = 'force-dynamic';

export default async function EpisodeReaderPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const wantsPreview = sp?.preview === '1';
  const allowUnpublished = wantsPreview && (await isAdminAuthenticated());

  const ctx = await getEpisodeWithContext(id, allowUnpublished);
  if (!ctx) {
    notFound();
  }

  const isDraftPreview =
    ctx.episode.status !== 'published' || ctx.book.status !== 'published';

  return (
    <EpisodeReaderClient
      book={ctx.book}
      episode={ctx.episode}
      prevEpisode={ctx.prevEpisode}
      nextEpisode={ctx.nextEpisode}
      isPreview={isDraftPreview}
    />
  );
}
