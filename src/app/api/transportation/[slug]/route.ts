import { NextRequest, NextResponse } from 'next/server';
import { getTransportationData } from '../../../../../lib/content';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const content = await getTransportationData(slug);
    
    if (!content) {
      return NextResponse.json(
        { error: '交通情報が見つかりません' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching transportation content:', error);
    return NextResponse.json(
      { error: '交通情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
