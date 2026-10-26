import type { ReactNode } from 'react';
import {
  APPROVAL_LABEL,
  CLASS_LABEL,
  GENDER_LABEL,
  SELECTION_BASIS_LABEL,
  formatIne,
  formatRecord,
  type EntryRules,
  type RaceClass,
  type RaceDetail,
} from '@/lib/keiba';
import { EmptyState, HorseLink, OwnerLabel, PrizeTotal, SectionTitle } from './KeibaParts';

// 受付中のレースの出走条件と、申請している馬。
//   条件の説明はプラグインの申請の確かめ方（RaceManager.applyEntry / approve / openBetting）に合わせる

// 追加賞金の1〜3着への分け方（プラグインの BetManager.PRIZE_RATES）
const BONUS_SHARES = [60, 25, 15];

// そのクラスのレースに格上挑戦なしで出られる馬のクラス（プラグインの RaceClass.accepts）
const BASE_HORSE_CLASS: Record<RaceClass, RaceClass> = { SHINBA: 'SHINBA', ONE_WIN: 'ONE_WIN', OP: 'OP', G2: 'OP', G1: 'OP' };

function selectionText(rules: EntryRules): string {
  const max = rules.maxRunners;
  if (rules.approval === 'MANUAL') {
    return max != null
      ? `運営が申請を確認して、定員の${max}頭まで承認します。締切の時点で承認待ちの申請は却下されます`
      : '運営が申請を確認して承認します。締切の時点で承認待ちの申請は却下されます';
  }
  if (max == null) return '申請した馬はすべて出走できます';
  if (rules.selection === 'PRIZE') {
    const basis = SELECTION_BASIS_LABEL[rules.selectionBasis ?? 'BONUS'];
    return `賞金順。定員を超えても申請でき、締切の時点で${basis}の多い順に${max}頭を選びます（同額は抽選）`;
  }
  return `先着順。${max}頭に達すると申請を締め切ります（取消が出ればまた申請できます）`;
}

function feeText(rules: EntryRules): string {
  if (!rules.entryFee) return '無料';
  const when = rules.approval === 'MANUAL' ? '承認されたときに支払います' : '申請したときに支払います';
  return `${formatIne(rules.entryFee)}（${when}）`;
}

function RuleRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr]">
      <dt className="bg-[#e6eee8] px-3 py-2.5 text-xs font-bold text-gray-700">{label}</dt>
      <dd className="px-3 py-2.5 text-gray-900">{children}</dd>
    </div>
  );
}

function PendingTag() {
  return (
    <span className="inline-block ml-1.5 text-[10px] px-1 py-px rounded bg-[#fffbea] text-[#7a5d00] ring-1 ring-inset ring-[#f5d300] align-middle whitespace-nowrap">
      承認待ち
    </span>
  );
}

function UpperChallengeTag() {
  return (
    <span className="inline-block ml-1.5 text-[10px] px-1 py-px rounded bg-gray-200 text-gray-600 align-middle whitespace-nowrap">
      格上挑戦
    </span>
  );
}

