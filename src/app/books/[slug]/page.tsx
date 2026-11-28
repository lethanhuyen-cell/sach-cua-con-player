import React from 'react';
import { notFound } from 'next/navigation';
import { getPublishedLibrary } from '@/lib/repository';
import { BookDetailClient } from '@/components/library/BookDetailClient';

export const dynamic = 'force-dynamic';

export default async function BookDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const books = await getPublishedLibrary();
  const book = books.find((b) => b.slug === slug);

  if (!book) {
    notFound();
  }

  return <BookDetailClient book={book} />;
}
