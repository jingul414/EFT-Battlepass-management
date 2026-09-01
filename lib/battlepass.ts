export const DOCUMENT_IDS = [
  'blueprint',
  'financial',
  'medical',
  'personnel',
  'user',
  'test',
  'technical',
  'project',
] as const;

export type DocumentId = (typeof DOCUMENT_IDS)[number];
export type GameMode = 'seasonal' | 'pvp' | 'pve';

export interface DocumentDefinition {
  id: DocumentId;
  label: string;
  shortLabel: string;
  color: string;
  maps: string[];
}

export interface Reward {
  id: number;
  page: number;
  name: string;
  category: string;
  cost: number;
}

export interface DocumentRequirement {
  documentId: DocumentId;
  count: number;
}

export interface TrackerState {
  inventory: Record<DocumentId, number>;
  classified: number;
  requirements: Record<number, DocumentRequirement[]>;
  claimedIds: number[];
  dailyCollected: number;
  mode: GameMode;
  dailyDate: string;
}

export const DOCUMENTS: DocumentDefinition[] = [
  { id: 'blueprint', label: '설계·기술 도면', shortLabel: '설계', color: '#38bdf8', maps: ['Interchange', 'Factory', 'The Labyrinth'] },
  { id: 'financial', label: '금융 문서', shortLabel: '금융', color: '#34d399', maps: ['Customs', 'Streets of Tarkov', 'Interchange'] },
  { id: 'medical', label: '의료 문서', shortLabel: '의료', color: '#fb7185', maps: ['The Lab', 'Ground Zero', 'The Labyrinth'] },
  { id: 'personnel', label: 'PMC 인사 파일', shortLabel: '인사', color: '#fb923c', maps: ['Reserve', 'Lighthouse', 'Icebreaker'] },
  { id: 'user', label: '사용자 문서', shortLabel: '사용자', color: '#a78bfa', maps: ['Ground Zero', 'Streets of Tarkov', 'The Lab'] },
  { id: 'test', label: '시험 문서', shortLabel: '시험', color: '#fcd34d', maps: ['Shoreline', 'Woods', 'Icebreaker'] },
  { id: 'technical', label: '기술 문서', shortLabel: '기술', color: '#22d3ee', maps: ['Shoreline', 'Woods', 'Lighthouse'] },
  { id: 'project', label: '프로젝트 문서', shortLabel: '프로젝트', color: '#a8a29e', maps: ['Factory', 'Reserve', 'Customs'] },
];

export const MODE_LIMITS: Record<GameMode, number> = {
  seasonal: 30,
  pvp: 20,
  pve: 15,
};

export const MODE_LABELS: Record<GameMode, string> = {
  seasonal: 'Seasonal',
  pvp: 'PvP',
  pve: 'PvE',
};

export const MAPS = [
  { name: 'Customs', documents: ['financial', 'project'] as DocumentId[] },
  { name: 'Factory', documents: ['blueprint', 'project'] as DocumentId[] },
  { name: 'Interchange', documents: ['blueprint', 'financial'] as DocumentId[] },
  { name: 'The Labyrinth', documents: ['blueprint', 'medical'] as DocumentId[] },
  { name: 'Streets of Tarkov', documents: ['financial', 'user'] as DocumentId[] },
  { name: 'The Lab', documents: ['medical', 'user'] as DocumentId[] },
  { name: 'Ground Zero', documents: ['medical', 'user'] as DocumentId[] },
  { name: 'Reserve', documents: ['personnel', 'project'] as DocumentId[] },
  { name: 'Lighthouse', documents: ['personnel', 'technical'] as DocumentId[] },
  { name: 'Icebreaker', documents: ['personnel', 'test'] as DocumentId[] },
  { name: 'Shoreline', documents: ['test', 'technical'] as DocumentId[] },
  { name: 'Woods', documents: ['test', 'technical'] as DocumentId[] },
];

