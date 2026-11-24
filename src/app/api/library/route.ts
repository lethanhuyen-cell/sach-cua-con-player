import { NextResponse } from 'next/server';
import { getPublishedLibrary } from '@/lib/repository';

export const dynamic = 'force-dynamic';

export async function GET() {
  const books = await getPublishedLibrary();
  return NextResponse.json({ books });
}
