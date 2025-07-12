import { NextRequest, NextResponse } from 'next/server';
import { getTourismData } from '../../../../../lib/content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const content = await getTourismData(slug);
    
    if (!content) {
      return NextResponse.json(
        { error: '観光情報が見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching tourism content:', error);
    return NextResponse.json(
      { error: '観光情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