export const REWARDS: Reward[] = [
  { id: 1, page: 1, name: 'Marked dogtag', category: 'Dogtag', cost: 1 },
  { id: 2, page: 1, name: 'TarCoin ×50', category: 'Currency', cost: 3 },
  { id: 3, page: 1, name: 'BURN poster', category: 'Poster', cost: 3 },
  { id: 4, page: 1, name: 'Black Division gear crate', category: 'Reward loot container', cost: 3 },
  { id: 5, page: 1, name: 'Black wood ceiling', category: 'Hideout customization', cost: 5 },
  { id: 6, page: 2, name: 'Gentex Ops-Core SOTR respirator', category: 'Barter trade', cost: 4 },
  { id: 7, page: 2, name: 'Red Hawaii', category: 'Tactical clothing', cost: 7 },
  { id: 8, page: 2, name: 'Black Division gear crate', category: 'Reward loot container', cost: 3 },
  { id: 9, page: 2, name: 'Scorpion target', category: 'Hideout customization', cost: 3 },
  { id: 10, page: 2, name: 'TarCoin ×50', category: 'Currency', cost: 3 },
  { id: 11, page: 3, name: 'Mystery Ranch NICE Frame Load Sling', category: 'Barter trade', cost: 4 },
  { id: 12, page: 3, name: 'Black Division gear crate', category: 'Reward loot container', cost: 5 },
  { id: 13, page: 3, name: 'Black Herringbone', category: 'Hideout customization', cost: 7 },
  { id: 14, page: 3, name: 'TarCoin ×50', category: 'Currency', cost: 5 },
  { id: 15, page: 3, name: 'Heart', category: 'Mannequin pose', cost: 4 },
  { id: 16, page: 4, name: 'Marked dogtag', category: 'Dogtag', cost: 5 },
  { id: 17, page: 4, name: 'Microtech Jagdkommando knife', category: 'Melee weapon', cost: 10 },
  { id: 18, page: 4, name: 'TarCoin ×50', category: 'Currency', cost: 5 },
  { id: 19, page: 4, name: 'Beware the Bear poster', category: 'Poster', cost: 5 },
  { id: 20, page: 4, name: 'Black Division gear crate', category: 'Reward loot container', cost: 5 },
  { id: 21, page: 5, name: 'Orange Hawaii', category: 'Tactical clothing', cost: 10 },
  { id: 22, page: 5, name: 'TarCoin ×50', category: 'Currency', cost: 7 },
  { id: 23, page: 5, name: 'Black Division target', category: 'Hideout customization', cost: 5 },
  { id: 24, page: 5, name: 'Black Division gear crate', category: 'Reward loot container', cost: 6 },
  { id: 25, page: 5, name: 'Ferro Concepts FCPC V5 Plate Carrier (Black Division)', category: 'Barter trade', cost: 7 },
  { id: 26, page: 6, name: 'Knyazev', category: 'PMC Face', cost: 13 },
  { id: 27, page: 6, name: 'O’Connor', category: 'PMC Face', cost: 12 },
  { id: 28, page: 6, name: 'Howa Type 20 5.56x45 assault rifle', category: 'Purchase option', cost: 11 },
  { id: 29, page: 7, name: 'Marked dogtag', category: 'Dogtag', cost: 10 },
  { id: 30, page: 7, name: 'TarCoin ×50', category: 'Currency', cost: 9 },
  { id: 31, page: 7, name: 'Scorpion upper', category: 'Tactical clothing', cost: 13 },
  { id: 32, page: 7, name: 'Scorpion lower', category: 'Tactical clothing', cost: 13 },
  { id: 33, page: 8, name: 'Black Division gear crate', category: 'Reward loot container', cost: 6 },
  { id: 34, page: 8, name: 'TarCoin ×50', category: 'Currency', cost: 14 },
  { id: 35, page: 8, name: 'White accent walls', category: 'Hideout customization', cost: 13 },
  { id: 36, page: 8, name: 'Arch', category: 'Mannequin pose', cost: 6 },
  { id: 37, page: 8, name: 'Dome', category: 'Mannequin pose', cost: 4 },
  { id: 38, page: 9, name: 'Spiritus Systems LV-119 Plate Carrier (Black Division V2)', category: 'Barter trade', cost: 12 },
  { id: 39, page: 9, name: 'TarCoin ×50', category: 'Currency', cost: 6 },
  { id: 40, page: 9, name: 'Tasmanian Tiger Modular Pack 45 Plus (MultiCam Black)', category: 'Barter trade', cost: 9 },
  { id: 41, page: 9, name: 'Black Division gear crate', category: 'Reward loot container', cost: 5 },
  { id: 42, page: 9, name: 'Server Room', category: 'Main menu background', cost: 18 },
  { id: 43, page: 10, name: 'Anton', category: 'PMC Voice', cost: 20 },
  { id: 44, page: 10, name: 'Garrett', category: 'PMC Voice', cost: 20 },
  { id: 45, page: 10, name: 'Black Division gear crate', category: 'Reward loot container', cost: 7 },
  { id: 46, page: 10, name: 'TarCoin ×100', category: 'Currency', cost: 13 },
  { id: 47, page: 11, name: 'Marked dogtag', category: 'Dogtag', cost: 11 },
  { id: 48, page: 11, name: 'TarCoin ×150', category: 'Currency', cost: 16 },
  { id: 49, page: 11, name: 'Knyazev (After Battle)', category: 'PMC Face', cost: 19 },
  { id: 50, page: 11, name: 'O’Connor (After Battle)', category: 'PMC Face', cost: 19 },
  { id: 51, page: 12, name: 'Norinco QBZ-191 5.8x42 assault rifle', category: 'Purchase option', cost: 29 },
  { id: 52, page: 12, name: 'Nocturnal upper', category: 'Tactical clothing', cost: 25 },
  { id: 53, page: 12, name: 'Nocturnal lower', category: 'Tactical clothing', cost: 23 },
];

