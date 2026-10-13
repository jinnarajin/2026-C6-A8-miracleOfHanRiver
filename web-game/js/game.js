import {
  STOCKS, STOCK_NAMES, LEVERAGES, AMOUNT_STEP, CARDS, CARD_PRICE, MAX_BUYS, ROUNDS,
  createMatch, settleRound, validatePositions, buyCard, useInformant, result, marginCallPrice, classRank, stars,
} from './engine.js';
import { MATCH1, CLASSMATES, STAGES } from './data.js';

const SCRIPT = MATCH1;
const PHASES = [['briefing', '브리핑'], ['position', '포지션'], ['operation', '작전'], ['settlement', '정산']];
const STOCK_TAGS = { semi: '성장주', bio: '뉴스 민감', bond: '안전 자산' };

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function countUp(el, from, to, dec = 1, ms = 900) {
  if (!el || from === to) return;
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = (from + (to - from) * e).toFixed(dec);
    if (k < 1) requestAnimationFrame(step);
  };
  el.textContent = from.toFixed(dec); requestAnimationFrame(step);
}
const myReturn = () => G.s.player.fund - 100;
const fmt = n => (Math.round(n * 10) / 10).toFixed(1);
const sign = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + fmt(Math.abs(n));
const pct = n => (n > 0 ? '+' : n < 0 ? '−' : '±') + Math.abs(Math.round(n * 1000) / 10) + '%';
const cls = n => (n > 0 ? 'up' : n < 0 ? 'down' : 'flat');

let G;
function reset() {
  G = {
    s: createMatch(SCRIPT), phase: 'title', draft: emptyDraft(), committed: [], selCard: null, target: null,
    oppRevealed: false, oppCard: null, hiddenRevealed: false, policyRevealed: false, priceView: null,
    pnlView: null, mcStocks: [], busy: false, log: [], quote: SCRIPT.opponent.intro, dispRound: 1,
    shown: { me: 100, opp: 100, rank: classRank(0, CLASSMATES), px: { semi: 10, bio: 10, bond: 10 } }, fresh: {}, cleared: null,
  };
}
const emptyDraft = () => Object.fromEntries(STOCKS.map(s => [s, { side: 'none', amount: 0, lev: 1 }]));
const curRound = () => SCRIPT.rounds[G.dispRound - 1];

/* ── 스테이지 스케일 ── */
function fit() {
  const k = Math.min(innerWidth / 1600, innerHeight / 900);
  $('#stage').style.transform = `translate(-50%,-50%) scale(${k})`;
}
addEventListener('resize', fit);

/* ── 그림 ── */
function portrait(kind) {
  const rival = kind === 'rival';
  const skin = rival ? '#2a1d33' : '#17223d';
  const rim = rival ? '#d4af37' : '#6c8bd6';
  return `<svg viewBox="0 0 100 100" width="100%" height="100%">
    <defs><radialGradient id="g${kind}" cx="50%" cy="30%"><stop offset="0" stop-color="${rival ? '#4a3560' : '#25365e'}"/><stop offset="1" stop-color="#05060c"/></radialGradient></defs>
    <rect width="100" height="100" fill="url(#g${kind})"/>
    <path d="M14 100 C16 76 30 66 50 66 C70 66 84 76 86 100Z" fill="${skin}" stroke="${rim}" stroke-width="1.2"/>
    <path d="M40 67 L50 84 L60 67" fill="none" stroke="${rim}" stroke-width="1.5"/>
    <circle cx="50" cy="42" r="17" fill="${skin}" stroke="${rim}" stroke-width="1.2"/>
    ${rival ? '<path d="M33 37 C36 22 64 22 67 37 C60 30 42 30 33 37Z" fill="#120a18"/><circle cx="73" cy="80" r="5" fill="none" stroke="#d4af37" stroke-width="1.5"/>' : '<path d="M33 38 C35 24 65 24 67 38 C58 33 44 31 33 38Z" fill="#0a0f1e"/>'}
  </svg>`;
}

