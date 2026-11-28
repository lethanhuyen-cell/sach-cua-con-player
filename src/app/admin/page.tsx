import React from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAdminLibrary } from '@/lib/repository';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect('/admin/login');
  }

  const data = await getAdminLibrary();
  return (
    <AdminDashboardClient
      activeBooks={data.activeBooks}
      trashedBooks={data.trashedBooks}
      trashedEpisodes={data.trashedEpisodes}
      voiceProfiles={data.voiceProfiles}
    />
  );
}
