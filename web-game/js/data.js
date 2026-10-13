// 결산전 1 각본 (바이블 EP3). 문장은 시리우스, effect 수치는 엘레나가 채운다.
// 이름은 바이블상 [미정]이라 직함으로 부른다.

export const MATCH1 = {
  id: 'match1',
  title: '결산전 1',
  subtitle: '1학년 1학기 · 공식 결산전 · 1:1',
  hand: ['rumor_up', 'rumor_down', 'informant'],
  oppHandCount: 3,
  shop: ['rumor_up', 'rumor_down'],
  opponent: {
    title: '귀족가 학생',
    faction: '명문가 자제',
    style: '1회차 기록 그대로 움직인다. 한 종목에 크게 거는 버릇.',
    record: '1회차 결산전 1 승리 (주인공 상대)',
    intro: '특례 입학생? 운 좋게 들어왔으면 조용히 있지 그래.',
    win: '…이번엔 운이 좋았네.',
    lose: '봐, 판은 원래 이렇게 기울어 있어.',
  },
  diary: [
    { round: 0, text: '결산전 1. 상대는 귀족가 학생. 나는 이 판을 졌다.', red: false },
    { round: 1, text: '1R — 상대 반도체 매수 50. 수출 기사 보고 바로 들어옴.', red: false },
    { round: 2, text: '2R — 상대 바이오에 3배 몰빵. 임상 "지연" 발표로 크게 잃음.', red: true },
    { round: 3, text: '3R — 중앙은행 금리 동결. 반도체 대형 수주 터짐. 상대는 국채.', red: true },
    { round: 4, text: '4R — 상대 국채 공매도 3배. 외국인 매수로 국채 반등.', red: false },
    { round: 5, text: '5R — 반도체 업황 반등 발표. 상대는 반도체 공매도.', red: true },
  ],
  rounds: [
    {
      public: { text: '반도체 수출 호조 전망', effect: { semi: 0.08 } },
      hidden: { text: '국채 수요 증가', effect: { bond: 0.05 } },
      policy: null,
      opponent: {
        positions: [{ stock: 'semi', side: 'long', amount: 50, leverage: 1 }],
        card: { id: 'rumor_up', target: 'semi' },
      },
    },
    {
      public: { text: '바이오 신약 임상 결과 다음 주 발표', effect: { bio: 0.05 } },
      hidden: { text: '임상 일정 지연 공시', effect: { bio: -0.30 } },
      policy: null,
      opponent: {
        positions: [{ stock: 'bio', side: 'long', amount: 60, leverage: 3 }],
        card: { id: 'rumor_up', target: 'bio' },
      },
    },
    {
      public: { text: '중앙은행 기준금리 발표 임박', effect: {} },
      hidden: { text: '반도체 대형 수주 계약', effect: { semi: 0.15 } },
      policy: { text: '학생회 중앙은행: 기준금리 동결', effect: { semi: 0.05 } },
      opponent: {
        positions: [{ stock: 'bond', side: 'long', amount: 40, leverage: 2 }],
        card: { id: 'rumor_down', target: 'semi' },
      },
    },
    {
      public: { text: '국채 발행 물량 확대', effect: { bond: -0.05 } },
      hidden: { text: '외국인 국채 대량 매수', effect: { bond: 0.12 } },
      policy: null,
      opponent: {
        positions: [{ stock: 'bond', side: 'short', amount: 40, leverage: 3 }],
        card: null,
      },
    },
    {
      public: { text: '반도체 재고 증가 우려', effect: { semi: -0.05 } },
      hidden: { text: '반도체 업황 반등 공식 발표', effect: { semi: 0.20 } },
      policy: null,
      opponent: {
        positions: [{ stock: 'semi', side: 'short', amount: 50, leverage: 2 }],
        card: { id: 'rumor_down', target: 'semi' },
      },
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
