import { NextResponse } from 'next/server';

// 300秒(5分)ごとにキャッシュを再検証
export const revalidate = 300;

// エラーコード定義
const ErrorCodes = {
  API_KEY_NOT_CONFIGURED: 'GCAL_001',
  API_TIMEOUT: 'GCAL_002',
  API_RATE_LIMIT: 'GCAL_003',
  API_AUTH_ERROR: 'GCAL_004',
  API_NOT_FOUND: 'GCAL_005',
  API_SERVER_ERROR: 'GCAL_006',
  API_UNKNOWN_ERROR: 'GCAL_007',
  ICS_FETCH_FAILED: 'GCAL_008',
  ICS_PARSE_FAILED: 'GCAL_009',
  NETWORK_ERROR: 'GCAL_010',
  JSON_PARSE_FAILED: 'GCAL_011',
} as const;

// タイムアウト付きfetch
const fetchWithTimeout = async (url: string, timeoutMs: number = 10000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// HTTPステータスコードからエラーコードを取得
const getErrorCodeFromStatus = (status: number): string => {
  if (status === 429) return ErrorCodes.API_RATE_LIMIT;
  if (status === 401 || status === 403) return ErrorCodes.API_AUTH_ERROR;
  if (status === 404) return ErrorCodes.API_NOT_FOUND;
  if (status >= 500) return ErrorCodes.API_SERVER_ERROR;
  return ErrorCodes.API_UNKNOWN_ERROR;
};

// エラーメッセージを取得
const getErrorMessage = (errorCode: string): string => {
  const messages: Record<string, string> = {
    [ErrorCodes.API_KEY_NOT_CONFIGURED]: 'APIキーが設定されていません',
    [ErrorCodes.API_TIMEOUT]: 'Googleカレンダーへの接続がタイムアウトしました',
    [ErrorCodes.API_RATE_LIMIT]: 'APIリクエスト制限に達しました。しばらく待ってから再度お試しください',
    [ErrorCodes.API_AUTH_ERROR]: 'APIの認証に失敗しました。APIキーを確認してください',
    [ErrorCodes.API_NOT_FOUND]: 'カレンダーが見つかりませんでした',
    [ErrorCodes.API_SERVER_ERROR]: 'Googleサーバーでエラーが発生しました',
    [ErrorCodes.API_UNKNOWN_ERROR]: 'カレンダーAPI接続中に不明なエラーが発生しました',
    [ErrorCodes.ICS_FETCH_FAILED]: 'ICSフィードの取得に失敗しました',
    [ErrorCodes.ICS_PARSE_FAILED]: 'ICSフィードの解析に失敗しました',
    [ErrorCodes.NETWORK_ERROR]: 'ネットワーク接続に問題があります',
    [ErrorCodes.JSON_PARSE_FAILED]: 'APIレスポンスの解析に失敗しました',
  };
  return messages[errorCode] || '不明なエラーが発生しました';
};

export async function GET() {
  const errors: Array<{ code: string; message: string; details?: string }> = [];

  try {
    // Googleカレンダーの公開フィードURL
    const calendarId = 'vqhntikal9u59a5bma9javccqg@group.calendar.google.com';
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

    // 簡易ICSパーサ（APIキーがない場合のフォールバック用）
    const parseIcs = (icsText: string) => {
      const events: Array<Record<string, string>> = [];
      const lines = icsText.split(/\r?\n/);
      let current: Record<string, string> | null = null;
      for (const rawLine of lines) {
        if (!rawLine) continue;
        // 行の継続処理 (先頭が空白の場合は前行に連結)
        if (rawLine.startsWith(' ')) {
          if (current && current.__lastKey) {
            current[current.__lastKey] = (current[current.__lastKey] || '') + rawLine.slice(1);
          }
          continue;
        }
        const line = rawLine.trim();
        if (line === 'BEGIN:VEVENT') {
          current = { __lastKey: '' } as Record<string, string>;
        } else if (line === 'END:VEVENT') {
          if (current) {
            events.push(current);
            current = null;
          }
        } else if (current) {
          const sepIndex = line.indexOf(':');
          if (sepIndex !== -1) {
            const keyPart = line.substring(0, sepIndex);
            const valuePart = line.substring(sepIndex + 1);
            // ; 以降のパラメータを除去して純粋なプロパティ名に
            const pureKey = keyPart.split(';')[0];
            current[pureKey] = valuePart;
            current.__lastKey = pureKey;
          }
        }
      }
      return events.map(e => {
        return {
          summary: e['SUMMARY'] || '',
          description: e['DESCRIPTION'] || '',
          location: e['LOCATION'] || '',
          start: e['DTSTART'] || '',
          end: e['DTEND'] || ''
        };
      });
    };

    const pickNextEvent = (events: Array<{ summary: string; description: string; location: string; start: string; end: string }>) => {
      const now = new Date();
      // DTSTARTがUTC形式(YYYYMMDDTHHMMSSZ)の場合/日付のみの場合両対応
      const parsed = events.map(ev => {
        const parseDate = (raw: string) => {
          if (!raw) return null;
          // 日付のみ (YYYYMMDD) の場合は00:00扱い
          if (/^\d{8}$/.test(raw)) {
            const y = raw.slice(0, 4); const m = raw.slice(4, 6); const d = raw.slice(6, 8);
            return new Date(`${y}-${m}-${d}T00:00:00Z`);
          }
          // 基本UTC形式
          if (/^\d{8}T\d{6}Z$/.test(raw)) {
            const y = raw.slice(0, 4); const m = raw.slice(4, 6); const d = raw.slice(6, 8);
            const hh = raw.slice(9, 11); const mm = raw.slice(11, 13); const ss = raw.slice(13, 15);
            return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
          }
          // タイムゾーン無し(ローカル扱い)
          if (/^\d{8}T\d{6}$/.test(raw)) {
            const y = raw.slice(0, 4); const m = raw.slice(4, 6); const d = raw.slice(6, 8);
            const hh = raw.slice(9, 11); const mm = raw.slice(11, 13); const ss = raw.slice(13, 15);
            return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}`);
          }
          return null;
        };
        return { ...ev, startDate: parseDate(ev.start), endDate: parseDate(ev.end) };
      }).filter(ev => ev.startDate && ev.startDate.getTime() >= now.getTime());
      // 開始日時でソート
      parsed.sort((a, b) => (a.startDate!.getTime() - b.startDate!.getTime()));
      return parsed[0];
    };

    // ICSフォールバック関数
    const tryIcsFallback = async (calendarSummary?: string): Promise<NextResponse | null> => {
      try {
        const icsUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(calendarId.replace('@', '%40'))}/public/basic.ics`;
        const icsResp = await fetchWithTimeout(icsUrl, 8000);

        if (!icsResp.ok) {
          const errorCode = getErrorCodeFromStatus(icsResp.status);
          errors.push({
            code: ErrorCodes.ICS_FETCH_FAILED,
            message: getErrorMessage(ErrorCodes.ICS_FETCH_FAILED),
            details: `HTTP ${icsResp.status} - ${errorCode}`
          });
          console.warn(`ICS fallback request failed: ${icsResp.status}`);
          return null;
        }

        const icsText = await icsResp.text();
        const icsEvents = parseIcs(icsText);
        const next = pickNextEvent(icsEvents);

        if (next) {
          return NextResponse.json({
            success: true,
            source: 'ics_fallback',
            nextMaintenance: {
              title: next.summary || calendarSummary || '定期メンテナンス',
              description: next.description || 'サーバーメンテナンスを実施いたします。この時間帯はサーバーへの接続ができません。',
              startTime: next.startDate ? next.startDate.toISOString() : '',
              endTime: next.endDate ? next.endDate.toISOString() : '',
              location: next.location || null
            },
            errors: errors.length > 0 ? errors : undefined
          });
        }
        return null;
      } catch (icsErr) {
        const isTimeout = icsErr instanceof Error && icsErr.name === 'AbortError';
        const errorCode = isTimeout ? ErrorCodes.API_TIMEOUT : ErrorCodes.ICS_PARSE_FAILED;
        errors.push({
          code: errorCode,
          message: getErrorMessage(errorCode),
          details: icsErr instanceof Error ? icsErr.message : 'Unknown error'
        });
        console.warn('ICS fallback failed:', icsErr);
        return null;
      }
    };

    // APIキーが設定されている場合のみGoogle Calendar APIを使用し、失敗時はICSフォールバック
    if (apiKey && apiKey !== 'your_google_calendar_api_key_here') {
      const now = new Date();
      const timeMin = now.toISOString();

      // 今から1ヶ月後までのイベントを取得
      const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=10`;

      let response: Response;
      let apiSucceeded = false;

      try {
        response = await fetchWithTimeout(url, 10000);

        if (!response.ok) {
          const errorText = await response.text();
          const errorCode = getErrorCodeFromStatus(response.status);
          errors.push({
            code: errorCode,
            message: getErrorMessage(errorCode),
            details: `HTTP ${response.status}: ${errorText.substring(0, 200)}`
          });
          console.error(`Calendar API error ${response.status}:`, errorText);
          // APIエラー時はICSフォールバックを試行
        } else {
          apiSucceeded = true;
        }
      } catch (fetchError) {
        const isTimeout = fetchError instanceof Error && fetchError.name === 'AbortError';
        const errorCode = isTimeout ? ErrorCodes.API_TIMEOUT : ErrorCodes.NETWORK_ERROR;
        errors.push({
          code: errorCode,
          message: getErrorMessage(errorCode),
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error'
        });
        console.error('Calendar API fetch failed:', fetchError);

        // ネットワークエラー時はICSフォールバック
        const icsFallbackResult = await tryIcsFallback();
        if (icsFallbackResult) return icsFallbackResult;

        // フォールバックも失敗した場合はデモモードチェックへ
        response = new Response(null, { status: 0 });
      }

      if (apiSucceeded) {
        interface CalendarEvent {
          summary?: string;
          description?: string;
          location?: string;
          start?: { dateTime?: string; date?: string };
          end?: { dateTime?: string; date?: string };
        }
        interface CalendarApiResponse {
          items?: CalendarEvent[];
          summary?: string;
        }
        let data: CalendarApiResponse = {};

        try {
          data = await response!.json();
        } catch {
          errors.push({
            code: ErrorCodes.JSON_PARSE_FAILED,
            message: getErrorMessage(ErrorCodes.JSON_PARSE_FAILED),
            details: 'Failed to parse Calendar API response as JSON'
          });
          console.warn('JSON parse failed, will try ICS fallback');

          // JSONパースエラー時はICSフォールバック
          const icsFallbackResult = await tryIcsFallback();
          if (icsFallbackResult) return icsFallbackResult;
        }

        // デバッグ用ログ
        console.log('Calendar data:', JSON.stringify(data, null, 2));

        // メンテナンス関連のイベントをフィルタリング
        const maintenanceEvents = Array.isArray(data.items) ? data.items.filter((event: unknown) => {
          if (typeof event !== 'object' || event === null) return false;
          const summary = 'summary' in event && typeof event.summary === 'string' ? event.summary.toLowerCase() : '';
          const description = 'description' in event && typeof event.description === 'string' ? event.description.toLowerCase() : '';
          const calendarSummary = data.summary?.toLowerCase() || '';
          return summary.includes('メンテナンス') ||
            summary.includes('maintenance') ||
            description.includes('メンテナンス') ||
            description.includes('maintenance') ||
            calendarSummary.includes('メンテナンス') ||
            calendarSummary.includes('maintenance');
        }) : [];

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
            source: 'google_api',
            nextMaintenance: {
              title: title,
              description: nextMaintenance.description || 'サーバーメンテナンスを実施いたします。この時間帯はサーバーへの接続ができません。',
              startTime,
              endTime,
              location: nextMaintenance.location || null
            }
          });
        } else {
          // APIからイベントが取得できなかった場合、ICSフォールバック
          const icsFallbackResult = await tryIcsFallback(data.summary);
          if (icsFallbackResult) return icsFallbackResult;
        }
      } else if (errors.length > 0) {
        // APIが失敗した場合、ICSフォールバックを試行
        const icsFallbackResult = await tryIcsFallback();
        if (icsFallbackResult) return icsFallbackResult;
      }
    } else {
      errors.push({
        code: ErrorCodes.API_KEY_NOT_CONFIGURED,
        message: getErrorMessage(ErrorCodes.API_KEY_NOT_CONFIGURED),
        details: 'GOOGLE_CALENDAR_API_KEY environment variable is not set or is placeholder'
      });
      console.log('Google Calendar API key not configured or using placeholder');

      // APIキーがなくてもICSフォールバックを試行
      const icsFallbackResult = await tryIcsFallback();
      if (icsFallbackResult) return icsFallbackResult;
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
        source: 'demo',
        nextMaintenance: {
          title: "定期メンテナンス（デモ）",
          description: "サーバーの安定稼働のための定期メンテナンスです。この期間中はサーバーに接続できません。",
          startTime: tomorrow.toISOString(),
          endTime: endTime.toISOString(),
          location: null
        },
        errors: errors.length > 0 ? errors : undefined
      });
    }

    // APIキーがない場合やメンテナンス予定がない場合
    return NextResponse.json({
      success: true,
      nextMaintenance: null,
      message: errors.length > 0
        ? 'カレンダー情報を取得できませんでした。直接カレンダーをご確認ください。'
        : 'メンテナンス予定はありません',
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Failed to fetch maintenance schedule:', error);

    const errorDetails = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json({
      success: false,
      nextMaintenance: null,
      message: 'メンテナンス予定の取得に失敗しました。直接カレンダーをご確認ください。',
      errors: [{
        code: ErrorCodes.API_UNKNOWN_ERROR,
        message: getErrorMessage(ErrorCodes.API_UNKNOWN_ERROR),
        details: errorDetails
      }]
    }, { status: 200 }); // 200で返してUIエラーを避ける
  }
}
