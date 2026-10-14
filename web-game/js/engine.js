// 결산전 엔진: 화면과 분리된 순수 함수. 규칙은 docs/game-design/core-loop.md 기준.

export const START_FUND = 100;
export const START_PRICE = 10;
export const ROUNDS = 5;
export const LEVERAGES = [1, 2, 3, 5];
export const AMOUNT_STEP = 10;
export const CARD_PRICE = 10;
export const MAX_BUYS = 2;

export const CARDS = {
  rumor_up: { name: '호재 루머', kind: 'stock', effect: 0.10, desc: '지정 종목 +10%', icon: '▲' },
  rumor_down: { name: '악재 루머', kind: 'stock', effect: -0.10, desc: '지정 종목 −10%', icon: '▼' },
  informant: { name: '정보원', kind: 'briefing', desc: '브리핑 때 비공개 뉴스를 미리 본다', icon: '◉' },
};

const r1 = n => Math.round(n * 10) / 10;
const r2 = n => Math.round(n * 100) / 100;

export function createMatch(script, { assets = 100 } = {}) {
  const stocks = script.stocks.map(s => s.id);
  const prices = Object.fromEntries(stocks.map(s => [s, START_PRICE]));
  return {
    id: script.id,
    stocks,
    round: 1,
    prices,
    history: Object.fromEntries(stocks.map(s => [s, [START_PRICE]])),
    player: { fund: START_FUND, hand: [...script.hand], assets, buys: 0, ko: false },
    opp: { fund: START_FUND, handCount: script.oppHandCount ?? 3, ko: false },
    peeked: false,
    records: [],
    over: false,
  };
}

export function marginCallPrice(price, side, leverage) {
  const move = 1 / leverage;
  return r2(side === 'short' ? price * (1 + move) : price * (1 - move));
}

export function validatePositions(state, positions) {
  let total = 0;
  for (const p of positions) {
    if (!state.stocks.includes(p.stock)) return '알 수 없는 종목';
    if (!['long', 'short'].includes(p.side)) return '방향 오류';
    if (!LEVERAGES.includes(p.leverage)) return '레버리지 오류';
    if (p.amount <= 0 || p.amount % AMOUNT_STEP) return `금액은 ${AMOUNT_STEP} 단위`;
    total += p.amount;
  }
  if (total > state.player.fund + 1e-9) return '판 자금을 넘었다';
  return null;
}

export function buyCard(state, cardId) {
  const p = state.player;
  if (p.buys >= MAX_BUYS) return { state, error: `한 판에 ${MAX_BUYS}번까지` };
  if (p.assets < CARD_PRICE) return { state, error: '운용 자산 부족' };
  return {
    state: { ...state, player: { ...p, assets: p.assets - CARD_PRICE, buys: p.buys + 1, hand: [...p.hand, cardId] } },
    error: null,
  };
}

export function useInformant(state) {
  const i = state.player.hand.indexOf('informant');
  if (i < 0 || state.peeked) return state;
  const hand = state.player.hand.filter((_, k) => k !== i);
  return { ...state, peeked: true, player: { ...state.player, hand } };
}

export function computeChanges(round, cards, stocks) {
  const ch = Object.fromEntries(stocks.map(s => [s, 0]));
  const add = eff => { for (const [s, v] of Object.entries(eff || {})) ch[s] += v; };
  add(round.public.effect);
  add(round.hidden.effect);
  if (round.policy) add(round.policy.effect);
  for (const c of cards) if (c && CARDS[c.id]?.kind === 'stock') ch[c.target] += CARDS[c.id].effect;
  for (const s of stocks) ch[s] = Math.round(ch[s] * 1000) / 1000;
  return ch;
}

export function positionPnl(pos, change) {
  const dir = pos.side === 'short' ? -1 : 1;
  const raw = pos.amount * pos.leverage * change * dir;
  if (raw <= -pos.amount) return { pnl: -pos.amount, marginCall: true };
  return { pnl: r1(raw), marginCall: false };
}

