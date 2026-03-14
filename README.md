<p align="center">
  <img src="https://img.shields.io/badge/invest--hub--mcp-Stock_Analysis_MCP_Server-2EC4B6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0zIDEzaDJWM2gydi0ySDNWMTN6TTEyIDNoLTJ2MTBoMlYzem0xNCAxMGgtMlY3aC0ydjZIOHYyaDEwdi0yem0tMi02aDJ2Nmgydi02eiIvPjwvc3ZnPg==&logoColor=white" alt="invest-hub-mcp">
</p>

<h1 align="center">📈 invest-hub-mcp</h1>

<p align="center">
  <strong>한국 & 미국 주식 분석을 Claude Code에서. 설치 한 줄, 자연어로 분석.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/npm/v/invest-hub-mcp?color=red&logo=npm&logoColor=white" alt="npm version">
  <img src="https://img.shields.io/badge/Tools-10개-brightgreen?logo=wrench&logoColor=white" alt="Tools">
  <img src="https://img.shields.io/badge/Market-KR_|_US-blue?logo=chart-line&logoColor=white" alt="Market">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MCP-Model_Context_Protocol-purple?logo=anthropic&logoColor=white" alt="MCP">
  <img src="https://img.shields.io/badge/Node.js-≥18-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/API_Key-선택사항-orange" alt="API Key Optional">
</p>

---

## Why invest-hub-mcp?

주식 분석을 위해 여러 사이트를 돌아다닐 필요 없습니다. Claude에게 **자연어로 물어보면** 10가지 전문 도구가 자동으로 작동합니다.

| | 기존 방식 | invest-hub-mcp |
|---|---|---|
| **시세 확인** | 증권사 앱/웹 접속 | "삼성전자 시세 알려줘" |
| **기술적 분석** | 차트 프로그램 설치 | "005930 RSI, MACD 분석해줘" |
| **뉴스 분석** | 여러 사이트 검색 | "삼성전자 최근 뉴스 감성 분석" |
| **백테스트** | 전문 소프트웨어 구매 | "RSI 전략으로 3년 백테스트" |
| **미국주식** | 해외 사이트 별도 검색 | "AAPL 분석해줘" |
| **AI 분석** | 데이터 수집 후 직접 분석 | "삼성전자 종합 점수 매겨줘" |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Claude Code                            │
│                                                             │
│   사용자: "삼성전자 분석해줘"                                  │
│                                                             │
│   Claude AI ──→ get_quote + get_technical + analyze_stock   │
│                     │              │              │         │
└─────────────────────┼──────────────┼──────────────┼─────────┘
                      │              │              │
              ┌───────▼───────┐     │      ┌───────▼───────┐
              │  MCP Server   │◄────┘      │  AI Scoring   │
              │ invest-hub-mcp│            │ (GPT/Fallback)│
              └───────┬───────┘            └───────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ 한국 API │ │ 미국 API │ │ 분석엔진 │
  │──────────│ │──────────│ │──────────│
  │ Naver    │ │ Finnhub  │ │ RSI      │
  │ DART     │ │ FMP      │ │ MACD     │
  │ ECOS     │ │ FRED     │ │ Bollinger│
  │ Google   │ │          │ │ Backtest │
  └──────────┘ └──────────┘ └──────────┘
```

---

## Quick Start

### Step 1: 설치 (한 줄)

```bash
claude mcp add --transport stdio invest-hub -- npx -y invest-hub-mcp
```

> **API 키 없이도** 한국 시세, 뉴스, 기술적 분석, 스크리너, 백테스트, 공포탐욕지수를 바로 사용할 수 있습니다.

### Step 2: Claude에게 물어보기

```
사용자: 삼성전자 시세 알려줘
Claude: → get_quote("005930") 자동 호출
```

그게 끝입니다! 🎉

<details>
<summary><strong>🔑 API 키와 함께 설치 (전체 기능 활성화)</strong></summary>

```bash
claude mcp add --transport stdio invest-hub \
  --env OPENAI_API_KEY=sk-xxx \
  --env DART_API_KEY=xxx \
  --env FINNHUB_API_KEY=xxx \
  --env NAVER_CLIENT_ID=xxx \
  --env NAVER_CLIENT_SECRET=xxx \
  --env ECOS_API_KEY=xxx \
  --env FRED_API_KEY=xxx \
  -- npx -y invest-hub-mcp