function spark(stock) {
  const h = (G.priceView || G.s).history[stock];
  const W = 340, H = 62, min = Math.min(...h, 8), max = Math.max(...h, 12);
  const x = i => (i / ROUNDS) * (W - 8) + 4, y = v => H - 6 - ((v - min) / (max - min || 1)) * (H - 12);
  const pts = h.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const last = h[h.length - 1], c = last >= h[0] ? 'var(--up)' : 'var(--down)';
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <line x1="0" x2="${W}" y1="${y(10)}" y2="${y(10)}" stroke="rgba(255,255,255,.15)" stroke-dasharray="4 4"/>
    <polyline class="${G.fresh.spark ? 'ln' : ''}" points="${pts}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
  </svg>`;
}

function cardHTML(id, extra = '', i = '') {
  const c = CARDS[id];
  return `<div class="card ${id} ${extra}" data-i="${i}"><div class="ic">${c.icon}</div><div class="nm">${c.name}</div><div class="ds">${c.desc}</div></div>`;
}

/* ── 렌더 ── */
function render() {
  renderTop(); renderNews(); renderMarket(); renderRival(); renderLog(); renderHand(); renderAction();
}

function renderTop() {
  $('#round').innerHTML = `ROUND <b>${G.dispRound}</b> / ${ROUNDS}`;
  const idx = PHASES.findIndex(p => p[0] === G.phase);
  $('#phases').innerHTML = PHASES.map(([k, n], i) => `<li class="${i < idx ? 'done' : i === idx ? 'now' : ''}">${n}</li>`).join('');
  const me = G.s.player.fund, op = G.s.opp.fund, share = me + op ? (me / (me + op)) * 100 : 50;
  const rank = classRank(myReturn(), CLASSMATES), d = G.shown.rank - rank;
  $('#rank').innerHTML = `<small>학년 순위</small><b>#<span id="rankN">${rank}</span></b><small>/ 120</small>${d ? `<span class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'}${Math.abs(d)}</span>` : ''}`;
  $('#funds').innerHTML = `
    <div class="fundBox"><small>나 · 판 자금</small><b id="fMe" class="${cls(me - 100)}">${fmt(me)}</b></div>
    <div class="vsBar"><i style="width:${share}%"></i></div>
    <div class="fundBox opp"><small>${SCRIPT.opponent.title}</small><b id="fOp" class="${cls(op - 100)}">${fmt(op)}</b></div>`;
  countUp($('#fMe'), G.shown.me, me); countUp($('#fOp'), G.shown.opp, op); countUp($('#rankN'), G.shown.rank, rank, 0);
  G.shown.me = me; G.shown.opp = op; G.shown.rank = rank;
  $('#diaryBtn').classList.toggle('pulse', G.phase === 'briefing');
}

function renderNews() {
  const r = curRound();
  const peek = G.s.peeked ? `data-peek="정보원 보고: ${r.hidden.text}"` : '';
  const pol = r.policy;
  $('#newsRow').innerHTML = `
    <div class="news public"><div class="lbl">공개 뉴스</div><div class="txt">${r.public.text}</div></div>
    <div class="news hidden ${G.s.peeked ? 'peek' : ''}" style="padding:0;border:0">
      <div class="flip ${G.hiddenRevealed ? 'flipped' : ''}">
        <div class="face back" ${peek}><div class="q">?</div><small>비공개 뉴스 · 정산 때 공개</small></div>
        <div class="face front"><div class="lbl" style="color:#ff9aa5">비공개 뉴스 공개</div><div class="txt">${r.hidden.text}</div></div>
      </div>
    </div>
    <div class="news policy ${pol ? '' : 'none'} ${G.policyRevealed ? 'live' : ''}"><div class="lbl" style="color:#5ad1b0">학생회 중앙은행</div>
      <div class="txt">${pol ? (G.policyRevealed ? pol.text : '이번 라운드 정책 발표 예정') : '이번 라운드 발표 없음'}</div></div>`;
}

function renderMarket() {
  const view = G.priceView || G.s;
  $('#market').innerHTML = STOCKS.map(st => {
    const h = view.history[st], p = view.prices[st], prev = h.length > 1 ? h[h.length - 2] : h[0];
    const ch = prev ? (p - prev) / prev : 0;
    const targetable = G.phase === 'operation' && G.selCard != null && CARDS[G.s.player.hand[G.selCard]]?.kind === 'stock';
    return `<div class="stock panel ${targetable ? 'targetable' : ''} ${G.target === st ? 'targeted' : ''} ${G.fresh.enter ? 'enter' : ''}" style="animation-delay:${STOCKS.indexOf(st) * 0.08}s" data-stock="${st}">
      <div class="head">
        <div><div class="name">${STOCK_NAMES[st]} <span class="tag">${STOCK_TAGS[st]}</span></div></div>
        <div><div class="px ${cls(p - 10)}" data-px="${st}">${p.toFixed(2)}</div><div class="chg ${cls(ch)}">${h.length > 1 ? pct(ch) : '시작가'}</div></div>
      </div>
      ${spark(st)}
      ${G.priceView && G.lastChanges && G.lastChanges[st] ? `<div class="bigChg ${cls(G.lastChanges[st])}">${pct(G.lastChanges[st])}</div>` : ''}
      <div class="pos">${G.phase === 'position' ? posControls(st) : posChips(st)}</div>
      ${G.mcStocks.includes(st) ? '<div class="mcStamp">MARGIN CALL</div>' : ''}
    </div>`;
  }).join('');
  for (const st of STOCKS) { const p = view.prices[st]; countUp(document.querySelector(`[data-px=${st}]`), G.shown.px[st], p, 2, 1100); G.shown.px[st] = p; }
  $('#market').classList.toggle('calm', !G.fresh.chips);
  G.fresh = {};
}