function applySide(side, positions, changes) {
  const items = positions.map(p => ({ ...p, ...positionPnl(p, changes[p.stock]) }));
  const total = r1(items.reduce((a, b) => a + b.pnl, 0));
  const fund = Math.max(0, r1(side.fund + total));
  return { items, total, side: { ...side, fund, ko: fund <= 0 } };
}

// 한 라운드 정산. input = { positions, card: {id,target}|null }
export function settleRound(state, script, input) {
  const round = script.rounds[state.round - 1];
  const err = validatePositions(state, input.positions);
  if (err) throw new Error(err);
  const playerCard = input.card || null;
  if (playerCard && !state.player.hand.includes(playerCard.id)) throw new Error('손패에 없는 카드');
  const oppCard = round.opponent.card || null;
  const changes = computeChanges(round, [playerCard, oppCard], state.stocks);

  const prices = {}, history = {};
  for (const s of state.stocks) {
    prices[s] = Math.max(0.5, r2(state.prices[s] * (1 + changes[s])));
    history[s] = [...state.history[s], prices[s]];
  }

  let hand = state.player.hand;
  if (playerCard) {
    const i = hand.indexOf(playerCard.id);
    hand = hand.filter((_, k) => k !== i);
  }
  const me = applySide({ ...state.player, hand }, input.positions, changes);
  const op = applySide({ ...state.opp, handCount: Math.max(0, state.opp.handCount - (oppCard ? 1 : 0)) }, round.opponent.positions, changes);

  const events = [{ type: 'hidden', text: round.hidden.text }];
  if (round.policy) events.push({ type: 'policy', text: round.policy.text });
  events.push({ type: 'prices', changes, prices });
  events.push({ type: 'pnl', who: 'player', items: me.items, total: me.total });
  events.push({ type: 'pnl', who: 'opp', items: op.items, total: op.total });
  for (const it of me.items) if (it.marginCall) events.push({ type: 'marginCall', who: 'player', stock: it.stock });
  for (const it of op.items) if (it.marginCall) events.push({ type: 'marginCall', who: 'opp', stock: it.stock });
  if (me.side.ko) events.push({ type: 'ko', who: 'player' });
  if (op.side.ko) events.push({ type: 'ko', who: 'opp' });

  const record = {
    round: state.round, changes, playerCard, oppCard,
    player: { positions: me.items, total: me.total, fund: me.side.fund },
    opp: { positions: op.items, total: op.total, fund: op.side.fund },
  };
  const over = me.side.ko || op.side.ko || state.round >= ROUNDS;
  return {
    state: {
      ...state, prices, history, player: me.side, opp: op.side, peeked: false,
      records: [...state.records, record], round: over ? state.round : state.round + 1, over,
    },
    events,
  };
}

export function result(state) {
  const ret = p => r1(((p.fund - START_FUND) / START_FUND) * 100);
  const mine = ret(state.player), theirs = ret(state.opp);
  let outcome;
  if (state.player.ko && !state.opp.ko) outcome = 'lose';
  else if (state.opp.ko && !state.player.ko) outcome = 'win';
  else outcome = mine > theirs ? 'win' : mine < theirs ? 'lose' : 'draw';
  const guarantee = outcome === 'win' ? Math.round(20 + Math.max(0, mine / 100) * 50) : 0;
  return { outcome, mine, theirs, guarantee, penalty: outcome === 'lose' ? 1 : 0 };
}

// 학년 순위: 나보다 수익률이 높은 동기 수 + 1
export function classRank(mineReturn, others) {
  return 1 + others.filter(r => r > mineReturn).length;
}

// 별: 승리 1개, 수익률 50% 이상 2개, 100% 이상 3개
export function stars(res) {
  if (res.outcome !== 'win') return 0;
  return res.mine >= 100 ? 3 : res.mine >= 50 ? 2 : 1;
}