```

</details>

---

## 10 Tools at a Glance

| # | 도구 | 설명 | API 키 |
|:-:|------|------|:------:|
| 1 | `get_quote` | 한국/미국 주식 실시간 시세 | 무료(KR) / Finnhub(US) |
| 2 | `analyze_stock` | AI 종합 분석 (1~10점 스코어) | OpenAI (선택) |
| 3 | `get_news` | 뉴스 검색 + 감성 분석 | 무료(Google) / Naver(선택) |
| 4 | `get_insider` | 내부자/기관 매매 동향 | DART(KR) / Finnhub(US) |
| 5 | `get_macro` | 거시경제 지표 (금리, GDP 등) | ECOS(KR) / FRED(US) |
| 6 | `screen_stocks` | 종목 스크리너 (시장/섹터/가격) | 무료 |
| 7 | `get_technical` | 기술적 분석 (RSI, MACD 등) | 무료 |
| 8 | `run_backtest` | 전략 백테스트 (5개 프리셋) | 무료 |
| 9 | `get_fear_greed` | KOSPI 공포탐욕 지수 | 무료 |
| 10 | `setup_keys` | API 키 상태 확인 + 발급 가이드 | 무료 |

### 무료 vs 유료 기능

```
무료 (API 키 불필요)                     유료 (API 키 필요)
━━━━━━━━━━━━━━━━━━━━━                   ━━━━━━━━━━━━━━━━━━━━━
✅ 한국 주식 시세 (네이버)                🔑 미국 주식 시세 (Finnhub)
✅ Google 뉴스 검색                      🔑 AI 스코어링 (OpenAI)
✅ 기술적 분석 (RSI, MACD, 볼린저)        🔑 한국 재무제표 (DART)
✅ 종목 스크리너                          🔑 내부자 거래 (DART)
✅ 전략 백테스트 (5개)                    🔑 한국 거시경제 (ECOS)
✅ 공포탐욕 지수                          🔑 미국 거시경제 (FRED)
✅ API 키 가이드                          🔑 네이버 뉴스 (Naver)
```

---

## Usage Examples

### 📊 시세 조회 — `get_quote`

한국/미국 주식의 실시간 시세를 조회합니다.

```
사용자: "삼성전자 지금 얼마야?"
사용자: "AAPL 시세 확인해줘"
사용자: "현대차 시가총액이랑 PER 알려줘"
```

응답 예시:
```json
{
  "ticker": "005930",
  "name": "삼성전자",
  "price": 58400,
  "change": -600,
  "changePercent": -1.02,
  "volume": 12345678,
  "marketCap": 348000000000000,
  "per": 12.5,
  "pbr": 1.23,
  "dividendYield": 2.45,
  "foreignRate": 55.12
}
```

---

### 🤖 AI 종합 분석 — `analyze_stock`

기술적/재무적/감성 분석을 종합하여 1~10점 스코어를 산출합니다.

```
사용자: "삼성전자 종합 분석해줘"
사용자: "AAPL AI 점수 매겨줘"
사용자: "카카오 투자 매력도 분석"
```

> **OpenAI API 키 없이도 작동합니다.** 키가 없으면 알고리즘 기반 분석으로 자동 대체됩니다.

---

### 📰 뉴스 검색 — `get_news`

종목 관련 뉴스를 검색하고 감성 분석(긍정/부정/중립)을 수행합니다.

```
사용자: "삼성전자 최근 뉴스 알려줘"
사용자: "TSLA 뉴스 감성 분석"
사용자: "LG에너지솔루션 뉴스 요약"
```

---

### 📉 기술적 분석 — `get_technical`

RSI, MACD, 이동평균, 볼린저밴드, ATR 등 주요 기술적 지표를 계산합니다.

```
사용자: "005930 기술적 분석 해줘"
사용자: "삼성전자 RSI랑 MACD 값 알려줘"
사용자: "현대차 볼린저밴드 분석"
```

제공되는 지표:

| 지표 | 설명 |
|------|------|
| RSI (14) | 과매수/과매도 판단 (30 이하: 과매도, 70 이상: 과매수) |
| MACD | 추세 전환 신호 (MACD선, Signal선, 히스토그램) |
| SMA 20/50/200 | 단순 이동평균선 |
| EMA 12/26 | 지수 이동평균선 |
| Bollinger Bands | 상단/중단/하단 밴드 (변동성 판단) |
| ATR (14) | 평균 진폭 (변동성 측정) |

---

### 🔄 전략 백테스트 — `run_backtest`

과거 데이터로 투자 전략의 성과를 시뮬레이션합니다.

```
사용자: "삼성전자 RSI 전략으로 3년 백테스트"
사용자: "005930 골든크로스 전략 수익률 알려줘"
사용자: "AAPL 볼린저밴드 전략 백테스트 해줘"
```

5개 프리셋 전략:

| 전략 | 매수 조건 | 매도 조건 |
|------|----------|----------|
| **Golden Cross** | SMA 50이 SMA 200 상향 돌파 | SMA 50이 SMA 200 하향 돌파 |
| **RSI Oversold Bounce** | RSI < 30 (과매도) | RSI > 70 (과매수) |
| **MACD Signal Cross** | MACD가 Signal선 상향 돌파 | MACD가 Signal선 하향 돌파 |
| **Bollinger Breakout** | 가격이 하단밴드 아래 | 가격이 상단밴드 위 |
| **Dual MA Trend** | EMA 20이 EMA 50 상향 돌파 | EMA 20이 EMA 50 하향 돌파 |

백테스트 결과 항목:

```
총 수익률 | CAGR | MDD | 샤프비율 | 승률 | 총 거래횟수 | 최근 10거래 내역
```

---

### 🔍 종목 스크리너 — `screen_stocks`

시장, 섹터, 가격대 등 다양한 조건으로 종목을 필터링합니다.

```
사용자: "PER 낮은 코스피 종목 찾아줘"
사용자: "반도체 섹터 종목 목록"
사용자: "시가총액 상위 종목 보여줘"
```

---

### 👤 내부자 거래 — `get_insider`

임원/대주주의 주식 매매 내역을 조회합니다.

```
사용자: "삼성전자 내부자 거래 내역"
사용자: "AAPL insider trading 확인"
```

---

### 🌍 거시경제 지표 — `get_macro`

한국은행(ECOS)과 미국 연준(FRED)의 거시경제 데이터를 조회합니다.

```
사용자: "한국 기준금리 알려줘"
사용자: "미국 GDP 성장률 확인"
사용자: "한국 소비자물가지수 추이"
```

---

### 😱 공포탐욕 지수 — `get_fear_greed`

KOSPI 시장의 공포/탐욕 수준을 0~100으로 측정합니다.

```
사용자: "지금 시장 분위기 어때?"
사용자: "공포탐욕지수 알려줘"
```

```
0 ──────── 25 ──────── 50 ──────── 75 ──────── 100
극도의 공포    공포      중립      탐욕     극도의 탐욕
```

---

### 🔑 API 키 가이드 — `setup_keys`

현재 설정된 API 키 상태와 발급 방법을 안내합니다.

```
사용자: "API 키 설정 상태 보여줘"
사용자: "어떤 API 키가 필요해?"
```

---

## API Key Setup

API 키 없이도 핵심 기능을 사용할 수 있습니다. 추가 기능이 필요할 때만 해당 키를 발급받으세요.

| API | 환경변수 | 무료 한도 | 발급처 |
|-----|---------|----------|--------|
| OpenAI | `OPENAI_API_KEY` | 종량제 | [platform.openai.com](https://platform.openai.com/api-keys) |
| DART | `DART_API_KEY` | 일 10,000건 | [opendart.fss.or.kr](https://opendart.fss.or.kr/) |
| Finnhub | `FINNHUB_API_KEY` | 60 calls/min | [finnhub.io](https://finnhub.io/register) |
| 네이버 검색 | `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET` | 일 25,000건 | [developers.naver.com](https://developers.naver.com/apps/#/register) |
| ECOS | `ECOS_API_KEY` | 일 100,000건 | [ecos.bok.or.kr](https://ecos.bok.or.kr/api/#/) |
| FRED | `FRED_API_KEY` | 무제한 | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| FMP | `FMP_API_KEY` | 일 250건 | [financialmodelingprep.com](https://site.financialmodelingprep.com/developer/docs) |

<details>
<summary><strong>📋 API 키 발급 상세 가이드</strong></summary>

### DART (한국 재무제표/내부자 거래)
1. [opendart.fss.or.kr](https://opendart.fss.or.kr/) 접속
2. 회원가입 → 로그인
3. "인증키 신청" 클릭
4. 용도: "개인 학습/연구" 선택
5. 발급된 키를 환경변수에 설정

### Finnhub (미국 주식)
1. [finnhub.io/register](https://finnhub.io/register) 접속
2. 무료 계정 생성
3. Dashboard에서 API Key 확인
4. 무료 계정: 분당 60건 요청 가능

### 네이버 검색 API
1. [developers.naver.com](https://developers.naver.com/apps/#/register) 접속
2. 애플리케이션 등록
3. "검색" API 선택
4. Client ID와 Client Secret 확인

### OpenAI (AI 분석)
1. [platform.openai.com/api-keys](https://platform.openai.com/api-keys) 접속
2. API Key 생성
3. **참고:** 키 없이도 알고리즘 기반 분석이 자동으로 작동합니다

</details>

---

## CLI Usage

MCP 서버 외에 터미널에서 직접 사용할 수도 있습니다.

```bash
# 한국 주식 시세
npx invest-hub-mcp quote 005930