function posControls(st) {
  const d = G.draft[st], maxAmt = Math.floor(G.s.player.fund / AMOUNT_STEP) * AMOUNT_STEP;
  const mc = d.side !== 'none' ? `마진콜 가격 ${marginCallPrice(G.s.prices[st], d.side, d.lev).toFixed(2)} (${d.side === 'long' ? '−' : '+'}${Math.round(100 / d.lev)}%)` : '';
  return `
    <div class="seg">
      ${[['long', '매수'], ['short', '공매도'], ['none', '관망']].map(([k, n]) => `<button class="${k} ${d.side === k ? 'on' : ''}" data-side="${k}" data-stock="${st}">${n}</button>`).join('')}
    </div>
    <div class="row">금액<input type="range" min="0" max="${maxAmt}" step="${AMOUNT_STEP}" value="${d.amount}" data-amt="${st}" ${d.side === 'none' ? 'disabled' : ''}><span class="amt">${d.amount}</span></div>
    <div class="row">배율<div class="levs">${LEVERAGES.map(l => `<button class="${l === d.lev ? 'on' : ''} ${l >= 3 ? 'hot' : ''}" data-lev="${l}" data-stock="${st}" ${d.side === 'none' ? 'disabled' : ''}>${l}x</button>`).join('')}</div></div>
    <div class="mc">${mc}</div>`;
}

function posChips(st) {
  const mine = G.committed.find(p => p.stock === st);
  const theirs = G.oppRevealed ? curRound().opponent.positions.find(p => p.stock === st) : null;
  const pnlOf = (who) => G.pnlView?.[who]?.find(p => p.stock === st);
  const chip = (who, p, label) => {
    if (!p) return `<div class="chip ${who}"><span><span class="who">${label}</span>관망</span></div>`;
    const res = pnlOf(who);
    return `<div class="chip ${who}"><span><span class="who">${label}</span><b class="${p.side === 'long' ? 'up' : 'down'}">${p.side === 'long' ? '매수' : '공매도'}</b> ${p.amount} × ${p.leverage}x</span>
      ${res ? `<span class="pnl ${cls(res.pnl)}">${sign(res.pnl)}${res.marginCall ? ' MC' : ''}</span>` : ''}</div>`;
  };
  if (G.phase === 'briefing') return `<div class="chips"><div class="chip"><span class="who">포지션 단계에서 건다</span></div></div>`;
  return `<div class="chips">${chip('me', mine, '나')}${G.oppRevealed ? chip('opp', theirs, '상대') : '<div class="chip opp"><span class="who">상대 포지션 비공개</span></div>'}</div>`;
}

function renderRival() {
  const o = SCRIPT.opponent;
  $('#rival').className = 'panel';
  $('#rival').innerHTML = `
    <div class="rivalHead"><div class="portrait">${portrait('rival')}</div>
      <div><h2>${o.title}</h2><div class="fac">${o.faction}</div><div class="quote">“${G.quote}”</div></div></div>
    <dl class="kv"><dt>판 자금</dt><dd class="${cls(G.s.opp.fund - 100)}" style="font-family:var(--mono);font-weight:700">${fmt(G.s.opp.fund)}</dd>
      <dt>스타일</dt><dd>${o.style}</dd><dt>1회차</dt><dd>${o.record}</dd></dl>
    <div class="box"><h4>상대 손패 · 작전</h4><div class="oppHand">${'<div class="miniBack"></div>'.repeat(G.s.opp.handCount)}
      ${G.oppCard ? `<div class="oppCard">${CARDS[G.oppCard.id].name} → ${STOCK_NAMES[G.oppCard.target]}</div>` : G.phase === 'operation' && G.oppRevealed ? '' : ''}</div></div>`;
}