export const TOTAL_COST = REWARDS.reduce((sum, reward) => sum + reward.cost, 0);
export const SEASON_END = '2026-12-07';

export function rewardsForPage(page: number): Reward[] {
  return REWARDS.filter((reward) => reward.page === page);
}

export function isPageUnlocked(page: number, claimedIds: number[]): boolean {
  const claimed = new Set(claimedIds);
  for (let current = 1; current < page; current += 1) {
    const rewards = rewardsForPage(current);
    const claimedCount = rewards.filter((reward) => claimed.has(reward.id)).length;
    if (claimedCount < rewards.length - 1) return false;
  }
  return true;
}

export function getFrontierPage(claimedIds: number[]): number {
  let frontier = 1;
  for (let page = 2; page <= 12; page += 1) {
    if (!isPageUnlocked(page, claimedIds)) break;
    frontier = page;
  }
  return frontier;
}

export function remainingCost(claimedIds: number[]): number {
  const claimed = new Set(claimedIds);
  return REWARDS.reduce((sum, reward) => sum + (claimed.has(reward.id) ? 0 : reward.cost), 0);
}

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysUntilSeasonEnd(now = new Date()): number {
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const endUtc = Date.UTC(2026, 11, 7);
  return Math.max(0, Math.ceil((endUtc - todayUtc) / 86_400_000));
}

export function getInitialState(now = new Date()): TrackerState {
  return {
    inventory: Object.fromEntries(DOCUMENT_IDS.map((id) => [id, 0])) as Record<DocumentId, number>,
    classified: 0,
    requirements: {},
    claimedIds: [],
    dailyCollected: 0,
    mode: 'seasonal',
    dailyDate: dateKey(now),
  };
}

export function normalizeState(value: Partial<TrackerState>, now = new Date()): TrackerState {
  const initial = getInitialState(now);
  const currentDate = dateKey(now);
  const sameDay = value.dailyDate === currentDate;
  return {
    ...initial,
    ...value,
    inventory: { ...initial.inventory, ...value.inventory },
    requirements: normalizeRequirements(value.requirements),
    claimedIds: Array.isArray(value.claimedIds) ? value.claimedIds : [],
    dailyCollected: sameDay ? Math.max(0, Number(value.dailyCollected) || 0) : 0,
    dailyDate: currentDate,
  };
}

