
import { NextRequest, NextResponse } from 'next/server';
import { ServerStatus } from '@/types/server-status';
import * as net from 'net';

// 30秒ごとにキャッシュを再検証（サーバーステータスは頻繁に変わる可能性があるため短めに設定）
export const revalidate = 30;

// Minecraft Server List Ping (SLNP)プロトコルを使用してサーバーステータスを取得
async function fetchMinecraftServerStatus(address: string): Promise<ServerStatus> {
  const startTime = Date.now();

  try {
    // アドレスとポートを分割
    const [host, portStr] = address.split(':');
    const port = parseInt(portStr || '25565', 10);

    console.log(`Fetching server status directly: ${host}:${port}`);

    // サーバーへのTCP接続を確立してステータスを取得
    const serverData = await pingMinecraftServer(host, port, 5000);
    const ping = Date.now() - startTime;

    console.log(`Server responded in ${ping}ms:`, serverData);

    return {
      online: true,
      players: {
        online: serverData.players.online,
        max: serverData.players.max
      },
      version: serverData.version.name,
      protocol: serverData.version.protocol,
      motd: serverData.description,
      ping: ping,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Server status check failed for ${address}: ${errorMessage}`);

    // エラー時はオフライン状態を返す
    return {
      online: false,
      players: {
        online: 0,
        max: 0
      },
      version: 'Unknown',
      protocol: undefined,
      motd: 'Connection Failed',
      ping: Date.now() - startTime,
      lastChecked: new Date().toISOString()
    };
  }
}

// Minecraft Server List Pingプロトコルの実装
interface MinecraftServerResponse {
  version: { name: string; protocol: number };
  players: { online: number; max: number };
  description: string;
  favicon?: string;
}

function pingMinecraftServer(host: string, port: number, timeout: number): Promise<MinecraftServerResponse> {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout });
    const timeoutId = setTimeout(() => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    }, timeout);

    let buffer = Buffer.alloc(0);

    socket.on('connect', () => {
      try {
        // Handshakeパケットの構築
        const handshake = createHandshakePacket(host, port);
        socket.write(handshake);

        // Statusリクエストパケット
        const statusRequest = Buffer.from([0x01, 0x00]);
        socket.write(statusRequest);
      } catch (err) {
        clearTimeout(timeoutId);
        socket.destroy();
        reject(err);
      }
    });

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data]);

      try {
        // パケット長を読み取り
        if (buffer.length < 5) return;

        const { value: packetLength, length: lengthBytes } = readVarInt(buffer);

        if (buffer.length < lengthBytes + packetLength) return;

        // パケットIDをスキップ
        const { length: idBytes } = readVarInt(buffer.slice(lengthBytes));

        // JSON文字列長を読み取り
        const jsonStart = lengthBytes + idBytes;
        const { value: jsonLength, length: jsonLengthBytes } = readVarInt(buffer.slice(jsonStart));

        // JSON文字列を抽出
        const jsonStart2 = jsonStart + jsonLengthBytes;
        const jsonString = buffer.slice(jsonStart2, jsonStart2 + jsonLength).toString('utf8');

        clearTimeout(timeoutId);
        socket.destroy();

        const response = JSON.parse(jsonString);

        // MOTDの処理
        let motdText = 'Minecraft Server';
        if (typeof response.description === 'string') {
          motdText = response.description;
        } else if (typeof response.description === 'object' && response.description.text) {
          motdText = response.description.text;
        }

        resolve({
          version: response.version,
          players: response.players,
          description: motdText,
          favicon: response.favicon
        });
      } catch {
        // まだデータが不完全な場合は待機
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeoutId);
      socket.destroy();
      reject(err);
    });

    socket.on('timeout', () => {
      clearTimeout(timeoutId);
      socket.destroy();
      reject(new Error('Socket timeout'));
    });
  });
}

// VarIntを作成
function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  do {
    let temp = value & 0x7F;
    value >>>= 7;
    if (value !== 0) {
      temp |= 0x80;
    }
    bytes.push(temp);
  } while (value !== 0);
  return Buffer.from(bytes);
}

// VarIntを読み取り
function readVarInt(buffer: Buffer): { value: number; length: number } {
  let numRead = 0;
  let result = 0;
  let read: number;

  do {
    if (numRead >= buffer.length) {
      throw new Error('VarInt is too big');
    }
    read = buffer[numRead];
    const value = read & 0x7F;
    result |= value << (7 * numRead);
    numRead++;
    if (numRead > 5) {
      throw new Error('VarInt is too big');
    }
  } while ((read & 0x80) !== 0);

  return { value: result, length: numRead };
}

// Handshakeパケットを作成
function createHandshakePacket(host: string, port: number): Buffer {
  const protocolVersion = writeVarInt(47); // Protocol version (1.8.x)
  const hostBuffer = Buffer.from(host, 'utf8');
  const hostLength = writeVarInt(hostBuffer.length);
  const portBuffer = Buffer.alloc(2);
  portBuffer.writeUInt16BE(port, 0);
  const nextState = writeVarInt(1); // Status

  const dataLength =
    protocolVersion.length +
    hostLength.length +
    hostBuffer.length +
    2 + // port
    nextState.length;

  const packetId = Buffer.from([0x00]);
  const packetLength = writeVarInt(packetId.length + dataLength);

  return Buffer.concat([
    packetLength,
    packetId,
    protocolVersion,
    hostLength,
    hostBuffer,
    portBuffer,
    nextState
  ]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address') || process.env.MINECRAFT_SERVER_ADDRESS || '127.0.0.1';

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
      protocol: undefined,
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