function renderLog() {
  $('#log').innerHTML = G.log.map(l => `<li class="${l.c ? 'l-' + l.c : ''}"><span class="r">R${l.r}</span>${l.t}</li>`).join('');
  $('#log').scrollTop = 1e6;
}
const addLog = (c, t) => { G.log.push({ c, t, r: G.dispRound }); renderLog(); };

function renderHand() {
  const hand = G.s.player.hand;
  $('#handCount').textContent = `${hand.length}장 · 운용 자산 ${G.s.player.assets}`;
  $('#hand').innerHTML = hand.map((id, i) => {
    const c = CARDS[id];
    const usable = (G.phase === 'briefing' && c.kind === 'briefing' && !G.s.peeked) || (G.phase === 'operation' && c.kind === 'stock');
    return cardHTML(id, `${usable ? 'usable' : 'dim'} ${G.selCard === i ? 'sel' : ''} ${G.phase === 'deal' ? 'deal' : ''}`, i).replace('class="card', `style="animation-delay:${i * 0.18}s" class="card`);
  }).join('') + (G.phase === 'operation' ? `<button class="ghost shopBtn" id="shopBtn" ${G.s.player.buys >= MAX_BUYS ? 'disabled' : ''}>🛒 카드 구매 (${G.s.player.buys}/${MAX_BUYS})</button>` : '');
}

function renderAction() {
  const a = $('#action'); a.className = 'panel';
  const busy = G.busy;
  if (G.phase === 'briefing') {
    a.innerHTML = `<div class="hint">공개 뉴스를 읽고 <b>일기장</b>에서 이번 라운드 기록을 확인하세요.${G.s.player.hand.includes('informant') && !G.s.peeked ? '<br>정보원 카드로 비공개 뉴스를 미리 볼 수 있어요.' : ''}</div>
      <button class="cta" data-go="position" ${busy ? 'disabled' : ''}>포지션 잡기 →</button>`;
  } else if (G.phase === 'position') {
    const total = STOCKS.reduce((t, s) => t + (G.draft[s].side === 'none' ? 0 : G.draft[s].amount), 0);
    const over = total > G.s.player.fund;
    a.innerHTML = `<div class="meter">투입 <b>${total}</b> / ${fmt(G.s.player.fund)}</div>
      <div class="bar ${over ? 'over' : ''}"><i style="width:${Math.min(100, (total / G.s.player.fund) * 100)}%"></i></div>
      <div class="hint">종목마다 방향 · 금액 · 배율을 정하세요. 공개하면 상대 포지션과 동시에 뒤집힙니다.</div>
      <button class="cta" data-go="reveal" ${over ? 'disabled' : ''}>포지션 공개</button>`;
  } else if (G.phase === 'operation') {
    const id = G.selCard != null ? G.s.player.hand[G.selCard] : null;
    const ready = id && G.target;
    a.innerHTML = `<div class="hint">${!id ? '카드를 골라 시장을 흔드세요. 라운드당 1장.' : !G.target ? `<b>${CARDS[id].name}</b> — 대상 종목을 클릭하세요.` : `<b>${CARDS[id].name}</b> → <b>${STOCK_NAMES[G.target]}</b>`}</div>
      <button class="cta" data-go="operate" ${ready ? '' : 'disabled'}>작전 개시</button>
      <button class="sub" data-go="pass">카드 없이 진행</button>`;
  } else if (G.phase === 'settlement') {
    a.innerHTML = busy ? `<div class="hint">정산 중…</div><button class="cta" disabled>…</button>`
      : `<div class="hint">라운드 ${G.s.records.length} 결과 · 나 ${sign(G.s.records.at(-1).player.total)} / 상대 ${sign(G.s.records.at(-1).opp.total)}</div>
         <button class="cta" data-go="next">${G.s.over ? '결산 보기' : '다음 라운드 →'}</button>`;
  } else a.innerHTML = '';
}

/* ── 오버레이 ── */
function overlay(html) { const o = $('#overlay'); o.innerHTML = html; o.classList.toggle('show', !!html); }

function showTitle() {
  overlay(`<div class="title"><div class="sea">${[18, 38, 58, 78].map((t, i) => `<i style="top:${t}%;animation-delay:${-i * 1.7}s;opacity:${1 - i * 0.2}"></i>`).join('')}</div>
    <div class="meta">A08 · 한강의 기적 · 프로토타입</div>
    <h1>LOOP</h1><div class="tag">이번엔 살아서 나가.</div>
    <div class="meta">결산전 1 · 1학년 1학기 · 공식 결산전</div>
    <button class="cta" data-go="intro">결산전 입장</button></div>`);
}

