// プロトコルバージョンからMinecraftバージョンへのマッピング
// https://wiki.vg/Protocol_version_numbers より

interface VersionInfo {
  version: string;
  protocol: number;
  releaseDate?: string;
  isSupported: boolean;
}

export const MINECRAFT_VERSIONS: VersionInfo[] = [
  // 最新版から順に
  { version: '1.21.6', protocol: 771, releaseDate: '2024-12-11', isSupported: true },
  { version: '1.21.5', protocol: 770, releaseDate: '2024-12-03', isSupported: true },
  { version: '1.21.4', protocol: 768, releaseDate: '2024-12-03', isSupported: true },
  { version: '1.21.3', protocol: 768, releaseDate: '2024-10-23', isSupported: true },
  { version: '1.21.2', protocol: 768, releaseDate: '2024-10-23', isSupported: true },
  { version: '1.21.1', protocol: 767, releaseDate: '2024-08-08', isSupported: true },
  { version: '1.21', protocol: 767, releaseDate: '2024-06-13', isSupported: true },
  { version: '1.20.6', protocol: 766, releaseDate: '2024-04-29', isSupported: true },
  { version: '1.20.5', protocol: 766, releaseDate: '2024-04-23', isSupported: true },
  { version: '1.20.4', protocol: 765, releaseDate: '2023-12-07', isSupported: true },
  { version: '1.20.3', protocol: 765, releaseDate: '2023-12-05', isSupported: true },
  { version: '1.20.2', protocol: 764, releaseDate: '2023-09-21', isSupported: true },
  { version: '1.20.1', protocol: 763, releaseDate: '2023-06-12', isSupported: true },
  { version: '1.20', protocol: 763, releaseDate: '2023-06-07', isSupported: true },
  { version: '1.19.4', protocol: 762, releaseDate: '2023-03-14', isSupported: false },
  { version: '1.19.3', protocol: 761, releaseDate: '2022-12-07', isSupported: false },
  { version: '1.19.2', protocol: 760, releaseDate: '2022-08-05', isSupported: false },
  { version: '1.19.1', protocol: 760, releaseDate: '2022-07-27', isSupported: false },
  { version: '1.19', protocol: 759, releaseDate: '2022-06-07', isSupported: false },
  { version: '1.18.2', protocol: 758, releaseDate: '2022-02-28', isSupported: false },
  { version: '1.18.1', protocol: 757, releaseDate: '2021-12-10', isSupported: false },
  { version: '1.18', protocol: 757, releaseDate: '2021-11-30', isSupported: false },
];

/**
 * プロトコルバージョンから対応するMinecraftバージョンを取得
 */
export function getMinecraftVersionFromProtocol(protocol: number): VersionInfo | null {
  return MINECRAFT_VERSIONS.find(v => v.protocol === protocol) || null;
}

/**
 * プロトコルバージョンから推奨バージョンを取得
 * サーバーのプロトコルバージョンに対応する最新のサポート版を返す
 */
export function getRecommendedVersion(protocol: number): VersionInfo | null {
  const serverVersion = getMinecraftVersionFromProtocol(protocol);
  if (!serverVersion) {
    // 不明なプロトコルバージョンの場合は最新のサポート版を返す
    return MINECRAFT_VERSIONS.find(v => v.isSupported) || null;
  }
  
  // サーバーバージョンがサポート対象の場合はそのまま返す
  if (serverVersion.isSupported) {
    return serverVersion;
  }
  
  // サーバーバージョンがサポート対象外の場合は、
  // より新しいサポート版のうち最も古いものを推奨
  const newerSupportedVersions = MINECRAFT_VERSIONS.filter(v => 
    v.isSupported && v.protocol >= protocol
  ).sort((a, b) => a.protocol - b.protocol);
  
  return newerSupportedVersions[0] || MINECRAFT_VERSIONS.find(v => v.isSupported) || null;
}

/**
 * 現在のサポートされているバージョンの範囲を取得
 */
export function getSupportedVersionRange(): { min: VersionInfo; max: VersionInfo } | null {
  const supportedVersions = MINECRAFT_VERSIONS.filter(v => v.isSupported);
  if (supportedVersions.length === 0) return null;
  
  const sortedByProtocol = supportedVersions.sort((a, b) => a.protocol - b.protocol);
  return {
    min: sortedByProtocol[0],
    max: sortedByProtocol[sortedByProtocol.length - 1]
  };
}

/**
 * バージョン範囲文字列（例: "1.21.3-1.21.7"）を解析する
 */
export function parseVersionRange(versionString: string): { min: string; max: string } | null {
  const rangeMatch = versionString.match(/^(\d+\.\d+(?:\.\d+)?)-(\d+\.\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    return {
      min: rangeMatch[1],
      max: rangeMatch[2]
    };
  }
  return null;
}

/**
 * バージョン範囲から最適な推奨バージョンを取得
 */
export function getRecommendedVersionFromRange(versionString: string, protocol: number): VersionInfo | null {
  const range = parseVersionRange(versionString);
  
  if (range) {
    // バージョン範囲が指定されている場合、その範囲内で最も安定した推奨バージョンを選択
    const rangeVersions = MINECRAFT_VERSIONS.filter(v => {
      const versionNum = parseVersionNumber(v.version);
      const minNum = parseVersionNumber(range.min);
      const maxNum = parseVersionNumber(range.max);
      return versionNum >= minNum && versionNum <= maxNum && v.isSupported;
    });
    
    // 範囲内で最も安定したバージョン（通常は範囲の中間あたり）を推奨
    if (rangeVersions.length > 0) {
      // 1.21.4を優先的に推奨（LTS的な位置づけ）
      const preferredVersion = rangeVersions.find(v => v.version === '1.21.4');
      if (preferredVersion) {
        return preferredVersion;
      }
      
      // 1.21.4がない場合は、範囲内の最新安定版
      return rangeVersions[0];
    }
  }
  
  // フォールバック: プロトコルベースの推奨
  return getRecommendedVersion(protocol);
}

/**
 * バージョン文字列を数値に変換（比較用）
 */
function parseVersionNumber(version: string): number {
  const parts = version.split('.').map(Number);
  return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}
