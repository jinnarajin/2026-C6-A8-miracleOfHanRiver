import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatch, settleRound, computeChanges, positionPnl, validatePositions, buyCard, useInformant, result, marginCallPrice } from '../js/engine.js';
import { MATCH1 } from '../js/data.js';

test('시작 상태: 판 자금 100, 가격 10, 손패 3장', () => {
  const s = createMatch(MATCH1);
  assert.equal(s.player.fund, 100);
  assert.equal(s.opp.fund, 100);
  assert.deepEqual(s.prices, { chip: 10, mobile: 10, shop: 10 });
  assert.equal(s.player.hand.length, 3);
});

test('변동률 = 공개 + 비공개 + 정책 + 카드', () => {
  const ids = ['chip', 'mobile', 'shop'];
  const ch = computeChanges(MATCH1.rounds[2], [{ id: 'rumor_up', target: 'chip' }, { id: 'rumor_down', target: 'shop' }], ids);
  assert.equal(ch.chip, 0.083); // 0.033 − 0.05 + 0.10
  assert.equal(ch.shop, -0.262); // −0.112 − 0.05 − 0.10
  assert.equal(ch.mobile, -0.234);
});

test('매수·공매도 손익과 마진콜', () => {
  assert.deepEqual(positionPnl({ amount: 40, leverage: 1, side: 'long' }, 0.05), { pnl: 2, marginCall: false });
  assert.deepEqual(positionPnl({ amount: 30, leverage: 3, side: 'short' }, -0.25), { pnl: 22.5, marginCall: false });
  assert.deepEqual(positionPnl({ amount: 50, leverage: 5, side: 'long' }, -0.2), { pnl: -50, marginCall: true });
  assert.deepEqual(positionPnl({ amount: 50, leverage: 5, side: 'long' }, -0.5), { pnl: -50, marginCall: true });
});

test('마진콜 가격선', () => {
  assert.equal(marginCallPrice(10, 'long', 5), 8);
  assert.equal(marginCallPrice(10, 'short', 2), 15);
});

test('포지션 검증', () => {
  const s = createMatch(MATCH1);
  assert.equal(validatePositions(s, [{ stock: 'chip', side: 'long', amount: 110, leverage: 1 }]), '판 자금을 넘었다');
  assert.equal(validatePositions(s, [{ stock: 'chip', side: 'long', amount: 15, leverage: 1 }]), '금액은 10 단위');
  assert.equal(validatePositions(s, [{ stock: 'chip', side: 'long', amount: 50, leverage: 4 }]), '레버리지 오류');
  assert.equal(validatePositions(s, [{ stock: 'chip', side: 'long', amount: 50, leverage: 5 }, { stock: 'mobile', side: 'short', amount: 50, leverage: 1 }]), null);
});

test('카드 없이 진행하면 실제 등락률 그대로 움직인다 (닷컴버블)', () => {
  let s = createMatch(MATCH1);
  const real = [[0.019, 0.949, 0.1], [0.575, 0.495, -0.213], [-0.017, -0.234, -0.162], [0.252, -0.432, -0.26], [-0.651, -0.131, -0.781]];
  MATCH1.rounds.forEach((r, i) => {
    const ch = computeChanges({ ...r }, [], ['chip', 'mobile', 'shop']);
    assert.deepEqual([ch.chip, ch.mobile, ch.shop], real[i]);
  });
});

test('2라운드: 악재 루머로 상대 온라인몰 몰빵이 무너진다', () => {
  let s = createMatch(MATCH1);
  s = settleRound(s, MATCH1, { positions: [], card: null }).state;
  const { state, events } = settleRound(s, MATCH1, {
    positions: [{ stock: 'chip', side: 'long', amount: 40, leverage: 1 }],
    card: { id: 'rumor_down', target: 'shop' },
  });
  const r = state.records[1];
  assert.equal(r.changes.shop, -0.213); // −0.213 + 상대 호재 +0.10 + 내 악재 −0.10
  assert.equal(r.opp.total, -38.3);    // 60 × 3 × −0.213
  assert.equal(r.player.total, 23);    // 40 × 0.575
  assert.equal(state.player.hand.includes('rumor_down'), false);
  assert.equal(events[0].type, 'hidden');
});

test('판 자금이 0이 되면 KO로 즉시 종료', () => {
  let s = createMatch(MATCH1);
  s = settleRound(s, MATCH1, { positions: [], card: null }).state;
  const { state, events } = settleRound(s, MATCH1, {
    positions: [{ stock: 'shop', side: 'long', amount: 100, leverage: 5 }], card: null,
  }); // 온라인몰 −11.3% × 5배 = −56.5% → 마진콜 아님
  assert.equal(state.player.ko, false);
  const k = settleRound(s, MATCH1, { positions: [{ stock: 'shop', side: 'long', amount: 100, leverage: 5 }], card: { id: 'rumor_down', target: 'shop' } });
  assert.equal(k.state.player.fund, 0); // −21.3% × 5 = −106.5% → 마진콜
  assert.equal(k.state.over, true);
  assert.ok(k.events.some(e => e.type === 'ko' && e.who === 'player'));
  assert.equal(result(k.state).outcome, 'lose');
});

test('5라운드 후 결산, 승리 시 개런티', () => {
  let s = createMatch(MATCH1);
  for (let i = 0; i < 5; i++) s = settleRound(s, MATCH1, { positions: [], card: null }).state;
  assert.equal(s.over, true);
  const res = result(s);
  assert.equal(res.mine, 0);
  assert.equal(res.outcome, res.theirs < 0 ? 'win' : res.theirs > 0 ? 'lose' : 'draw');
});

test('카드 구매: 운용 자산 10, 판당 2회', () => {
  let s = createMatch(MATCH1);
  s = buyCard(s, 'rumor_up').state;
  s = buyCard(s, 'rumor_up').state;
  assert.equal(s.player.assets, 80);
  assert.equal(s.player.hand.length, 5);
  assert.equal(buyCard(s, 'rumor_up').error, '한 판에 2번까지');
});

test('정보원은 한 번 쓰면 사라진다', () => {
  let s = useInformant(createMatch(MATCH1));
  assert.equal(s.peeked, true);
  assert.equal(s.player.hand.includes('informant'), false);
});

import { classRank, stars } from '../js/engine.js';
import { CLASSMATES } from '../js/data.js';

test('학년 순위와 별', () => {
  assert.equal(CLASSMATES.length, 119);
  assert.equal(classRank(1000, CLASSMATES), 1);
  assert.equal(classRank(-1000, CLASSMATES), 120);
  assert.equal(classRank(10, [20, 5, 10]), 2);
  assert.equal(stars({ outcome: 'win', mine: 120 }), 3);
  assert.equal(stars({ outcome: 'win', mine: 60 }), 2);
  assert.equal(stars({ outcome: 'win', mine: 5 }), 1);
  assert.equal(stars({ outcome: 'lose', mine: 5 }), 0);
});