# 미국 주식 시세
npx invest-hub-mcp quote AAPL --market US

# 공포탐욕 지수
npx invest-hub-mcp fear-greed

# API 키 상태 확인
npx invest-hub-mcp setup-keys
```

---

## Demonstration

### 시세 조회 결과 예시

```
$ Claude: get_quote("005930", market="KR")

  종목명           삼성전자
  ─────────────────────────────
  현재가           58,400원
  전일대비         ▼ 600 (-1.02%)
  거래량           12,345,678
  시가총액         348조원
  PER / PBR        12.5 / 1.23
  배당수익률       2.45%
  외국인비율       55.12%
```

### 기술적 분석 결과 예시

```
$ Claude: get_technical("005930")

  ┌─ 기술적 지표 ───────────────────────┐
  │ RSI (14)        : 42.3  (중립)      │
  │ MACD            : -120  (약세)      │
  │ Signal          : -85              │
  │ SMA 20          : 59,200           │
  │ SMA 50          : 60,800           │
  │ SMA 200         : 62,100           │
  │ Bollinger Upper : 63,400           │
  │ Bollinger Lower : 55,000           │
  │ ATR (14)        : 1,850            │
  ├─ 종합 신호 ─────────────────────────┤
  │ 기술적 점수     : 4.2 / 10 (약세)   │
  └─────────────────────────────────────┘