export default function EntryOpenPanel({ race }: { race: RaceDetail }) {
  const rules = race.entryRules ?? null;
  const applicants = race.applicants ?? [];
  const pending = applicants.filter(a => a.pending).length;
  const max = rules?.maxRunners ?? null;
  // 先着のレースは、承認済みが定員に達すると申請できない
  const full = rules != null && rules.approval === 'AUTO' && rules.selection === 'FIRST' && max != null
    && applicants.length - pending >= max;
  const base = race.class ? BASE_HORSE_CLASS[race.class] : null;
  const bonus = race.bonusTotal ?? 0;
  // エントリー料を返金する場面（賞金順で漏れるのは、自動承認で定員のある賞金順のレースだけ）
  const prizeSelection = rules?.approval === 'AUTO' && rules.selection === 'PRIZE' && max != null;
  const refunds = ['締切前の取消', ...(prizeSelection ? ['賞金順で選ばれなかったとき'] : []), 'レースの中止'];

  return (
    <div className="space-y-8">
      {rules && (
        <section>
          <SectionTitle>出走条件</SectionTitle>
          <dl className="bg-white border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-200 text-sm">
            <RuleRow label="出走できる馬">
              {rules.eligibleClasses.length > 0 ? rules.eligibleClasses.map(c => CLASS_LABEL[c]).join('・') : '-'}
              <span className="text-gray-500">{rules.upperChallenge ? '（格上挑戦あり）' : '（格上挑戦なし）'}</span>
            </RuleRow>
            <RuleRow label="定員">{max != null ? `${max}頭` : '制限なし'}</RuleRow>
            <RuleRow label="選び方">
              {rules.approval && <span className="font-bold mr-1.5">{APPROVAL_LABEL[rules.approval]}</span>}
              {selectionText(rules)}
            </RuleRow>
            <RuleRow label="エントリー料">{feeText(rules)}</RuleRow>
            {bonus > 0 && (
              <RuleRow label="追加賞金">
                {formatIne(bonus)}
                <span className="text-gray-500">
                  （{BONUS_SHARES.map((share, i) => `${i + 1}着 ${share}%`).join('・')}）
                </span>
              </RuleRow>
            )}
          </dl>
          <ul className="text-xs text-gray-500 mt-2 space-y-0.5 list-disc pl-4">
            <li>
              申請は、出走させる馬に乗って <code className="text-gray-700">/keiba entry {race.name} back</code>
              （レース後は申請した場所へ戻す）または <code className="text-gray-700">pickup</code>（引き上げ所へ戻す）
            </li>
            <li>申請できるのは馬主のいる競走馬だけです。1頭が申請できるのは1レースだけで、1つのレースには1人の馬主につき1頭までです</li>
            <li>
              締切前なら <code className="text-gray-700">/keiba cancel {race.name}</code> で取り消せます。
              {rules.entryFee ? `支払ったエントリー料は、${refunds.join('・')}で返金されます` : ''}
            </li>
            <li>申請中の馬には、乗る・リード・配合・馬主の変更などができません（餌やりはできます）</li>
            <li>馬番は締切の時点で抽選で決まり、馬体重もそのとき発表されます</li>
          </ul>
        </section>
      )}

      <section>
        <SectionTitle
          aside={`${applicants.length}頭${pending > 0 ? `（うち承認待ち ${pending}頭）` : ''}${max != null ? ` / 定員 ${max}頭` : ''}`}
        >
          申請中の馬
        </SectionTitle>
        {full && (
          <p className="mb-3 px-4 py-2.5 rounded-lg bg-[#fffbea] border border-[#f5d300] text-sm text-gray-900">
            定員に達しているため、今は申請できません。
          </p>
        )}
        {applicants.length === 0 ? (
          <EmptyState title="まだ申請はありません">締切までに申請された馬がここに表示されます。</EmptyState>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-[#e6eee8] text-gray-700 text-xs whitespace-nowrap">
                  <th className="py-2 px-2 w-14 font-bold">申請順</th>
                  <th className="py-2 px-3 text-left font-bold">馬名</th>
                  <th className="py-2 px-1 w-8 font-bold">性</th>
                  <th className="py-2 px-2 font-bold">クラス</th>
                  <th className="py-2 px-3 text-left font-bold">馬主</th>
                  <th className="py-2 px-2 font-bold" title="1着-2着-3着-着外">成績</th>
                  <th className="py-2 px-2 font-bold">
                    通算賞金<span className="font-normal">(合計)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(a => (
                  <tr key={a.horseUuid} className={`border-t border-gray-200 ${a.pending ? 'text-gray-500' : ''}`}>
                    <td className="py-2 px-2 text-center tabular-nums">{a.order}</td>
                    <td className="py-2 px-3">
                      <HorseLink uuid={a.horseUuid} name={a.horseName} className="font-bold text-gray-900" />
                      {a.pending && <PendingTag />}
                      {base && a.horseClass && a.horseClass !== base && <UpperChallengeTag />}
                    </td>
                    <td className="py-2 px-1 text-center">{a.gender ? GENDER_LABEL[a.gender] : ''}</td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">{a.horseClass ? CLASS_LABEL[a.horseClass] : ''}</td>
                    <td className="py-2 px-3 max-w-[9rem]"><OwnerLabel owner={a.owner} /></td>
                    <td className="py-2 px-2 text-center tabular-nums whitespace-nowrap">
                      {a.record.starts > 0 ? formatRecord(a.record) : <span className="text-xs text-gray-500">初出走</span>}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums whitespace-nowrap text-xs">
                      {(a.totalPrize ?? 0) > 0 ? <PrizeTotal prize={a.totalPrize} bonus={a.totalBonus} /> : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <ul className="text-xs text-gray-500 mt-2 space-y-0.5 list-disc pl-4">
          <li>申請順：取消があっても番号は詰めません</li>
          <li>成績：1着-2着-3着-着外の回数</li>
          <li>通算賞金：通常の賞金と追加賞金の合計。下の数字は「通常＋追加」の内訳</li>
        </ul>
      </section>
    </div>
  );
}
