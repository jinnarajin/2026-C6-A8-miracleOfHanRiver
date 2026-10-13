# LOOP — 결산전 웹 프로토타입 (PC · 가로)

결산전 1판(1:1, 5라운드)을 처음부터 끝까지 플레이할 수 있는 웹 프로토타입.
규칙은 `docs/game-design/core-loop.md`, 요소 정의는 `docs/game-design/game-elements.md` 기준.

## 실행
```sh
cd web-game
python3 -m http.server 8000
```
브라우저에서 http://localhost:8000 (1600×900 기준, 창 크기에 맞춰 자동 확대·축소)

## 테스트 (엔진)
```sh
cd web-game
node --test tests/*.test.mjs
```

## 구조
| 파일 | 역할 |
|---|---|
| `js/engine.js` | 결산전 규칙 (순수 함수, 화면과 분리) |
| `js/data.js` | 결산전 1 각본, 일기장, 동기 수익률, 스테이지 목록 |
| `js/game.js` | 화면 · 연출 · 입력 |
| `style.css` | 디자인 · 애니메이션 |

## 흐름
타이틀 → VS → 일기장 → 카드 배정 → 라운드 ×5 (브리핑 → 포지션 → 작전 → 정산) → 결과(별·학년 순위) → 복기 → 스테이지 맵
