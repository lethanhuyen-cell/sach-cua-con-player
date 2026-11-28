import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import {
  CuratedRecommendationPatch,
  saveCuratedRecommendations
} from '@/lib/repository';

function normalizePatchList(raw: unknown): CuratedRecommendationPatch[] {
  if (!Array.isArray(raw)) return [];
  const items: CuratedRecommendationPatch[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const obj = entry as Record<string, unknown>;
    const id = typeof obj.id === 'string' ? obj.id.trim() : '';
    if (!id) continue;
    items.push({
      id,
      isRecommended: Boolean(obj.isRecommended),
      recommendedNote:
        typeof obj.recommendedNote === 'string' ? obj.recommendedNote : undefined,
      recommendedOrder:
        typeof obj.recommendedOrder === 'number' && Number.isInteger(obj.recommendedOrder)
          ? obj.recommendedOrder
          : undefined
    });
  }
  return items;
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Chưa xác thực quyền quản trị.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const books = normalizePatchList(body?.books);
    const episodes = normalizePatchList(body?.episodes);

    const result = await saveCuratedRecommendations({ books, episodes });

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/halls/[slug]', 'page');
    revalidatePath('/admin');

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Không thể lưu thiết lập kệ gợi ý.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
