# EFT BattlePass Operations

Escape from Tarkov 시즌 1 `KORD BREACH`의 문서 재고와 보상 진행을 관리하는 로컬 우선 웹 앱입니다.

## 현재 구현 범위

- 12페이지, 53개 보상과 총 비용 501개 데이터
- 8종 일반 문서 및 기밀 문서 재고 관리
- 53개 보상 각각에 서로 다른 복수 문서 종류와 수량 조합 설정
- 보상 수령 시 재고 차감 및 수령 취소
- 페이지별 `전체 보상 - 1개` 수령 조건에 따른 자동 해금
- 혼합 요구량 합계 검증과 수령 가능, 부족, 잠김, 설정 필요 상태 계산
- 최전선 페이지의 부족 문서를 바탕으로 파밍 맵 추천
- Seasonal/PvP/PvE 일일 한도와 시즌 종료일까지의 일평균 목표
- 브라우저 `localStorage` 자동 저장 및 날짜 변경 시 일일 획득량 초기화

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 주소(기본값 `http://localhost:5173`)를 브라우저에서 여세요.

## 검증

```bash
npm test
npm run lint
npm run build
```

`npm run build` 결과는 `dist` 폴더에 생성됩니다. GitHub Actions 환경에서는 저장소 이름인 `/EFT-Battlepass-management/`를 기본 경로로 사용하도록 설정되어 있습니다.

## 데이터 저장

현재 진행 상태는 서버가 아니라 사용 중인 브라우저에만 저장됩니다. 브라우저 사이트 데이터를 삭제하거나 다른 브라우저·기기를 사용하면 기록이 공유되지 않습니다.
