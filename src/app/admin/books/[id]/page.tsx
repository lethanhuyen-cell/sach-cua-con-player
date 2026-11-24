import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAdminLibrary } from '@/lib/repository';
import { AdminBookEditorClient } from '@/components/AdminBookEditorClient';

export const dynamic = 'force-dynamic';

export default async function AdminBookEditorPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const { id } = await params;
  if (id === 'new') {
    return <AdminBookEditorClient initialBook={null} />;
  }

  const { activeBooks } = await getAdminLibrary();
  const book = activeBooks.find((b) => b.id === id);
  if (!book) {
    notFound();
  }

  return <AdminBookEditorClient initialBook={book} />;
}
