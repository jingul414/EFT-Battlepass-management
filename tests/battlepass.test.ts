import assert from 'node:assert/strict';
import test from 'node:test';
import {
  REWARDS,
  TOTAL_COST,
  canAffordReward,
  getFrontierPage,
  getInitialState,
  getPageDeficits,
  normalizeState,
  remainingCost,
  isPageUnlocked,
  recommendMap,
  rewardsForPage,
} from '../lib/battlepass.ts';

test('53개 보상 비용의 합은 501이다', () => {
  assert.equal(REWARDS.length, 53);
  assert.equal(TOTAL_COST, 501);
});

test('페이지 1에서 4개를 받으면 페이지 2가 열린다', () => {
  assert.equal(isPageUnlocked(2, [1, 2, 3]), false);
  assert.equal(isPageUnlocked(2, [1, 2, 3, 4]), true);
});

test('앞 페이지 조건을 건너뛸 수 없다', () => {
  const page2Ids = rewardsForPage(2).slice(0, 4).map((reward) => reward.id);
  assert.equal(isPageUnlocked(3, page2Ids), false);
  assert.equal(getFrontierPage(page2Ids), 1);
});

test('금융 및 프로젝트 문서가 부족하면 Customs를 추천한다', () => {
  const state = getInitialState(new Date('2026-09-01T12:00:00'));
  state.requirements = {
    1: [{ documentId: 'financial', count: 1 }],
    2: [{ documentId: 'financial', count: 3 }],
    3: [{ documentId: 'project', count: 3 }],
  };
  const recommendation = recommendMap(getPageDeficits(1, state));
  assert.equal(recommendation?.name, 'Customs');
  assert.deepEqual(recommendation?.covered, ['financial', 'project']);
});

test('한 보상에 섞인 모든 문서가 있어야 수령할 수 있다', () => {
  const state = getInitialState(new Date('2026-09-01T12:00:00'));
  state.requirements[4] = [
    { documentId: 'financial', count: 2 },
    { documentId: 'project', count: 1 },
  ];
  state.inventory.financial = 2;
  state.inventory.project = 0;
  assert.equal(canAffordReward(REWARDS[3], state), false);
  state.inventory.project = 1;
  assert.equal(canAffordReward(REWARDS[3], state), true);
});

test('복수 문서 부족량을 종류별로 합산해 맵을 추천한다', () => {
  const state = getInitialState(new Date('2026-09-01T12:00:00'));
  state.requirements[4] = [
    { documentId: 'financial', count: 2 },
    { documentId: 'project', count: 1 },
  ];
  const deficits = getPageDeficits(1, state);
  assert.equal(deficits.financial, 2);
  assert.equal(deficits.project, 1);
  assert.equal(recommendMap(deficits)?.name, 'Customs');
});

test('기존 단일 문서 저장값을 보상 총비용의 복수 요구 형식으로 변환한다', () => {
  const legacy = getInitialState(new Date('2026-09-01T12:00:00')) as unknown as Record<string, unknown>;
  legacy.requirements = { 4: 'medical' };
  const migrated = normalizeState(legacy as Partial<ReturnType<typeof getInitialState>>, new Date('2026-09-01T12:00:00'));
  assert.deepEqual(migrated.requirements[4], [{ documentId: 'medical', count: 3 }]);
});

test('수령한 보상의 비용은 남은 총비용에서 제외된다', () => {
  assert.equal(remainingCost([1, 2, 3, 4]), 491);
});

test('날짜가 바뀌면 일일 획득량만 초기화된다', () => {
  const state = getInitialState(new Date('2026-09-01T12:00:00'));
  state.inventory.financial = 17;
  state.dailyCollected = 12;
  const nextDay = normalizeState(state, new Date('2026-09-02T12:00:00'));
  assert.equal(nextDay.inventory.financial, 17);
  assert.equal(nextDay.dailyCollected, 0);
});
