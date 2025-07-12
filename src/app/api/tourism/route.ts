import { NextResponse } from 'next/server';
import { getTourismFiles } from '../../../../lib/content';

export async function GET() {
  try {
    const tourismFiles = await getTourismFiles();
    
    // 公開されている観光情報のみをフィルター
    const publishedTourism = tourismFiles.filter((tourism: any) => 
      tourism.published !== false
    );
    
    return NextResponse.json(publishedTourism);
  } catch (error) {
    console.error('Error fetching tourism content:', error);
    return NextResponse.json(
      { error: '観光情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}
