import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.accessToken) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const limit = searchParams.get('limit') ?? '10';

    const upstreamUrl = `${API_BASE_URL}/items/forms?search=${encodeURIComponent(search)}&limit=${encodeURIComponent(limit)}`;
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.user.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return NextResponse.json({ error: 'UPSTREAM_ERROR', detail: text }, { status: upstream.status });
    }

    const data = await upstream.json();
    const items: string[] = Array.isArray(data?.items) ? data.items : [];
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error in /api/items/forms:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}


