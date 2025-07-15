// サーバーステータス関連の型定義

export interface ServerStatus {
  online: boolean;
  players: {
    online: number;
    max: number;
  };
  version: string;
  motd: string;
  icon?: string;
  ping?: number;
  lastChecked: string;
}

export interface ServerStatusResponse {
  online: boolean;
  players?: {
    online: number;
    max: number;
  };
  version?: string;
  motd?: {
    raw?: string[];
    clean?: string[];
  };
  icon?: string;
  debug?: {
    ping?: boolean;
    query?: boolean;
    srv?: boolean;
    error?: {
      ping?: string;
      query?: string;
    };
  };
}

export interface ServerStatusError {
  error: string;
  message: string;
  timestamp: string;
}

export type ServerStatusApiResponse = ServerStatus | ServerStatusError;
