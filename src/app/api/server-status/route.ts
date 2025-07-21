
import { NextRequest, NextResponse } from 'next/server';
import { ServerStatus } from '@/types/server-status';
import * as mc from 'minecraft-protocol';
import type { OldPingResult, NewPingResult } from 'minecraft-protocol';



// 内部でMinecraftサーバーに直接クエリを送信する実装
async function fetchMinecraftServerStatus(address: string): Promise<ServerStatus> {
  const startTime = Date.now();
  
  try {
    // アドレスとポートを分割
    const [host, portStr] = address.split(':');
    const port = parseInt(portStr || '25565');
    
    console.log(`Attempting to connect to Minecraft server: ${host}:${port}`);
    
    // Minecraft サーバーにpingを送信
    const response = await new Promise<OldPingResult | NewPingResult>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 10000);
      mc.ping({ host, port }, (err, result) => {
        clearTimeout(timeoutId);
        if (err) {
          reject(err);
        } else {
          resolve(result as OldPingResult | NewPingResult);
        }
      });
    });
    
    const ping = Date.now() - startTime;
    console.log(`Server ping successful in ${ping}ms:`, response);
    
    // レスポンスの構造を確認してパース
    let motd = 'Minecraft Server';
    let players = { online: 0, max: 0 };
    let version = { name: 'Unknown' };
    if (response && typeof response === 'object') {
      if ('description' in response) {
        const description = response.description;
        motd = typeof description === 'string' ? description : description?.text || 'Minecraft Server';
      }
      if ('players' in response && response.players) {
        players = response.players;
      }
      if ('version' in response && response.version) {
        if (typeof response.version === 'object' && 'name' in response.version) {
          version = { name: response.version.name };
        } else {
          version = { name: 'Unknown' };
        }
      }
    }
    return {
      online: true,
      players: {
        online: players.online || 0,
        max: players.max || 0
      },
      version: version.name || 'Unknown',
      motd: motd,
      ping: ping,
      lastChecked: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to ping Minecraft server:', error);
    
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
  const address = searchParams.get('address') || process.env.MINECRAFT_SERVER_ADDRESS || 'localhost:25565';

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