```

### 백테스트 결과 예시

```
$ Claude: run_backtest("005930", strategy="RSI Oversold Bounce", period="3y")

  전략: RSI Oversold Bounce
  기간: 3년 | 초기자금: 10,000,000원
  ────────────────────────────────────
  총 수익률       :  +23.4%
  CAGR            :  +7.3%
  MDD             :  -15.2%
  샤프비율        :  0.82
  승률            :  64.3%
  총 거래횟수     :  14회
  ────────────────────────────────────
  최근 거래:
  2025-12-03  매수  57,200원
  2026-01-15  매도  61,800원  (+8.0%)
  2026-02-20  매수  55,100원
  ...
```

---

## FAQ

<details>
<summary><strong>API 키 없이 뭘 할 수 있나요?</strong></summary>

많은 기능을 키 없이 사용할 수 있습니다:
- 한국 주식 시세 조회 (네이버 금융 기반)
- Google 뉴스 검색 + 감성 분석
- 기술적 분석 (RSI, MACD, 볼린저밴드 등 전체)
- 종목 스크리너
- 전략 백테스트 (5개 프리셋 전략)
- KOSPI 공포탐욕 지수

미국 주식, AI 분석, 재무제표 등은 해당 API 키가 필요합니다.

</details>

<details>
<summary><strong>OpenAI 키 없이 analyze_stock을 사용하면?</strong></summary>

GPT 대신 **알고리즘 기반 스코어링**이 자동 실행됩니다. 기술적 지표(RSI, MACD 등), 재무 지표(PER, PBR 등), 뉴스 감성을 조합하여 1~10점 스코어를 산출합니다. GPT 분석보다 정밀도는 낮지만 기본적인 분석은 충분합니다.

</details>

<details>
<summary><strong>한국 종목코드를 모르겠어요</strong></summary>

종목명으로 물어보면 Claude가 자동으로 종목코드를 찾아서 호출합니다.

```
사용자: "카카오 시세 알려줘"
Claude: → get_quote("035720") 자동 호출
```

주요 종목코드:
| 종목 | 코드 |
|------|------|
| 삼성전자 | 005930 |
| SK하이닉스 | 000660 |
| LG에너지솔루션 | 373220 |
| 삼성바이오로직스 | 207940 |
| 현대차 | 005380 |
| 카카오 | 035720 |
| NAVER | 035420 |

</details>

<details>
<summary><strong>백테스트 커스텀 전략을 만들 수 있나요?</strong></summary>

현재는 5개 프리셋 전략을 지원합니다. Claude에게 전략을 설명하면 가장 유사한 프리셋을 선택하여 실행합니다.

```
사용자: "RSI가 30 아래로 내려갈 때 매수하고, 70 넘으면 매도하는 전략 테스트해줘"
Claude: → run_backtest(strategy="RSI Oversold Bounce") 자동 선택
```

</details>

<details>
<summary><strong>설치 후 도구가 안 보여요</strong></summary>

MCP 서버 추가 후 **Claude Code를 재시작**해야 도구가 로드됩니다.

```bash
# 설치 확인
claude mcp list

