// 결산전 1 각본 (바이블 EP3). 시세는 닷컴버블 실제 데이터, 종목명은 가상.
// 문장은 시리우스, effect 수치는 엘레나가 채운다.
// 이름은 바이블상 [미정]이라 직함으로 부른다.

export const MATCH1 = {
  id: 'match1',
  title: '결산전 1',
  subtitle: '1학년 1학기 · 공식 결산전 · 1:1',
  stocks: [
    { id: 'chip', name: '반도체', tag: '대형 기술주', ref: 'INTC' },
    { id: 'mobile', name: '통신칩', tag: '성장주', ref: 'QCOM' },
    { id: 'shop', name: '온라인몰', tag: '인터넷', ref: 'AMZN' },
  ],
  era: { label: '1999.10 – 2001.04 닷컴버블', source: '인텔·퀄컴·아마존 실제 종가의 라운드별 등락률 (종목명은 가상)' },
  hand: ['rumor_up', 'rumor_down', 'informant'],
  oppHandCount: 3,
  shop: ['rumor_up', 'rumor_down'],
  opponent: {
    title: '귀족가 학생',
    faction: '명문가 자제',
    style: '1회차 기록 그대로 움직인다. 뜨는 종목에 크게 거는 버릇.',
    record: '1회차 결산전 1 승리 (주인공 상대)',
    intro: '특례 입학생? 운 좋게 들어왔으면 조용히 있지 그래.',
    win: '…이번엔 운이 좋았네.',
    lose: '봐, 판은 원래 이렇게 기울어 있어.',
  },
  diary: [
    { round: 0, text: '결산전 1. 상대는 귀족가 학생. 나는 이 판을 졌다.', red: false },
    { round: 1, text: '1R — 통신칩 초대형 계약. 통신주가 두 배 가까이 뛰었다.', red: true },
    { round: 2, text: '2R — 상대 온라인몰 3배 몰빵. 적자 보고서 유출로 크게 잃음.', red: true },
    { round: 3, text: '3R — 중앙은행 금리 인상. 기술주 일제히 하락.', red: true },
    { round: 4, text: '4R — 반도체만 오르고 통신칩은 반토막. 상대는 통신칩 2배.', red: false },
    { round: 5, text: '5R — 거품이 터졌다. 반도체 −65%, 온라인몰 −78%. 상대 마진콜.', red: true },
  ],
  // effect 합계 = 실제 등락률. 공개 뉴스는 일부만 알려주고 나머지는 비공개 뉴스에 있다.
  rounds: [
    {
      public: { text: '온라인몰, 연말 대목 기대감', effect: { shop: 0.05 } },
      hidden: { text: '통신칩 초대형 공급 계약 체결', effect: { mobile: 0.949, chip: 0.019, shop: 0.05 } },
      policy: null,
      opponent: { positions: [{ stock: 'shop', side: 'long', amount: 50, leverage: 1 }], card: { id: 'rumor_up', target: 'shop' } },
    },
    {
      public: { text: '교내 기술주 지수 사상 최고치 경신', effect: { chip: 0.15, mobile: 0.15 } },
      hidden: { text: '온라인몰 적자 확대 — 감사 보고서 유출', effect: { chip: 0.425, mobile: 0.345, shop: -0.213 } },
      policy: null,
      opponent: { positions: [{ stock: 'shop', side: 'long', amount: 60, leverage: 3 }], card: { id: 'rumor_up', target: 'shop' } },
    },
    {
      public: { text: '중앙은행 기준금리 결정 임박', effect: {} },
      hidden: { text: '기술주 차익 실현 매물 폭주', effect: { chip: 0.033, mobile: -0.184, shop: -0.112 } },
      policy: { text: '학생회 중앙은행: 기준금리 0.5%p 인상', effect: { chip: -0.05, mobile: -0.05, shop: -0.05 } },
      opponent: { positions: [{ stock: 'mobile', side: 'long', amount: 40, leverage: 2 }], card: { id: 'rumor_down', target: 'chip' } },
    },
    {
      public: { text: '반도체 수요 사상 최대', effect: { chip: 0.10 } },
      hidden: { text: '통신칩 실적 경고 — 성장 둔화', effect: { chip: 0.152, mobile: -0.432, shop: -0.26 } },
      policy: null,
      opponent: { positions: [{ stock: 'mobile', side: 'long', amount: 50, leverage: 2 }], card: null },
    },
    {
      public: { text: '반도체 재고 증가 경고', effect: { chip: -0.10 } },
      hidden: { text: '기술주 거품 붕괴 — 투자금 대탈출', effect: { chip: -0.551, mobile: -0.131, shop: -0.781 } },
      policy: null,
      opponent: { positions: [{ stock: 'chip', side: 'long', amount: 50, leverage: 3 }], card: { id: 'rumor_up', target: 'chip' } },
    },
  ],
};

// 1학년 동기 120명 중 나를 뺀 119명의 결산전 1 수익률(%). 고정 시드라 매번 같다.
export const CLASSMATES = (() => {
  let seed = 20261013;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  return Array.from({ length: 119 }, () => Math.round(((rnd() + rnd() + rnd()) / 3 - 0.45) * 160 * 10) / 10);
})();

// 1학기 스테이지 (바이블 타임라인)
export const STAGES = [
  { id: 'prologue', ep: '프롤로그', name: '바다', note: '사설 결산전 · 1회차의 끝', state: 'done' },
  { id: 'ep1', ep: 'EP1–2', name: '두 번째 입학', note: '일기장 · 오리엔테이션', state: 'done' },
  { id: 'match1', ep: 'EP3', name: '결산전 1', note: '1:1 · 귀족가 학생', state: 'current' },
  { id: 'ep4', ep: 'EP4', name: '라이벌 등장', note: '채권 발행', state: 'locked' },
  { id: 'match2', ep: 'EP5', name: '결산전 2', note: '1:1 · 재벌가 라이벌', state: 'locked' },
  { id: 'match3', ep: 'EP6', name: '결산전 3', note: '1:1:1 · 기말', state: 'locked' },
  { id: 'summer', ep: '막간', name: '여름방학', note: '데모 엔딩', state: 'locked' },
];
