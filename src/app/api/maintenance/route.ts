import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Googleカレンダーの公開フィードURL
    const calendarId = 'vqhntikal9u59a5bma9javccqg@group.calendar.google.com';
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    
    // APIキーが設定されている場合のみGoogle Calendar APIを使用
    if (apiKey && apiKey !== 'your_google_calendar_api_key_here') {
      const now = new Date();
      const timeMin = now.toISOString();
      
      // 今から1ヶ月後までのイベントを取得
      const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=10`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Calendar API error ${response.status}:`, errorText);
        
        // APIエラーの場合はフォールバックして継続
        return NextResponse.json({
          success: true,
          nextMaintenance: null,
          message: 'カレンダー情報を取得できませんでした。直接カレンダーをご確認ください。'
        });
      }
      
      const data = await response.json();
      
      // デバッグ用ログ
      console.log('Calendar data:', JSON.stringify(data, null, 2));
      
      // メンテナンス関連のイベントをフィルタリング
      const maintenanceEvents = data.items?.filter((event: any) => {
        const summary = event.summary?.toLowerCase() || '';
        const description = event.description?.toLowerCase() || '';
        // カレンダー名に「メンテナンス」が含まれる場合は全てのイベントを対象とする
        const calendarSummary = data.summary?.toLowerCase() || '';
        return summary.includes('メンテナンス') || 
               summary.includes('maintenance') || 
               description.includes('メンテナンス') || 
               description.includes('maintenance') ||
               calendarSummary.includes('メンテナンス') ||
               calendarSummary.includes('maintenance');
      });
      
      // 最も近い予定を取得
      const nextMaintenance = maintenanceEvents?.[0];
      
      if (nextMaintenance) {
        // デバッグ用ログ
        console.log('Next maintenance event:', JSON.stringify(nextMaintenance, null, 2));
        
        const startTime = nextMaintenance.start?.dateTime || nextMaintenance.start?.date;
        const endTime = nextMaintenance.end?.dateTime || nextMaintenance.end?.date;
        
        // カレンダーの権限がfreeBusyReaderのため、イベントのsummaryが取得できない
        // カレンダー名を使用するか、デフォルトの名前を設定
        const title = nextMaintenance.summary || data.summary || '定期メンテナンス';
        
        return NextResponse.json({
          success: true,
          nextMaintenance: {
            title: title,
            description: nextMaintenance.description || 'サーバーメンテナンスを実施いたします。この時間帯はサーバーへの接続ができません。',
            startTime,
            endTime,
            location: nextMaintenance.location || null
          }
        });
      }
    } else {
      console.log('Google Calendar API key not configured or using placeholder');
    }
    
    // テスト用: デモデータを含める（本番環境では削除）
    const isDemoMode = process.env.NODE_ENV === 'development' && 
                      (process.env.DEMO_MAINTENANCE === 'true' || !apiKey || apiKey === 'your_google_calendar_api_key_here');
    
    if (isDemoMode) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // 明日の午前2時
      
      const endTime = new Date(tomorrow);
      endTime.setHours(5, 0, 0, 0); // 午前5時まで
      
      return NextResponse.json({
        success: true,
        nextMaintenance: {
          title: "定期メンテナンス（デモ）",
          description: "サーバーの安定稼働のための定期メンテナンスです。この期間中はサーバーに接続できません。",
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString(),
          location: null
        }
      });
    }
    
    // APIキーがない場合やメンテナンス予定がない場合
    return NextResponse.json({
      success: true,
      nextMaintenance: null,
      message: apiKey ? 'メンテナンス予定はありません' : 'カレンダー情報を取得できませんでした。直接カレンダーをご確認ください。'
    });
    
  } catch (error) {
    console.error('Failed to fetch maintenance schedule:', error);
    
    return NextResponse.json({
      success: true, // UIエラーを避けるためtrueのまま
      nextMaintenance: null,
      message: 'メンテナンス予定の取得に失敗しました。直接カレンダーをご確認ください。'
    }, { status: 200 }); // 200で返してUIエラーを避ける
  }
}
