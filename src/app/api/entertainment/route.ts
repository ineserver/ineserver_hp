import { NextResponse } from 'next/server';
import { getEntertainmentFiles } from '../../../../lib/content';

export async function GET() {
  try {
    const entertainmentFiles = await getEntertainmentFiles();
    
    // 公開されているエンターテインメント情報のみをフィルター
    const publishedEntertainment = entertainmentFiles.filter((entertainment) => {
      return typeof entertainment === 'object' && entertainment !== null && 'published' in entertainment
        ? (entertainment as { published?: boolean }).published !== false
        : true;
    });
    
    return NextResponse.json(publishedEntertainment);
  } catch (error) {
    console.error('Error fetching entertainment content:', error);
    return NextResponse.json(
      { error: 'エンターテインメント情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
