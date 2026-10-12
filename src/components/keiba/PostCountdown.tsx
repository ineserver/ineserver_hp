'use client';

import { useEffect, useState } from 'react';
import { postDateTime, type Race } from '@/lib/keiba';

// 発走までの残り時間（サーバーとブラウザで時刻がずれるので、表示はマウント後だけ）
export default function PostCountdown({
  race,
  className = '',
}: {
  race: Pick<Race, 'date' | 'postTime' | 'status'>;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const post = postDateTime(race);
  if (now == null || !post || (race.status !== 'ENTRY' && race.status !== 'BETTING')) return null;

  const diff = Math.floor((post.getTime() - now) / 1000);
  if (diff <= 0) {
    return <span className={className}>まもなく発走</span>;
  }
  const days = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className={className}>
      発走まで{' '}
      <span className="font-bold tabular-nums">
        {days > 0 ? `${days}日 ` : ''}{pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </span>
  );
}
