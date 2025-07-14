import { NextRequest, NextResponse } from 'next/server';
import { getPatchNoteBySlug } from '@/lib/patch-notes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // CMSからパッチノートデータを取得
    const patchNote = await getPatchNoteBySlug(slug);
    
    if (!patchNote) {
      return NextResponse.json(
        { error: 'Patch note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(patchNote);
  } catch (error) {
    console.error('Error fetching patch note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patch note' },
      { status: 500 }
    );
  }
}
