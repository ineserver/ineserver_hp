'use client';

import { useState, type ReactNode } from 'react';
import { formatOdds, frameOf, type QuinellaOdds, type WinOdds } from '@/lib/keiba';
import { EmptyState, GateBox, SectionTitle, rankClass } from './KeibaParts';
import { MarkText, isPicked, type MarkMap } from './Marks';
import { oddsClass } from './EntryTable';

export interface OddsHorse {
  gate: number;
  name: string;
  uuid: string | null;
  excluded: boolean;
}

export const pairKey = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

// 馬券は100ine単位で買う
const UNIT = 100;
const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
const ine = (value: number) => `${value.toLocaleString('ja-JP')} ine`;

// 合成オッズ: 買い目のどれが当たっても払戻が同じになるように買い分けたときの倍率
function compositeOdds(odds: number[]): number | null {
  if (odds.length === 0) return null;
  return 1 / sum(odds.map(o => 1 / o));
}

// 予算の中で、どれが当たっても払戻ができるだけ同じになるように100ine単位で配分する
//   払戻の目標を二分探索で上げていき、収まる買い方にしたあと、余りを払戻が少ない買い目から足す
function allocate(odds: number[], budget: number): number[] | null {
  if (odds.length === 0 || budget < UNIT * odds.length) return null;
  const stakesFor = (target: number) => odds.map(o => Math.max(UNIT, Math.ceil(target / o / UNIT) * UNIT));
  let low = 0;
  let high = budget * Math.max(...odds);
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    if (sum(stakesFor(mid)) <= budget) low = mid;
    else high = mid;
  }
  const stakes = stakesFor(low);
  let rest = budget - sum(stakes);
  while (rest >= UNIT) {
    let weakest = 0;
    stakes.forEach((s, i) => {
      if (s * odds[i] < stakes[weakest] * odds[weakest]) weakest = i;
    });
    stakes[weakest] += UNIT;
    rest -= UNIT;
  }
  return stakes;
}

const payoutOf = (stake: number, odds: number) => Math.floor(stake * odds);

interface BetRow {
  key: string;
  label: ReactNode;
  odds: number | null;
  popularity: number | null;
}

