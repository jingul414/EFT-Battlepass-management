import { useEffect, useMemo, useState } from 'react';
import {
  Activity, Check, ChevronLeft, ChevronRight, CircleAlert, FileQuestion,
  FileText, Languages, LockKeyhole, MapPinned, Minus, Plus, RotateCcw, ShieldCheck,
  Target, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Progress } from '@/components/ui/progress';
import {
  DOCUMENTS, INVENTORY_DOCUMENT_IDS, MODE_LABELS, MODE_LIMITS, REWARDS, TOTAL_COST,
  type DocumentId, type DocumentRequirement, type GameMode, type Reward,
  type TrackerState, canAffordReward, daysUntilSeasonEnd, getFrontierPage,
  getInitialState, getPageDeficits, getRewardDeficits, isPageUnlocked,
  isRewardConfigured, normalizeState, recommendMap, remainingCost,
  requirementTotal, rewardsForPage,
} from '@/lib/battlepass';

const STORAGE_KEY = 'eft-battlepass-tracker-v1';
const LANGUAGE_STORAGE_KEY = 'eft-battlepass-document-language';

type DocumentLanguage = 'ko' | 'en';

function readStoredLanguage(): DocumentLanguage {
  if (typeof window === 'undefined') return 'ko';
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'en' ? 'en' : 'ko';
}

function documentName(document: (typeof DOCUMENTS)[number], language: DocumentLanguage): string {
  return language === 'ko' ? document.label : document.englishLabel;
}

function readStoredState(): TrackerState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? normalizeState(JSON.parse(value) as Partial<TrackerState>) : getInitialState();
  } catch {
    return getInitialState();
  }
}

function clampCount(value: number): number {
  return Math.max(0, Math.min(999, Math.floor(Number.isFinite(value) ? value : 0)));
}

type RewardStatus = 'claimed' | 'locked' | 'unconfigured' | 'ready' | 'short';

function rewardStatus(reward: Reward, state: TrackerState, pageUnlocked: boolean): RewardStatus {
  if (state.claimedIds.includes(reward.id)) return 'claimed';
  if (!pageUnlocked) return 'locked';
  if (!isRewardConfigured(reward, state)) return 'unconfigured';
  return canAffordReward(reward, state) ? 'ready' : 'short';
}

const statusCopy: Record<RewardStatus, string> = {
  claimed: '수령 완료', locked: '페이지 잠김', unconfigured: '문서 설정 필요',
  ready: '수령 가능', short: '문서 부족',
};

