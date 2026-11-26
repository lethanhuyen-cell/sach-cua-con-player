import React from 'react';
import { notFound } from 'next/navigation';
import { getPublishedLibrary } from '@/lib/repository';
import { getHallBySlug, LIBRARY_HALLS, resolveBookHalls } from '@/lib/halls';
import { HallShelfClient } from '@/components/HallShelfClient';

export const dynamic = 'force-dynamic';

export default async function HallDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hall = getHallBySlug(slug);
  if (!hall) {
    notFound();
  }

  const allBooks = await getPublishedLibrary();
  const booksInHall = allBooks.filter((b) =>
    resolveBookHalls(b).some((h) => h.slug === hall.slug)
  );
  const litHallSlugs = LIBRARY_HALLS.filter((h) =>
    allBooks.some((b) => resolveBookHalls(b).some((bh) => bh.slug === h.slug))
  ).map((h) => h.slug);

  return (
    <HallShelfClient
      hall={hall}
      booksInHall={booksInHall}
      litHallSlugs={litHallSlugs}
    />
  );
}