// 1つの券種（単勝・馬連）の買い目。予算から自動で配分し、買い目ごとにも直せる（馬券の画面と同じ）
function BetBlock({ title, color, rows }: { title: string; color: string; rows: BetRow[] }) {
  const priced = rows.filter((r): r is BetRow & { odds: number } => r.odds != null && r.odds > 0);
  const [budgetText, setBudgetText] = useState(() => String(Math.max(1000, rows.length * UNIT)));
  // 買い目ごとの枚数（100ine が何枚か）
  const [units, setUnits] = useState<Record<string, number>>({});

  const allocateUnits = (budget: number): Record<string, number> | null => {
    const stakes = Number.isFinite(budget) ? allocate(priced.map(r => r.odds), Math.floor(budget)) : null;
    return stakes ? Object.fromEntries(priced.map((r, i) => [r.key, stakes[i] / UNIT])) : null;
  };

  // 印を付け替えて買い目が変わったときは、予算で配り直す（オッズの更新では配り直さない）。
  // 予算が空欄（買い目ごとに直している）なら、それまでの金額はそのままにする
  const pricedKeys = priced.map(r => r.key).join(',');
  const [allocatedFor, setAllocatedFor] = useState<string | null>(null);
  if (allocatedFor !== pricedKeys) {
    setAllocatedFor(pricedKeys);
    const next = budgetText === '' ? null : allocateUnits(Number(budgetText));
    setUnits(prev => next ?? prev);
  }

  const changeBudget = (text: string) => {
    setBudgetText(text);
    const next = allocateUnits(Number(text));
    if (next) setUnits(next);
  };
  // 買い目ごとに直したら、予算の配分とは合わなくなるので予算を空欄にする
  const changeUnits = (key: string, text: string) => {
    const n = Math.floor(Number(text));
    setUnits(prev => ({ ...prev, [key]: Number.isFinite(n) && n > 0 ? n : 0 }));
    setBudgetText('');
  };

  const stakeOf = (key: string) => (units[key] ?? 0) * UNIT;
  const total = sum(rows.map(r => stakeOf(r.key)));
  const bought = priced.filter(r => stakeOf(r.key) > 0);
  const payouts = bought.map(r => payoutOf(stakeOf(r.key), r.odds));
  const minPayout = payouts.length ? Math.min(...payouts) : 0;
  const maxPayout = payouts.length ? Math.max(...payouts) : 0;
  const composite = compositeOdds((bought.length ? bought : priced).map(r => r.odds));
  const budgetShort = budgetText !== '' && priced.length > 0 && !(Number(budgetText) >= priced.length * UNIT);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden self-start">
      <div className="px-3 py-2 text-sm font-bold text-white" style={{ background: color }}>{title}</div>

      {/* 予算から自動で配分 */}
      <div className="px-3 py-2.5 bg-[#f4f7f5] border-b border-gray-200 text-sm">
        <label className="flex items-center justify-between gap-3">
          <span className="text-gray-600">予算で配分</span>
          <span className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="numeric"
              min={UNIT}
              step={UNIT}
              value={budgetText}
              onChange={e => changeBudget(e.target.value)}
              className="w-28 px-2 py-1 text-right tabular-nums border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064]"
            />
            <span className="text-gray-600">ine</span>
          </span>
        </label>
        <p className="text-[11px] text-gray-500 mt-1">
          {budgetText === ''
            ? '買い目ごとに直した金額で計算しています。予算を入れると、全部の買い目を配分し直します。'
            : budgetShort
              ? `予算は1点${UNIT} ineとして、${ine(priced.length * UNIT)}以上にしてください。`
              : 'どれが当たっても払戻ができるだけ同じになるように配分します。配分したあと、買い目ごとに直せます。'}
        </p>
      </div>

      {/* 買い目 */}
      <ul>
        {rows.map(r => {
          const stake = stakeOf(r.key);
          const payout = r.odds != null ? payoutOf(stake, r.odds) : null;
          const profit = payout != null && total > 0 ? payout - total : null;
          return (
            <li key={r.key} className="px-3 py-2.5 border-t border-gray-200 first:border-t-0">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {r.label}
                  <div className="text-xs text-gray-500 mt-1 tabular-nums">
                    {r.odds != null ? (
                      <>
                        <span className={oddsClass(r.odds)}>{formatOdds(r.odds)}</span>倍
                        {r.popularity != null && (
                          <span className={`ml-1.5 px-1 ${rankClass(r.popularity)}`}>{r.popularity}番人気</span>
                        )}
                      </>
                    ) : (
                      'まだ売れていません'
                    )}
                  </div>
                </div>
                <label className="shrink-0 flex items-center gap-1 text-sm text-gray-600">
                  各
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={units[r.key] ?? 0}
                    disabled={r.odds == null}
                    onChange={e => changeUnits(r.key, e.target.value)}
                    aria-label="購入額（100 ine 単位）"
                    className="w-14 px-1.5 py-1 text-right tabular-nums text-gray-900 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#5b8064]/30 focus:border-[#5b8064] disabled:bg-gray-100"
                  />
                  00 ine
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-1.5 text-sm tabular-nums whitespace-nowrap">
                <span>
                  <span className="text-xs text-gray-500 mr-1">想定払戻金</span>
                  {payout != null ? ine(payout) : '--'}
                </span>
                <span>
                  <span className="text-xs text-gray-500 mr-1">損益</span>
                  <span className={profit == null ? 'text-gray-400' : profit > 0 ? 'text-[#1a8a3a] font-bold' : profit < 0 ? 'text-[#e0262d] font-bold' : ''}>
                    {profit == null ? '--' : `${profit > 0 ? '+' : profit < 0 ? '−' : ''}${ine(Math.abs(profit))}`}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* 合計 */}
      <div className="px-3 py-3 bg-[#f4f7f5] border-t border-gray-200 text-sm space-y-1">
        <p className="flex justify-between gap-3">
          <span className="text-gray-600">{bought.length}点</span>
          <span>
            <span className="text-xs text-gray-500 mr-2">合成オッズ</span>
            <span className="font-bold tabular-nums">{composite != null ? `${composite.toFixed(2)}倍` : '-'}</span>
          </span>
        </p>
        <p className="flex justify-between gap-3">
          <span className="text-gray-600">購入額の合計</span>
          <span className="font-bold tabular-nums">{ine(total)}</span>
        </p>
        {bought.length > 0 && (
          <p className="flex justify-between gap-3">
            <span className="text-gray-600">当たったときの払戻</span>
            <span className="font-bold tabular-nums">
              {minPayout === maxPayout ? ine(minPayout) : `${ine(minPayout)} 〜 ${ine(maxPayout)}`}
            </span>
          </p>
        )}
        <div className="text-xs pt-1">
          {bought.length === 0 ? (
            <p className="text-gray-500">買い目ごとに購入額を入れるか、予算で配分してください。</p>
          ) : composite != null && composite < 1 ? (
            <p className="text-[#e0262d] font-bold">合成オッズが1倍を下回るため、どう買ってもトリガミになります。</p>
          ) : minPayout < total ? (
            <p className="text-[#e0262d] font-bold">損益が赤字の買い目は、当たっても購入額の合計に届きません（トリガミ）。</p>
          ) : (
            <p className="text-gray-600">どれが当たっても、払戻が購入額の合計を上回ります。</p>
          )}
          {priced.length < rows.length && (
            <p className="text-gray-500 mt-1">まだ売れていない買い目（{rows.length - priced.length}点）は計算に入れていません。</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SelectedOdds({
  horses,
  winByGate,
  quinellaByKey,
  marks,
  gateCount,
}: {
  horses: OddsHorse[];
  winByGate: Map<number, WinOdds>;
  quinellaByKey: Map<string, QuinellaOdds>;
  marks: MarkMap;
  gateCount: number;
}) {
  // 消し以外の印を付けた馬
  const selected = horses
    .filter(h => !h.excluded && isPicked(marks[h.gate]))
    .map(h => h.gate)
    .sort((a, b) => a - b);
  const nameOf = new Map(horses.map(h => [h.gate, h.name]));

  const winRows: BetRow[] = selected.map(gate => {
    const win = winByGate.get(gate);
    return {
      key: String(gate),
      label: (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <GateBox gate={gate} frame={frameOf(gate, gateCount)} size="sm" />
          <MarkText mark={marks[gate]} />
          <span className="font-bold">{nameOf.get(gate)}</span>
        </span>
      ),
      odds: win?.odds ?? null,
      popularity: win?.popularity ?? null,
    };
  });

  const quinellaRows: BetRow[] = [];
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const [a, b] = [selected[i], selected[j]];
      const q = quinellaByKey.get(pairKey(a, b));
      quinellaRows.push({
        key: pairKey(a, b),
        label: (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="inline-flex items-center gap-1">
              <GateBox gate={a} frame={frameOf(a, gateCount)} size="sm" />
              <span className="text-gray-400 text-xs">-</span>
              <GateBox gate={b} frame={frameOf(b, gateCount)} size="sm" />
            </span>
            <span className="text-xs text-gray-500">{nameOf.get(a)} - {nameOf.get(b)}</span>
          </span>
        ),
        odds: q?.odds ?? null,
        popularity: q?.popularity ?? null,
      });
    }
  }
  quinellaRows.sort((x, y) => (x.odds ?? Infinity) - (y.odds ?? Infinity));

  return (
    <section>
      <SectionTitle>印を付けた馬のオッズ</SectionTitle>
      {selected.length === 0 ? (
        <EmptyState title="印を付けた馬はいません">
          上の出馬表で ◎○▲△☆ を付けると、その馬の単勝と、馬どうしの馬連（ボックス）のオッズを表示します。
        </EmptyState>
      ) : (
        <>
          <p className="text-xs text-gray-500 mb-3">
            消し以外の印を付けた馬の単勝と、その馬どうしの馬連（ボックス）です。予算を入れると買う額を {UNIT} ine 単位で配分し、買い目ごとにも直せます。損益は、その買い目が当たったときの払戻から購入額の合計を引いた額です。
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <BetBlock title="単勝" color="#565eb0" rows={winRows} />
            {quinellaRows.length > 0 ? (
              <BetBlock title="馬連（ボックス）" color="#87599a" rows={quinellaRows} />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden self-start">
                <div className="px-3 py-2 text-sm font-bold text-white bg-[#87599a]">馬連（ボックス）</div>
                <p className="px-3 py-4 text-sm text-gray-500">2頭以上に印を付けると、馬どうしの組み合わせを表示します。</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            合成オッズは、買い目のどれが当たっても払戻が同じになるように買い分けたときの倍率です。オッズは締め切りまで変わるので、計算は目安としてお使いください。
          </p>
        </>
      )}
    </section>
  );
}
