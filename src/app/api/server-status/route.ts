
import { NextRequest, NextResponse } from 'next/server';
import { ServerStatus } from '@/types/server-status';

// mcsrvstat.us APIのレスポンス型
interface McSrvStatResponse {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  protocol?: number;
  players?: {
    online: number;
    max: number;
    list?: string[];
  };
  motd?: {
    raw?: string;
    clean?: string;
    html?: string;
  };
  icon?: string;
  software?: string;
  debug?: {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachetime: number;
    cacheexpire: number;
    apiversion: number;
  };
}

// mcsrvstat.us APIを使用してMinecraftサーバーの状態を取得
async function fetchMinecraftServerStatus(address: string): Promise<ServerStatus> {
  const startTime = Date.now();
  
  try {
    // アドレスとポートを分割
    const [host, portStr] = address.split(':');
    const port = portStr || '25565';
    
    // mcsrvstat.us APIのエンドポイント
    const apiUrl = `https://api.mcsrvstat.us/3/${host}:${port}`;
    
    console.log(`Fetching server status from mcsrvstat.us: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'ineserver-hp/1.0',
      },
      // 10秒のタイムアウト
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: McSrvStatResponse = await response.json();
    const ping = Date.now() - startTime;
    
    console.log(`mcsrvstat.us API response in ${ping}ms:`, data);
    
    return {
      online: data.online,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 0
      },
      version: data.version || 'Unknown',
      motd: data.motd?.clean || data.motd?.raw || 'Minecraft Server',
      ping: ping,
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to fetch server status from mcsrvstat.us:', error);
    
    // エラー時はオフライン状態を返す
    return {
      online: false,
      players: {
        online: 0,
        max: 0
      },
      version: 'Unknown',
      motd: 'Connection Failed',
      ping: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || process.env.MINECRAFT_SERVER_ADDRESS || '1necat.net';

  try {
    const status = await fetchMinecraftServerStatus(address);
    
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in server-status API:', error);
    
    return NextResponse.json({
      online: false,
      players: { online: 0, max: 0 },
      version: 'Unknown',
      motd: 'API Error',
      ping: 0,
      lastChecked: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
