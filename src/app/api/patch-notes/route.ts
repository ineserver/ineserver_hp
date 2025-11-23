import { NextRequest, NextResponse } from 'next/server';
import { getAllPatchNotes, getLatestPatchNoteLight } from '@/lib/patch-notes';

// 120秒ごとにキャッシュを再検証
export const revalidate = 120;

export async function GET(request: NextRequest) {
  try {
    // クエリパラメータの取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const latest = searchParams.get('latest') === 'true';
    
    // 最新1件のみ取得（トップページ用）
    if (latest) {
      const latestNote = getLatestPatchNoteLight();
      return NextResponse.json({
        data: latestNote ? [latestNote] : [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: latestNote ? 1 : 0,
          itemsPerPage: 1
        }
      });
    }
    
    // パッチノートデータを取得
    const allPatchNotes = await getAllPatchNotes();
    
    // ページネーション処理
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotes = allPatchNotes.slice(startIndex, endIndex);
    
    return NextResponse.json({
      data: paginatedNotes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(allPatchNotes.length / limit),
        totalItems: allPatchNotes.length,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching patch notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patch notes' },
      { status: 500 }
    );
  }
}