function showIntro() {
  const o = SCRIPT.opponent;
  overlay(`<div class="vs">
    <div class="side l"><div class="big">${portrait('me')}</div><h2>나</h2><p>특례 입학생 · 무소속<br>손에는 1회차의 일기장이 있다.</p></div>
    <div class="mid">VS<small>${SCRIPT.title} · ${SCRIPT.subtitle}</small></div>
    <div class="side r"><div class="big">${portrait('rival')}</div><h2>${o.title}</h2><p>“${o.intro}”</p></div>
    <div class="stakes"><span class="stake g">승리 · 개런티</span><span class="stake p">패배 · 패널티 1</span>
      <button class="cta" data-go="diary" style="margin-left:20px">일기장 펼치기</button></div></div>`);
}

function showDiary() {
  const r = G.phase === 'intro' ? 0 : G.s.round;
  overlay(`<div class="scrim"></div><div class="modal"><div class="diary">
    <div class="page first"><div class="hand">이번엔 살아서 나가.</div><small>— 3년 뒤의 나</small></div>
    <div class="page"><div class="stamp">1회차</div><h3>${SCRIPT.title} — 투자 일지</h3>
      ${SCRIPT.diary.map((d, i) => `<div class="entry ${d.red ? 'red' : ''} ${d.round === r && r ? 'now' : ''}" style="animation-delay:${0.4 + i * 0.12}s">${d.text}</div>`).join('')}
      <button class="cta close" data-go="closeDiary">덮기</button></div></div></div>`);
}

function showShop() {
  overlay(`<div class="scrim"></div><div class="modal sheet"><h2>카드 상점</h2>
    <p>운용 자산 <b>${G.s.player.assets}</b> · 장당 ${CARD_PRICE} · 남은 구매 ${MAX_BUYS - G.s.player.buys}회</p>
    <div class="shopGrid">${SCRIPT.shop.map(id => `<div style="display:flex;flex-direction:column;gap:10px;align-items:center">${cardHTML(id, 'usable')}<button class="sub" data-buy="${id}">구매 ${CARD_PRICE}</button></div>`).join('')}</div>
    <div class="btns"><button class="sub" data-go="closeOverlay">닫기</button></div></div>`);
}

function showResult() {
  const res = result(G.s), o = SCRIPT.opponent, st = stars(res);
  const before = classRank(0, CLASSMATES), after = classRank(res.mine, CLASSMATES);
  G.cleared = { outcome: res.outcome, stars: st, rank: after };
  const word = { win: 'VICTORY', lose: 'DEFEAT', draw: 'DRAW' }[res.outcome];
  const line = res.outcome === 'win' ? '“운이 아니야. 네가 그 카드를 낼 걸 알았을 뿐이지.”' : res.outcome === 'lose' ? `${o.title}: “${o.lose}”` : '승부가 나지 않았다.';
  overlay(`<div class="scrim" style="background:rgba(5,7,13,.94)"></div><div class="res ${res.outcome}">
    <div class="word">${word}</div>
    <div class="stars">${[0, 1, 2].map(i => `<span class="${i < st ? 'on' : ''}" style="animation-delay:${0.5 + i * 0.25}s">★</span>`).join('')}</div>
    <div class="cmp"><div><small>나</small><b class="${cls(res.mine)}">${res.mine > 0 ? '+' : ''}<span id="rMine">0</span>%</b></div>
      <div><small>${o.title}</small><b class="${cls(res.theirs)}">${res.theirs > 0 ? '+' : ''}<span id="rTheirs">0</span>%</b></div></div>
    <div class="rankCard"><div><small>1학년 학년 순위</small><b>#<span id="rRank">${before}</span></b> <span class="of">/ 120</span></div>
      <div class="move" id="rMove"></div></div>
    <div class="line">${line}</div>
    <div class="reward">${res.outcome === 'win' ? `개런티 +${res.guarantee} → 운용 자산` : res.outcome === 'lose' ? '패널티 +1 · 성적 하락' : '개런티·패널티 없음'}</div>
    <div class="btns"><button class="sub" data-go="review">복기 보기</button><button class="cta" data-go="map">스테이지 맵 →</button></div></div>`);
  countUp($('#rMine'), 0, res.mine, 1, 1200); countUp($('#rTheirs'), 0, res.theirs, 1, 1200);
  setTimeout(() => {
    countUp($('#rRank'), before, after, 0, 1400);
    const mv = before - after;
    setTimeout(() => { $('#rMove').textContent = mv > 0 ? `▲ ${mv}계단 상승` : mv < 0 ? `▼ ${-mv}계단 하락` : '변동 없음'; $('#rMove').style.color = mv >= 0 ? 'var(--ok)' : 'var(--up)'; }, 1400);
  }, 900);
}