export default function App() {
  const initial = useMemo(() => readStoredState(), []);
  const [state, setState] = useState<TrackerState>(initial);
  const [selectedPage, setSelectedPage] = useState(() => getFrontierPage(initial.claimedIds));
  const [documentLanguage, setDocumentLanguage] = useState<DocumentLanguage>(readStoredLanguage);
  const [notice, setNotice] = useState('변경 사항은 이 브라우저에 자동 저장됩니다.');

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, documentLanguage);
  }, [documentLanguage]);

  const claimedSet = useMemo(() => new Set(state.claimedIds), [state.claimedIds]);
  const claimedCount = state.claimedIds.length;
  const frontierPage = getFrontierPage(state.claimedIds);
  const selectedRewards = rewardsForPage(selectedPage);
  const selectedPageUnlocked = isPageUnlocked(selectedPage, state.claimedIds);
  const selectedClaimedCount = selectedRewards.filter((reward) => claimedSet.has(reward.id)).length;
  const costRemaining = remainingCost(state.claimedIds);
  const daysRemaining = daysUntilSeasonEnd();
  const dailyTarget = Math.ceil(costRemaining / Math.max(1, daysRemaining + 1));
  const dailyLimit = MODE_LIMITS[state.mode];
  const dailyRemaining = Math.max(0, dailyLimit - state.dailyCollected);
  const deficits = useMemo(() => getPageDeficits(frontierPage, state), [frontierPage, state]);
  const mapRecommendation = useMemo(() => recommendMap(deficits), [deficits]);
  const configuredOnFrontier = rewardsForPage(frontierPage).some(
    (reward) => !claimedSet.has(reward.id) && (state.requirements[reward.id]?.length ?? 0) > 0,
  );

  const updateInventory = (id: DocumentId, value: number) => {
    setState((current) => ({ ...current, inventory: { ...current.inventory, [id]: clampCount(value) } }));
  };

  const setRequirements = (rewardId: number, requirements: DocumentRequirement[]) => {
    setState((current) => ({ ...current, requirements: { ...current.requirements, [rewardId]: requirements } }));
  };

  const toggleClaim = (reward: Reward) => {
    const requirements = state.requirements[reward.id] ?? [];
    const alreadyClaimed = claimedSet.has(reward.id);
    if (requirements.length === 0) return;
    if (alreadyClaimed) {
      if (state.manualClaimedIds.includes(reward.id)) return;
      setState((current) => ({
        ...current,
        inventory: requirements.reduce(
          (inventory, requirement) => ({
            ...inventory,
            [requirement.documentId]: inventory[requirement.documentId] + requirement.count,
          }),
          { ...current.inventory },
        ),
        claimedIds: current.claimedIds.filter((id) => id !== reward.id),
        manualClaimedIds: current.manualClaimedIds.filter((id) => id !== reward.id),
      }));
      setNotice(`LV.${reward.id} 수령을 취소하고 문서 ${reward.cost}개를 복원했습니다.`);
      return;
    }
    if (!isPageUnlocked(reward.page, state.claimedIds) || !canAffordReward(reward, state)) return;
    setState((current) => ({
      ...current,
      inventory: requirements.reduce(
        (inventory, requirement) => ({
          ...inventory,
          [requirement.documentId]: inventory[requirement.documentId] - requirement.count,
        }),
        { ...current.inventory },
      ),
      claimedIds: [...current.claimedIds, reward.id].sort((a, b) => a - b),
      manualClaimedIds: current.manualClaimedIds.filter((id) => id !== reward.id),
    }));
    setNotice(`LV.${reward.id} ${reward.name} 보상을 수령 처리했습니다.`);
  };

  const toggleManualClaim = (reward: Reward) => {
    const manuallyClaimed = state.manualClaimedIds.includes(reward.id);
    setState((current) => ({
      ...current,
      claimedIds: manuallyClaimed
        ? current.claimedIds.filter((id) => id !== reward.id)
        : [...current.claimedIds, reward.id].sort((a, b) => a - b),
      manualClaimedIds: manuallyClaimed
        ? current.manualClaimedIds.filter((id) => id !== reward.id)
        : [...current.manualClaimedIds, reward.id].sort((a, b) => a - b),
    }));
    setNotice(manuallyClaimed
      ? `LV.${reward.id} 수동 완료를 취소했습니다. 문서 재고는 변경하지 않았습니다.`
      : `LV.${reward.id} ${reward.name} 보상을 수동 완료했습니다. 문서 재고는 변경하지 않았습니다.`);
  };

  const resetAll = () => {
    if (!window.confirm('모든 재고와 보상 진행 기록을 초기화할까요?')) return;
    setState(getInitialState());
    setSelectedPage(1);
    setNotice('모든 진행 기록을 초기화했습니다.');
  };

  const progressionNeed = Math.max(0, selectedRewards.length - 1 - selectedClaimedCount);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#0f110e]/94 px-4 py-3 backdrop-blur-xl lg:px-8">
        <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-sm border border-[#c9a96a]/35 bg-[#c9a96a]/10 text-[#dec189]"><ShieldCheck className="size-5" /></div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-[#8e9487]">KORD BREACH</p>
              <h1 className="truncate text-sm font-semibold tracking-tight text-[#f0efe9] sm:text-base">BattlePass Operations</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <span className="hidden text-xs text-[#a9ada2] md:block">시즌 종료까지 {daysRemaining}일</span>
            <Button
              aria-label={documentLanguage === 'ko' ? '문서 이름을 영어로 변경' : '문서 이름을 한국어로 변경'}
              className="h-8 rounded-sm border-white/10 px-2 text-xs text-[#b8bcb2]"
              variant="outline"
              onClick={() => setDocumentLanguage((current) => current === 'ko' ? 'en' : 'ko')}
            >
              <Languages /><span className="hidden sm:inline">문서명 ·</span>{documentLanguage === 'ko' ? '한국어' : 'English'}
            </Button>
            <div className="flex items-center gap-2 rounded-sm border border-[#c9a96a]/25 bg-[#c9a96a]/8 px-2.5 py-1.5">
              <NativeSelect aria-label="게임 모드" className="w-[92px] border-0" size="sm" value={state.mode} onChange={(event) => setState((current) => ({ ...current, mode: event.target.value as GameMode }))}>
                {Object.entries(MODE_LABELS).map(([id, label]) => <NativeSelectOption key={id} value={id}>{label}</NativeSelectOption>)}
              </NativeSelect>
              <span className="font-mono text-xs text-[#dec189]">{state.dailyCollected}/{dailyLimit}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1520px] gap-5 px-4 py-5 lg:grid-cols-[270px_minmax(0,1fr)_310px] lg:px-8">
        <aside className="space-y-5">
          <section className="panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div><p className="eyebrow">INVENTORY</p><h2 className="section-title">문서 보유량</h2></div><FileText className="size-4 text-[#9b9f94]" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
              {INVENTORY_DOCUMENT_IDS.map((id) => DOCUMENTS.find((document) => document.id === id)!).map((document) => (
                <div key={document.id} className="inventory-row group relative hover:z-20 focus-within:z-20">
                  <div className="flex min-w-0 items-center gap-2"><span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: document.color }} /><span className="min-w-0 text-xs leading-4 text-[#c7c9c1]">{documentName(document, documentLanguage)}</span></div>
                  <div className="flex items-center gap-1">
                    <Button aria-label={`${documentName(document, documentLanguage)} 1개 감소`} className="inventory-step" size="icon-xs" variant="ghost" onClick={() => updateInventory(document.id, state.inventory[document.id] - 1)}><Minus /></Button>
                    <Input aria-label={`${documentName(document, documentLanguage)} 수량`} className="h-7 w-11 rounded-sm border-white/8 px-1 text-center font-mono text-xs" inputMode="numeric" min={0} type="number" value={state.inventory[document.id]} onChange={(event) => updateInventory(document.id, Number(event.target.value))} />
                    <Button aria-label={`${documentName(document, documentLanguage)} 1개 증가`} className="inventory-step" size="icon-xs" variant="ghost" onClick={() => updateInventory(document.id, state.inventory[document.id] + 1)}><Plus /></Button>
                  </div>
                  <div className="pointer-events-none absolute left-2 top-[calc(100%+0.35rem)] z-30 hidden min-w-max rounded-sm border border-[#c9a96a]/25 bg-[#191c17] px-3 py-2 shadow-xl group-hover:block group-focus-within:block" role="tooltip">
                    <p className="text-xs font-medium text-[#e2e1d9]">{document.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#92988d]">{document.englishLabel}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-sm border border-[#c9a96a]/22 bg-[#c9a96a]/7 px-3 py-2.5">
              <span className="text-sm text-[#d7c291]">{documentLanguage === 'ko' ? '기밀 문서' : 'Classified documents'}</span>
              <Input aria-label={`${documentLanguage === 'ko' ? '기밀 문서' : 'Classified documents'} 수량`} className="h-7 w-14 rounded-sm border-[#c9a96a]/20 text-center font-mono text-[#ecd296]" min={0} type="number" value={state.classified} onChange={(event) => setState((current) => ({ ...current, classified: clampCount(Number(event.target.value)) }))} />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-[#676c63]">기밀 문서는 자동으로 소비하지 않습니다.</p>
          </section>

          <section className="panel p-4">
            <div className="mb-3 flex items-center gap-2"><Target className="size-4 text-[#c9a96a]" /><p className="eyebrow">DAILY LIMIT</p></div>
            <label className="mb-2 block text-xs text-[#9da297]" htmlFor="daily-collected">오늘 획득한 문서</label>
            <Input id="daily-collected" className="h-9 rounded-sm border-white/10 font-mono" min={0} type="number" value={state.dailyCollected} onChange={(event) => setState((current) => ({ ...current, dailyCollected: clampCount(Number(event.target.value)) }))} />
            <div className="mt-3 flex justify-between text-xs text-[#858b80]"><span>추가 획득 가능</span><strong className="font-mono text-[#d5d7ce]">{dailyRemaining}</strong></div>
            {state.dailyCollected > dailyLimit && <p className="mt-2 flex items-center gap-1 text-[11px] text-[#d7a06b]"><CircleAlert className="size-3" />선택 모드의 일일 한도를 초과했습니다.</p>}
          </section>
        </aside>

        <section className="min-w-0 space-y-5">
          <section className="panel grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2"><Activity className="size-4 text-[#c9a96a]" /><p className="eyebrow">SEASON PROGRESS</p></div>
              <div className="flex items-end gap-3"><strong className="text-4xl font-semibold tracking-[-0.05em] text-[#f2f0e8]">{claimedCount}</strong><span className="pb-1 text-sm text-[#858a80]">/ 53 보상</span></div>
              <Progress aria-label="전체 보상 진행률" className="mt-4 [&_[data-slot=progress-indicator]]:bg-[#c9a96a] [&_[data-slot=progress-track]]:h-1.5 [&_[data-slot=progress-track]]:bg-white/8" value={(claimedCount / REWARDS.length) * 100} />
            </div>
            <div className="grid grid-cols-3 gap-4 sm:text-right"><Stat label="CURRENT PAGE" value={`${frontierPage}/12`} /><Stat label="REMAINING" value={String(costRemaining)} /><Stat label="DAILY TARGET" value={String(dailyTarget)} /></div>
          </section>

          <nav aria-label="배틀패스 페이지" className="panel flex items-center gap-1 overflow-x-auto p-2">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((page) => {
              const unlocked = isPageUnlocked(page, state.claimedIds);
              const complete = rewardsForPage(page).every((reward) => claimedSet.has(reward.id));
              return <button key={page} aria-current={selectedPage === page ? 'page' : undefined} className={`page-tab ${selectedPage === page ? 'page-tab-active' : ''}`} type="button" onClick={() => setSelectedPage(page)}>{complete ? <Check className="size-3" /> : !unlocked ? <LockKeyhole className="size-3" /> : null}{String(page).padStart(2, '0')}</button>;
            })}
          </nav>

          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
              <div><p className="eyebrow">PAGE {String(selectedPage).padStart(2, '0')} {selectedPage === frontierPage ? '· FRONTIER' : ''}</p><h2 className="section-title">보상 및 요구 문서 설정</h2></div>
              <span className="font-mono text-xs text-[#8d9187]">{selectedClaimedCount}/{selectedRewards.length} CLAIMED</span>
            </div>
            {!selectedPageUnlocked && <div className="flex items-center gap-2 border-b border-[#d1a35d]/16 bg-[#d1a35d]/6 px-5 py-3 text-xs text-[#c4ad7c]"><LockKeyhole className="size-3.5" />앞 페이지의 해금 조건을 먼저 충족해야 합니다. 요구 문서는 미리 설정할 수 있습니다.</div>}
            <div className="divide-y divide-white/7">
              {selectedRewards.map((reward) => <RewardRow key={reward.id} reward={reward} state={state} status={rewardStatus(reward, state, selectedPageUnlocked)} documentLanguage={documentLanguage} onRequirementsChange={setRequirements} onToggleClaim={toggleClaim} onToggleManualClaim={toggleManualClaim} />)}
            </div>
          </section>
          <output aria-live="polite" className="block rounded-sm border border-white/7 bg-white/[0.02] px-4 py-3 text-xs text-[#7f857a]">{notice}</output>
        </section>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2"><MapPinned className="size-4 text-[#c9a96a]" /><p className="eyebrow">NEXT DEPLOYMENT</p></div>
            {mapRecommendation ? <>
              <h2 className="text-2xl font-semibold tracking-tight text-[#f0eee6]">{mapRecommendation.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[#8e9388]">현재 최전선 Page {frontierPage}에서 부족한 문서를 가장 많이 충족하는 맵입니다.</p>
              <div className="mt-5 space-y-2">{mapRecommendation.covered.map((id) => { const document = DOCUMENTS.find((item) => item.id === id)!; return <div key={id} className="flex justify-between text-xs text-[#aeb2a7]"><span className="flex items-center gap-2"><span className="size-1.5 rounded-full" style={{ backgroundColor: document.color }} />{documentName(document, documentLanguage)}</span><span className="font-mono">-{deficits[id]}</span></div>; })}</div>
            </> : <div className="py-2"><FileQuestion className="mb-3 size-6 text-[#777d72]" /><h2 className="section-title">{configuredOnFrontier ? '지금 받을 보상을 확인하세요' : '요구 문서를 설정하세요'}</h2><p className="mt-2 text-sm leading-6 text-[#858b80]">{configuredOnFrontier ? '설정된 최전선 보상에는 현재 계산할 문서 부족분이 없습니다.' : `Page ${frontierPage} 보상의 요구 문서를 선택하면 파밍 맵을 추천합니다.`}</p></div>}
          </section>

          <section className="panel p-5">
            <p className="eyebrow">PAGE ACCESS</p>
            <h2 className="section-title mt-1">{selectedPageUnlocked ? (selectedPage === 12 ? '최종 페이지' : progressionNeed === 0 ? '다음 페이지 개방 가능' : '다음 페이지 진행 조건') : '현재 페이지 잠김'}</h2>
            <p className="mt-3 text-sm leading-6 text-[#8d9287]">{selectedPageUnlocked ? selectedPage === 12 ? '모든 최종 보상을 완료하면 시즌 트랙이 끝납니다.' : progressionNeed === 0 ? `Page ${selectedPage + 1}가 개방되었습니다.` : `Page ${selectedPage + 1}를 열려면 이 페이지에서 보상 ${progressionNeed}개를 더 수령하세요.` : `Page ${selectedPage - 1}까지의 진행 조건을 먼저 충족하세요.`}</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4 text-xs text-[#c5c8be]">
              <Button className="h-7 px-0 text-xs text-[#c5c8be]" variant="ghost" onClick={() => setSelectedPage(Math.max(1, selectedPage - 1))}><ChevronLeft />이전</Button>
              <Button className="h-7 px-0 text-xs text-[#c5c8be]" disabled={selectedPage === 12} variant="ghost" onClick={() => setSelectedPage(Math.min(12, selectedPage + 1))}>다음<ChevronRight /></Button>
            </div>
          </section>

          <section className="panel p-5">
            <p className="eyebrow">COMPLETION FORECAST</p>
            <div className="mt-3 grid grid-cols-2 gap-3"><Stat label="DAYS LEFT" value={String(daysRemaining)} /><Stat label="TOTAL COST" value={String(TOTAL_COST)} /></div>
            <p className="mt-4 text-xs leading-5 text-[#777d73]">모든 남은 보상을 기준으로 하루 평균 {dailyTarget}개가 필요합니다. 문서 종류와 5:1 교환 손실은 별도입니다.</p>
          </section>
          <Button className="w-full justify-center border-white/8 text-[#8f9589]" variant="outline" onClick={resetAll}><RotateCcw />전체 기록 초기화</Button>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><p className="eyebrow">{label}</p><strong className="font-mono text-lg text-[#e4e2da] sm:text-xl">{value}</strong></div>;
}

function RewardRow({ reward, state, status, documentLanguage, onRequirementsChange, onToggleClaim, onToggleManualClaim }: {
  reward: Reward;
  state: TrackerState;
  status: RewardStatus;
  documentLanguage: DocumentLanguage;
  onRequirementsChange: (rewardId: number, requirements: DocumentRequirement[]) => void;
  onToggleClaim: (reward: Reward) => void;
  onToggleManualClaim: (reward: Reward) => void;
}) {
  const requirements = state.requirements[reward.id] ?? [];
  const total = requirementTotal(requirements);
  const deficits = getRewardDeficits(reward, state);
  const selectedDocuments = new Set(requirements.map((requirement) => requirement.documentId));
  const manuallyClaimed = state.manualClaimedIds.includes(reward.id);

  const updatePart = (index: number, patch: Partial<DocumentRequirement>) => {
    onRequirementsChange(
      reward.id,
      requirements.map((requirement, requirementIndex) => (
        requirementIndex === index ? { ...requirement, ...patch } : requirement
      )),
    );
  };

  const addDocument = (documentId: DocumentId) => {
    if (selectedDocuments.has(documentId)) return;
    onRequirementsChange(reward.id, [...requirements, { documentId, count: 1 }]);
  };

  const removePart = (index: number) => {
    onRequirementsChange(reward.id, requirements.filter((_, requirementIndex) => requirementIndex !== index));
  };

  return (
    <article className={`reward-row ${status === 'claimed' ? 'reward-claimed' : ''}`}>
      <span className="font-mono text-xs text-[#73786e]">LV.{String(reward.id).padStart(2, '0')}</span>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-medium text-[#e5e3dc]">{reward.name}</h3>
        <p className="mt-1 text-xs text-[#797e74]">{reward.category}</p>
      </div>

      <div className="space-y-2">
        {requirements.map((requirement, index) => {
          const document = DOCUMENTS.find((item) => item.id === requirement.documentId)!;
          return (
            <div key={requirement.documentId} className="requirement-row">
              <NativeSelect
                aria-label={`레벨 ${reward.id} 요구 문서 ${index + 1}`}
                className="min-w-0 flex-1"
                disabled={status === 'claimed'}
                size="sm"
                value={requirement.documentId}
                onChange={(event) => updatePart(index, { documentId: event.target.value as DocumentId })}
              >
                {DOCUMENTS.map((option) => (
                  <NativeSelectOption
                    key={option.id}
                    disabled={option.id !== requirement.documentId && selectedDocuments.has(option.id)}
                    value={option.id}
                  >
                    {documentName(option, documentLanguage)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <span aria-hidden="true" className="text-xs text-[#62685f]">×</span>
              <Input
                aria-label={`레벨 ${reward.id} ${documentName(document, documentLanguage)} 요구 수량`}
                className="h-7 w-12 rounded-sm border-white/8 px-1 text-center font-mono text-xs"
                disabled={status === 'claimed'}
                min={1}
                max={reward.cost}
                type="number"
                value={requirement.count}
                onChange={(event) => updatePart(index, { count: Math.max(1, Math.min(reward.cost, clampCount(Number(event.target.value)))) })}
              />
              <Button
                aria-label={`레벨 ${reward.id} ${documentName(document, documentLanguage)} 요구 항목 삭제`}
                className="size-7 text-[#6f756b] hover:text-[#ca7e72]"
                disabled={status === 'claimed'}
                size="icon-sm"
                variant="ghost"
                onClick={() => removePart(index)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}

        {requirements.length < DOCUMENTS.length && status !== 'claimed' && (
          <NativeSelect
            aria-label={`레벨 ${reward.id} 요구 문서 추가`}
            className="w-full"
            size="sm"
            value=""
            onChange={(event) => addDocument(event.target.value as DocumentId)}
          >
            <NativeSelectOption value="">+ 문서 종류 추가</NativeSelectOption>
            {DOCUMENTS.map((document) => (
              <NativeSelectOption key={document.id} disabled={selectedDocuments.has(document.id)} value={document.id}>
                {documentName(document, documentLanguage)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </div>

      <div className="text-left sm:text-right">
        <p className={`font-mono text-xs ${total === reward.cost ? 'text-[#a9ada3]' : 'text-[#d2a36e]'}`}>TOTAL · {total}/{reward.cost}</p>
        {status === 'unconfigured' && requirements.length > 0 && (
          <p className="mt-1 text-[10px] text-[#b8875e]">
            {total < reward.cost ? `${reward.cost - total}개 더 설정` : `${total - reward.cost}개 초과`}
          </p>
        )}
        {status === 'short' && (
          <p className="mt-1 text-[10px] text-[#c98c6c]">
            {Object.entries(deficits).map(([id, count]) => {
              const document = DOCUMENTS.find((item) => item.id === id);
              return document ? `${documentName(document, documentLanguage)} ${count}` : '';
            }).join(' · ')} 부족
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        {manuallyClaimed ? (
          <Button
            className="h-8 w-full rounded-sm border-[#c9a96a]/30 bg-[#c9a96a]/10 text-xs text-[#e0c58d]"
            variant="outline"
            onClick={() => onToggleManualClaim(reward)}
          >
            <RotateCcw />수동 완료 취소
          </Button>
        ) : (
          <>
            <Button
              className={`h-8 w-full rounded-sm text-xs ${status === 'ready' ? 'border-[#9faa79]/35 bg-[#9faa79]/10 text-[#cbd5a7] hover:bg-[#9faa79]/18' : status === 'claimed' ? 'border-[#c9a96a]/30 bg-[#c9a96a]/10 text-[#e0c58d]' : 'border-white/8 bg-white/[0.025] text-[#686d64]'}`}
              disabled={!['ready', 'claimed'].includes(status)}
              variant="outline"
              onClick={() => onToggleClaim(reward)}
            >
              {status === 'claimed' && <Check />}{statusCopy[status]}
            </Button>
            {status !== 'claimed' && (
              <Button
                className="h-8 w-full rounded-sm border-white/10 text-xs text-[#9b9f96] hover:text-[#d4d6ce]"
                variant="outline"
                onClick={() => onToggleManualClaim(reward)}
              >
                <Check />수동 완료
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
