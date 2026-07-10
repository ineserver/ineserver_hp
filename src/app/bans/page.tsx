import type { Metadata } from "next";
import Header from "@/components/Header";
import BansPageClient from "@/components/BansPageClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "処罰リスト",
  description:
    "いねさばの処罰リスト（BANリスト）です。サーバールールに違反したプレイヤーの処罰履歴を確認できます。",
};

type BanRecordRaw = {
  id: number;
  type: number;
  reason: string;
  start: number;
  end: number;
  operator_uuid: string;
  victim_name: string | null;
  victim_uuid: string;
  is_active: boolean;
  status: string;
};

export type BanRecordResolved = BanRecordRaw & {
  victim_mcid: string;
  operator_mcid: string;
};

// Mojang API でUUIDからMCID（ユーザー名）を取得
async function resolveUuidToName(uuid: string): Promise<string | null> {
  // コンソール実行の場合
  const consoleUuids = [
    "00000000-0000-0000-0000-000000000000",
  ];
  if (consoleUuids.includes(uuid)) return "CONSOLE";

  try {
    // Mojang APIはハイフン無しUUIDを受け入れる
    const cleanUuid = uuid.replace(/-/g, "");
    const res = await fetch(
      `https://sessionserver.mojang.com/session/minecraft/profile/${cleanUuid}`,
      { next: { revalidate: 3600 } } // 1時間キャッシュ
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.name ?? null;
  } catch {
    return null;
  }
}

async function fetchBans(): Promise<BanRecordResolved[]> {
  try {
    const res = await fetch("https://api.1necat.net/bans", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const rawBans: BanRecordRaw[] = await res.json();

    // ユニークなUUIDを集めてまとめて解決
    const allUuids = new Set<string>();
    for (const ban of rawBans) {
      allUuids.add(ban.victim_uuid);
      allUuids.add(ban.operator_uuid);
    }

    const nameMap = new Map<string, string>();
    await Promise.all(
      Array.from(allUuids).map(async (uuid) => {
        const name = await resolveUuidToName(uuid);
        if (name) nameMap.set(uuid, name);
      })
    );

    return rawBans.map((ban) => ({
      ...ban,
      victim_mcid:
        ban.victim_name ??
        nameMap.get(ban.victim_uuid) ??
        "Unknown",
      operator_mcid:
        nameMap.get(ban.operator_uuid) ?? "CONSOLE",
    }));
  } catch {
    return [];
  }
}

export default async function BansPage() {
  const bans = await fetchBans();

  return (
    <>
      <Header />
      <div className="flex-grow bg-white">
        <BansPageClient bans={bans} />
      </div>
    </>
  );
}