function showMap() {
  const c = G.cleared, won = c?.outcome === 'win';
  const nodes = STAGES.map(n => {
    let state = n.state;
    if (n.id === 'match1') state = won ? 'done' : 'current';
    if (n.id === 'ep4' && won) state = 'next';
    return { ...n, state };
  });
  overlay(`<div class="map">
    <h2>1학년 1학기</h2><p>결산전에서 이기고 학년 순위를 올리세요. 이번 학기 목표: <b style="color:var(--gold2)">1위로 여름방학 맞이하기</b></p>
    <div class="track"><svg><path class="base"/><path class="done"/></svg>
      ${nodes.map((n, i) => `<div class="node ${n.state} ${i % 2 ? 'lo' : 'hi'}" style="animation-delay:${i * 0.12}s">
        <div class="dot">${n.state === 'done' ? '✓' : n.state === 'locked' ? '🔒' : i}</div>
        <div class="ep">${n.ep}</div><div class="nm">${n.name}</div><div class="nt">${n.note}</div>
        <div class="st">${n.id === 'match1' && c ? '★'.repeat(c.stars) + '☆'.repeat(3 - c.stars) : ''}</div></div>`).join('')}
    </div>
    <div class="foot"><div class="rankCard" style="animation-delay:.2s"><div><small>현재 학년 순위</small><b>#${c?.rank ?? '-'}</b> <span class="of">/ 120</span></div></div>
      <div style="display:flex;gap:12px"><button class="sub" data-go="restart">결산전 1 다시 하기</button>
      <button class="cta" data-go="nextStage" ${won ? '' : 'disabled'}>${won ? 'EP4 라이벌 등장 →' : '이겨야 다음으로'}</button></div></div></div>`);
  requestAnimationFrame(() => {
    const tr = document.querySelector('.track'), box = tr.getBoundingClientRect(), k = box.width / tr.offsetWidth;
    const pts = [...tr.querySelectorAll('.dot')].map(d => { const r = d.getBoundingClientRect(); return [(r.left + r.width / 2 - box.left) / k, (r.top + r.height / 2 - box.top) / k]; });
    const path = arr => arr.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    tr.querySelector('.base').setAttribute('d', path(pts));
    const doneCount = nodes.filter(n => n.state === 'done').length + (won ? 1 : 0);
    tr.querySelector('.done').setAttribute('d', path(pts.slice(0, Math.max(1, doneCount))));
  });
}

function showReview() {
  const pos = ps => ps.length ? ps.map(p => `${STOCK_NAMES[p.stock]} ${p.side === 'long' ? '매수' : '공매도'} ${p.amount}×${p.leverage}${p.marginCall ? ' <b class="up">MC</b>' : ''}`).join('<br>') : '관망';
  const rows = G.s.records.map(r => {
    const sc = SCRIPT.rounds[r.round - 1];
    return `<tr style="animation-delay:${r.round * 0.08}s"><td class="n">R${r.round}</td><td>${sc.public.text}<br><span style="color:#ff9aa5">비공개: ${sc.hidden.text}</span></td>
      <td>${pos(r.player.positions)}</td><td>${r.playerCard ? `${CARDS[r.playerCard.id].name} → ${STOCK_NAMES[r.playerCard.target]}` : '—'}</td>
      <td class="n">${STOCKS.map(s => `${STOCK_NAMES[s]} <span class="${cls(r.changes[s])}">${pct(r.changes[s])}</span>`).join('<br>')}</td>
      <td class="n ${cls(r.player.total)}">${sign(r.player.total)}</td><td class="n ${cls(r.opp.total)}">${sign(r.opp.total)}</td></tr>`;
  }).join('');
  overlay(`<div class="scrim"></div><div class="modal sheet review"><h2>복기 — 왜 그렇게 걸었나?</h2>
    <p>라운드마다 내 판단과 결과를 다시 봅니다. 근거를 설명할 수 있는 투자자가 되는 것이 목표예요.</p>
    <table><tr><th>라운드</th><th>뉴스</th><th>내 포지션</th><th>내 카드</th><th>변동</th><th>내 손익</th><th>상대 손익</th></tr>${rows}</table>
    <div class="btns"><button class="sub" data-go="restart">처음부터 다시</button><button class="cta" data-go="map">스테이지 맵 →</button></div></div>`);
}