function isDocumentId(value: unknown): value is DocumentId {
  return typeof value === 'string' && DOCUMENT_IDS.includes(value as DocumentId);
}

export function normalizeRequirements(value: unknown): Record<number, DocumentRequirement[]> {
  if (!value || typeof value !== 'object') return {};
  const normalized: Record<number, DocumentRequirement[]> = {};
  for (const [rewardIdText, rawRequirement] of Object.entries(value)) {
    const rewardId = Number(rewardIdText);
    const reward = REWARDS.find((item) => item.id === rewardId);
    if (!reward) continue;

    if (isDocumentId(rawRequirement)) {
      normalized[rewardId] = [{ documentId: rawRequirement, count: reward.cost }];
      continue;
    }
    if (!Array.isArray(rawRequirement)) continue;

    const consolidated = new Map<DocumentId, number>();
    for (const part of rawRequirement) {
      if (!part || typeof part !== 'object') continue;
      const candidate = part as { documentId?: unknown; count?: unknown };
      if (!isDocumentId(candidate.documentId)) continue;
      const count = Math.max(1, Math.min(reward.cost, Math.floor(Number(candidate.count) || 1)));
      consolidated.set(candidate.documentId, (consolidated.get(candidate.documentId) ?? 0) + count);
    }
    if (consolidated.size > 0) {
      normalized[rewardId] = [...consolidated].map(([documentId, count]) => ({ documentId, count }));
    }
  }
  return normalized;
}

export function requirementTotal(requirements: DocumentRequirement[]): number {
  return requirements.reduce((sum, requirement) => sum + requirement.count, 0);
}

export function isRewardConfigured(reward: Reward, state: TrackerState): boolean {
  const requirements = state.requirements[reward.id] ?? [];
  return requirements.length > 0 && requirementTotal(requirements) === reward.cost;
}

export function canAffordReward(reward: Reward, state: TrackerState): boolean {
  return isRewardConfigured(reward, state)
    && state.requirements[reward.id].every(
      (requirement) => state.inventory[requirement.documentId] >= requirement.count,
    );
}

export function getRewardDeficits(reward: Reward, state: TrackerState): Partial<Record<DocumentId, number>> {
  const deficits: Partial<Record<DocumentId, number>> = {};
  for (const requirement of state.requirements[reward.id] ?? []) {
    const deficit = Math.max(0, requirement.count - state.inventory[requirement.documentId]);
    if (deficit > 0) deficits[requirement.documentId] = deficit;
  }
  return deficits;
}

export function getPageDeficits(page: number, state: TrackerState): Partial<Record<DocumentId, number>> {
  const claimed = new Set(state.claimedIds);
  const needed = Object.fromEntries(DOCUMENT_IDS.map((id) => [id, 0])) as Record<DocumentId, number>;
  for (const reward of rewardsForPage(page)) {
    if (claimed.has(reward.id)) continue;
    for (const requirement of state.requirements[reward.id] ?? []) {
      needed[requirement.documentId] += requirement.count;
    }
  }
  const deficits: Partial<Record<DocumentId, number>> = {};
  for (const id of DOCUMENT_IDS) {
    const deficit = Math.max(0, needed[id] - state.inventory[id]);
    if (deficit > 0) deficits[id] = deficit;
  }
  return deficits;
}

export function recommendMap(deficits: Partial<Record<DocumentId, number>>) {
  const ranked = MAPS.map((map) => ({
    ...map,
    score: map.documents.reduce((sum, id) => sum + (deficits[id] ?? 0), 0),
    covered: map.documents.filter((id) => (deficits[id] ?? 0) > 0),
  })).sort((a, b) => b.score - a.score || b.covered.length - a.covered.length);
  return ranked[0]?.score > 0 ? ranked[0] : null;
}
