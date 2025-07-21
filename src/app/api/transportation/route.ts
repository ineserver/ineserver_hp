import { NextResponse } from 'next/server';
import { getTransportationFiles } from '../../../../lib/content';

export async function GET() {
  try {
    const transportationFiles = await getTransportationFiles();
    
    // 公開されている交通情報のみをフィルター
    const publishedTransportation = transportationFiles.filter((transportation) => {
      return typeof transportation === 'object' && transportation !== null && 'published' in transportation
        ? (transportation as { published?: boolean }).published !== false
        : true;
    });
    
    return NextResponse.json(publishedTransportation);
  } catch (error) {
    console.error('Error fetching transportation content:', error);
    return NextResponse.json(
      { error: '交通情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