/* ── FX ── */
async function fxBanner(text, sub, gold = false, alarm = true) {
  const fx = $('#fx');
  fx.innerHTML = `${alarm ? '<div class="alarm"></div>' : ''}<div class="banner ${gold ? 'gold' : ''}"><b>${text}</b><small>${sub}</small></div>`;
  $('#board').classList.remove('shake'); void $('#board').offsetWidth;
  if (alarm) $('#board').classList.add('shake');
  await sleep(2200); fx.innerHTML = '';
}
function toast(msg) {
  const fx = $('#fx'); const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  fx.appendChild(t); setTimeout(() => t.remove(), 1800);
}

/* ── 흐름 ── */
function startRound() {
  G.dispRound = G.s.round; G.phase = 'briefing'; G.draft = emptyDraft(); G.committed = []; G.selCard = null; G.target = null;
  G.oppRevealed = false; G.oppCard = null; G.hiddenRevealed = false; G.policyRevealed = false;
  G.priceView = null; G.pnlView = null; G.mcStocks = []; G.lastChanges = null;
  G.fresh = { enter: true, spark: G.s.round === 1 };
  addLog('news', `공개 뉴스 — ${curRound().public.text}`);
  if (curRound().policy) addLog('policy', '중앙은행 정책 발표 예정');
  render();
}

function commitPositions() {
  const positions = STOCKS.filter(s => G.draft[s].side !== 'none' && G.draft[s].amount > 0)
    .map(s => ({ stock: s, side: G.draft[s].side, amount: G.draft[s].amount, leverage: G.draft[s].lev }));
  const err = validatePositions(G.s, positions);
  if (err) return toast(err);
  G.committed = positions; G.oppRevealed = true; G.phase = 'operation'; G.fresh = { chips: true };
  addLog('', `나 — ${positions.length ? positions.map(p => `${STOCK_NAMES[p.stock]} ${p.side === 'long' ? '매수' : '공매도'} ${p.amount}×${p.leverage}`).join(', ') : '전부 관망'}`);
  addLog('', `상대 — ${curRound().opponent.positions.map(p => `${STOCK_NAMES[p.stock]} ${p.side === 'long' ? '매수' : '공매도'} ${p.amount}×${p.leverage}`).join(', ') || '관망'}`);
  render();
}

async function operate(useCard) {
  const card = useCard ? { id: G.s.player.hand[G.selCard], target: G.target } : null;
  G.oppCard = curRound().opponent.card;
  G.phase = 'settlement'; G.busy = true;
  if (card) addLog('card', `내 작전 — ${CARDS[card.id].name} → ${STOCK_NAMES[card.target]}`);
  addLog('card', G.oppCard ? `상대 작전 — ${CARDS[G.oppCard.id].name} → ${STOCK_NAMES[G.oppCard.target]}` : '상대 작전 — 없음');
  G.quote = G.oppCard ? '이 정도면 충분하겠지.' : '…';
  const { state, events } = settleRound(G.s, SCRIPT, { positions: G.committed, card });
  if (card) { document.querySelector('.card.sel')?.classList.add('used'); await sleep(550); }
  G.selCard = null; G.target = null;
  render();
  await sleep(900);
  await playSettlement(state, events);
}

