import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAdminLibrary } from '@/lib/repository';
import { AdminEpisodeEditorClient } from '@/components/AdminEpisodeEditorClient';

export const dynamic = 'force-dynamic';

export default async function AdminEpisodeEditorPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ bookId?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const sp = await searchParams;

  const { activeBooks, voiceProfiles } = await getAdminLibrary();
  if (activeBooks.length === 0) {
    redirect('/admin/books/new');
  }

  if (id === 'new') {
    const defaultBookId =
      activeBooks.find((b) => b.id === sp?.bookId)?.id || activeBooks[0].id;
    return (
      <AdminEpisodeEditorClient
        books={activeBooks}
        voiceProfiles={voiceProfiles}
        initialEpisode={null}
        defaultBookId={defaultBookId}
      />
    );
  }

  let foundEpisode = null;
  let ownerBookId = activeBooks[0].id;
  for (const b of activeBooks) {
    const ep = b.episodes.find((e) => e.id === id);
    if (ep) {
      foundEpisode = ep;
      ownerBookId = b.id;
      break;
    }
  }

  if (!foundEpisode) {
    notFound();
  }

  return (
    <AdminEpisodeEditorClient
      books={activeBooks}
      voiceProfiles={voiceProfiles}
      initialEpisode={foundEpisode}
      defaultBookId={ownerBookId}
    />
  );
}