# invest-hub: ✓ Connected 가 보이면 정상
```

</details>

<details>
<summary><strong>데이터는 실시간인가요?</strong></summary>

- **한국 시세**: 네이버 금융 기준 (장중 실시간, 장외 종가)
- **미국 시세**: Finnhub 기준 (무료 계정은 15분 지연)
- **뉴스**: Google/Naver 최신 기사
- **기술적 분석**: 최근 히스토리 데이터 기반 계산
- 결과는 5분간 캐시됩니다 (동일 요청 시 즉시 반환)

</details>

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| MCP Server | [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) |
| Language | TypeScript (100%) |
| Validation | [Zod](https://zod.dev/) |
| KR Data | Naver Finance, DART, ECOS, Google News |
| US Data | Finnhub, FMP, FRED |
| AI | OpenAI GPT-4o-mini (optional, dynamic import) |
| Analysis | RSI, MACD, SMA/EMA, Bollinger, ATR, Sentiment |
| Backtest | Custom engine with 5 preset strategies |
| Cache | In-memory LRU with TTL |
| CLI | [Commander.js](https://github.com/tj/commander.js) |

---

## Contributing

```bash
git clone https://github.com/humanist96/cli-anything-InvestHub.git
cd cli-anything-InvestHub
npm install
npm run build
```

## License

MIT License
