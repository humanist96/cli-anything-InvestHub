# invest-hub Plan

## Overview
vibe_idea(Next.js 웹앱, 29+ 금융 API 통합)의 핵심 분석 기능을 MCP 서버 + CLI로 재패키징.
일반 사용자가 Claude Code에서 `claude mcp add` 한 줄로 설치/사용 가능한 npm 패키지.

## Scope
- npm 패키지명: `invest-hub-mcp`
- 10개 MCP 도구 (get_quote, analyze_stock, get_news, get_insider, get_macro, screen_stocks, get_technical, run_backtest, get_fear_greed, setup_keys)
- 한국/미국 시장 지원
- API 키 없이도 주요 기능 사용 가능

## Implementation Phases
1. 프로젝트 기반 설정 (package.json, tsconfig, entry points)
2. 무료 기능 (Naver Finance, Google News, Fear-Greed, Technical Analysis)
3. 한국 시장 심화 (DART, ECOS, Stock Registry)
4. 미국 시장 (Finnhub, FMP, FRED)
5. AI 분석 (OpenAI scoring with fallback)
6. 백테스트 (Engine + 5 preset strategies)
7. 배포 (README, GitHub, npm publish)

## Source
- Origin: https://github.com/humanist96/vibe_idea
- Target: https://github.com/humanist96/cli-anything-InvestHub.git