async function playSettlement(next, events) {
  for (const e of events) {
    if (e.type === 'hidden') {
      G.hiddenRevealed = true; renderNews(); addLog('hidden', `비공개 뉴스 — ${e.text}`); await sleep(1300);
    } else if (e.type === 'policy') {
      G.policyRevealed = true; renderNews(); addLog('policy', e.text); await sleep(1000);
    } else if (e.type === 'prices') {
      G.lastChanges = e.changes; G.priceView = { prices: next.prices, history: next.history }; G.fresh = { spark: true, chips: false };
      renderMarket();
      document.querySelectorAll('.stock').forEach(el => { const c = e.changes[el.dataset.stock]; if (c) el.classList.add(c > 0 ? 'flash-up' : 'flash-down'); });
      await sleep(1500);
    } else if (e.type === 'pnl') {
      G.pnlView = { ...(G.pnlView || {}), [e.who === 'player' ? 'me' : 'opp']: e.items }; G.fresh = { chips: true };
      if (e.who === 'opp') { G.s = next; G.lastChanges = null; render(); }
      addLog('', `${e.who === 'player' ? '내' : '상대'} 손익 ${sign(e.total)}`);
      await sleep(600);
    } else if (e.type === 'marginCall') {
      if (e.who === 'player') { G.mcStocks.push(e.stock); renderMarket(); }
      addLog('danger', `⚠ ${e.who === 'player' ? '내' : '상대'} ${STOCK_NAMES[e.stock]} 포지션 마진콜 — 강제 청산`);
      G.quote = e.who === 'opp' ? '…말도 안 돼.' : G.quote; renderRival();
      await fxBanner('MARGIN CALL', `${e.who === 'player' ? '내' : '상대'} ${STOCK_NAMES[e.stock]} 포지션 강제 청산`, e.who === 'opp', e.who === 'player');
    } else if (e.type === 'ko') {
      addLog('danger', `${e.who === 'player' ? '나' : '상대'} KO`);
      await fxBanner('K.O.', e.who === 'player' ? '판 자금이 바닥났다' : `${SCRIPT.opponent.title} 판 자금 소진`, e.who === 'opp', e.who === 'player');
    }
  }
  const rec = next.records.at(-1);
  if (rec.opp.total < -20) G.quote = '…이상하네. 왜 하필 거기에.';
  else if (rec.opp.total > 10) G.quote = '봐, 이게 정보의 차이야.';
  G.s = next; G.busy = false; render();
}

/* ── 입력 ── */
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-stock],.card');
  if (!t) return;
  const go = t.dataset.go;
  if (go) return act(go);
  if (t.dataset.buy) {
    const r = buyCard(G.s, t.dataset.buy);
    if (r.error) return toast(r.error);
    G.s = r.state; addLog('card', `카드 구매 — ${CARDS[t.dataset.buy].name} (운용 자산 −${CARD_PRICE})`);
    showShop(); renderHand(); return;
  }
  if (t.id === 'shopBtn') return showShop();
  if (t.id === 'diaryBtn') return showDiary();
  if (G.busy) return;
  if (t.dataset.side) { const d = G.draft[t.dataset.stock]; d.side = t.dataset.side; if (d.side === 'none') d.amount = 0; else if (!d.amount) d.amount = Math.min(30, Math.floor(G.s.player.fund / 10) * 10); renderMarket(); renderAction(); return; }
  if (t.dataset.lev) { G.draft[t.dataset.stock].lev = +t.dataset.lev; renderMarket(); return; }
  if (t.classList.contains('card') && t.classList.contains('usable') && t.dataset.i !== '') {
    const i = +t.dataset.i, id = G.s.player.hand[i];
    if (G.phase === 'briefing' && id === 'informant') {
      G.s = useInformant(G.s); addLog('card', '정보원 — 비공개 뉴스를 미리 들었다'); render(); return;
    }
    if (G.phase === 'operation') { G.selCard = G.selCard === i ? null : i; G.target = null; renderHand(); renderMarket(); renderAction(); }
    return;
  }
  if (t.classList.contains('stock') && t.classList.contains('targetable')) { G.target = t.dataset.stock; renderMarket(); renderAction(); }
});

document.addEventListener('input', e => {
  const st = e.target.dataset.amt;
  if (!st) return;
  G.draft[st].amount = +e.target.value;
  e.target.nextElementSibling.textContent = e.target.value;
  renderAction();
});

function act(go) {
  switch (go) {
    case 'intro': G.phase = 'intro'; showIntro(); break;
    case 'diary': showDiary(); break;
    case 'closeDiary':
      overlay('');
      if (G.phase === 'intro') { G.phase = 'deal'; render(); addLog('card', `카드 배정 — ${G.s.player.hand.map(h => CARDS[h].name).join(', ')}`); setTimeout(startRound, 900); }
      break;
    case 'closeOverlay': overlay(''); break;
    case 'position': G.phase = 'position'; render(); break;
    case 'reveal': commitPositions(); break;
    case 'operate': operate(true); break;
    case 'pass': operate(false); break;
    case 'next': if (G.s.over) { G.phase = 'result'; showResult(); } else startRound(); break;
    case 'review': showReview(); break;
    case 'map': showMap(); break;
    case 'nextStage': toast('EP4 · 결산전 2는 다음 버전에서!'); break;
    case 'restart': reset(); render(); showTitle(); break;
  }
}

reset(); fit(); render(); showTitle();
