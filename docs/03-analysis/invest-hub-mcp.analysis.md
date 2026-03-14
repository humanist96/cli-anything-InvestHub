# Design-Implementation Gap Analysis Report

> **Summary**: Comprehensive gap analysis between plan specification and actual implementation for invest-hub-mcp
>
> **Author**: gap-detector
> **Created**: 2026-03-14
> **Last Modified**: 2026-03-14
> **Status**: Draft

---

## Analysis Overview
- Analysis Target: invest-hub-mcp (MCP Server for Korean/US Stock Analysis)
- Design Document: Plan specification (provided inline)
- Implementation Path: `/Users/koscom/@work/cli_test/cli-anything-InvestHub/src/`
- Analysis Date: 2026-03-14

## Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| MCP Tools (10 tools) | 100% | PASS |
| Project Structure | 93% | PASS |
| Technical Requirements | 95% | PASS |
| Build Requirements | 70% | WARNING |
| CLI Requirements | 85% | WARNING |
| Service Layer | 95% | PASS |
| Convention Compliance | 92% | PASS |
| **Overall** | **90%** | PASS |

---

## 1. MCP Tools Comparison

### Design: 10 MCP Tools Required vs Implementation

| # | Tool Name | Design | Implementation | Match |
|---|-----------|--------|----------------|:-----:|
| 1 | `get_quote` | KR: free, US: FINNHUB | `src/tools/get-quote.ts` - KR via Naver Finance, US via Finnhub | PASS |
| 2 | `analyze_stock` | AI score 1-10, OPENAI optional with fallback | `src/tools/analyze-stock.ts` - OpenAI + algorithm fallback | PASS |
| 3 | `get_news` | Google free, Naver optional | `src/tools/get-news.ts` - Google + Naver + Finnhub US | PASS |
| 4 | `get_insider` | DART KR, Finnhub US | `src/tools/get-insider.ts` - DART + Finnhub | PASS |
| 5 | `get_macro` | ECOS KR, FRED US | `src/tools/get-macro.ts` - ECOS + FRED | PASS |
| 6 | `screen_stocks` | Stock screener | `src/tools/screen-stocks.ts` - Full filter/sort/paginate | PASS |
| 7 | `get_technical` | RSI, MACD, etc. | `src/tools/get-technical.ts` - RSI, MACD, BB, ATR, SMA, EMA | PASS |
| 8 | `run_backtest` | Strategy backtest | `src/tools/run-backtest.ts` - 5 preset strategies | PASS |
| 9 | `get_fear_greed` | Fear/Greed index | `src/tools/get-fear-greed.ts` - KOSPI scrape + fallback | PASS |
| 10 | `setup_keys` | API key setup guide | `src/tools/setup-keys.ts` - Status + guide text | PASS |

**Score: 10/10 (100%)**

All 10 tools are implemented and registered via `src/tools/index.ts`.

---

## 2. Project Structure Comparison

### Design vs Implementation

| Path | Design | Implementation | Match |
|------|--------|----------------|:-----:|
| `src/index.ts` | MCP server entry (shebang, McpServer, StdioServerTransport) | Shebang + McpServer + StdioServerTransport | PASS |
| `src/cli.ts` | CLI entry (commander) | Commander-based CLI | PASS |
| `src/tools/` | 10 tool files + index.ts | 10 files + index.ts (11 total) | PASS |
| `src/services/korean/` | naver-finance, naver-news, naver-ranking, dart, dart-insider, ecos | naver-finance, naver-news, dart, dart-insider, ecos (5/6) | GAP |
| `src/services/us/` | finnhub, fmp, fred | finnhub, fmp, fred (3/3) | PASS |
| `src/services/news/` | google-news | google-news (1/1) | PASS |
| `src/services/market/` | fear-greed | fear-greed (1/1) | PASS |
| `src/services/ai/` | openai (dynamic import) | openai with dynamic import (1/1) | PASS |
| `src/analysis/` | technical, sentiment | technical, sentiment, fundamental (3/2 -- extra) | PASS+ |
| `src/ai/` | scoring, us-scoring, prompts, parse-response, fallback-scoring | scoring, us-scoring, prompts, parse-response, fallback-scoring, score-schema (6/5 -- extra) | PASS+ |
| `src/backtest/` | engine, templates, types | engine, templates, types (3/3) | PASS |
| `src/data/` | stock-registry, us-stock-registry, constants, dart-corp-codes | stock-registry, us-stock-registry, constants, dart-corp-codes (4/4) | PASS |
| `src/cache/` | memory-cache (LRU with TTL) | memory-cache with LRU eviction + TTL (1/1) | PASS |
| `src/utils/` | config, validate-ticker, rate-limit | config, validate-ticker, rate-limit (3/3) | PASS |
| `src/types/` | news-types, fred-types, ecos-types, etc. | news-types, fred-types, ecos-types, dart-insider-types, krx-types (5) | PASS |

### Missing Files

| Item | Design Location | Description |
|------|-----------------|-------------|
| `naver-ranking` | services/korean/ | Plan specifies `naver-ranking` service, not implemented |

### Added Files (Design X, Implementation O)

| Item | Implementation Location | Description |
|------|------------------------|-------------|
| `fundamental.ts` | `src/analysis/fundamental.ts` | Fundamental scoring logic -- useful addition |
| `score-schema.ts` | `src/ai/score-schema.ts` | Zod schema for AI score validation -- good practice |
| `krx-types.ts` | `src/types/krx-types.ts` | KRX stock entry types -- reasonable addition |
| `dart-insider-types.ts` | `src/types/dart-insider-types.ts` | DART insider transaction types -- reasonable addition |

**Score: 14/15 folders/files match (93%)**

---

## 3. Technical Requirements Comparison

| Requirement | Design | Implementation | Match |
|------------|--------|----------------|:-----:|
| ESM module | `"type": "module"` | `package.json` line 5: `"type": "module"` | PASS |
| TypeScript + Node16 | Module: Node16, moduleResolution: Node16 | `tsconfig.json` lines 3-4: module/moduleResolution = Node16 | PASS |
| bin field | `dist/index.js` | `package.json` line 7: `"invest-hub-mcp": "./dist/index.js"` | PASS |
| Zod for MCP tool input | Zod schemas | All 10 tool files use `z.string()`, `z.enum()`, etc. | PASS |
| Dynamic import for openai | Optional dep with dynamic import | `src/services/ai/openai.ts` line 6: `await import("openai")` | PASS |
| In-memory LRU cache | LRU with TTL | `src/cache/memory-cache.ts` -- Map-based, maxSize eviction, TTL | PASS |
| Rate limiting | Rate limit utility | `src/utils/rate-limit.ts` -- checkRateLimit with window/max config | PASS |
| No "server-only" imports | Removed from Next.js | No server-only imports found | PASS |
| Relative imports with .js | `.js` extensions in imports | All imports use `.js` extensions (verified across all files) | PASS |
| No Next.js fetch options | No `{ next: { revalidate } }` | No Next.js fetch options found | PASS |
| openai as optionalDependencies | Optional dep | `package.json` line 39: `"optionalDependencies": { "openai": "^4.70.0" }` | PASS |

**Score: 11/11 (100%)**

### Minor Technical Notes

- `fast-xml-parser` is listed as a dependency but is NOT imported or used anywhere in the source code. RSS parsing in `google-news.ts` uses manual regex instead.

---

## 4. Build Requirements Comparison

| Requirement | Design | Implementation | Match |
|------------|--------|----------------|:-----:|
| `npm run build` (tsc) succeeds | Must compile | `dist/` directory does NOT exist -- build not yet run | UNVERIFIED |
| MCP tools/list returns 10 tools | 10 tools registered | Code registers 10 tools via `registerAllTools()` -- structurally correct | PASS (code) |
| setup_keys works without API keys | No keys needed | `setup_keys` calls `formatApiKeyGuide()` which only reads env vars (no throw) | PASS |

**Score: 2/3 verifiable at code level (70%)**

The `dist/` directory is absent, so `npm run build` has not been executed. This is the single largest gap. The TypeScript source appears well-structured for compilation, but build verification is pending.

---

## 5. CLI Requirements Comparison

| Requirement | Design | Implementation | Match |
|------------|--------|----------------|:-----:|
| `npx invest-hub-mcp --cli quote <ticker>` | Commander-based | `src/cli.ts` uses Commander, but pattern is `quote <ticker>` not `--cli quote <ticker>` | GAP |
| Commander-based | Commander | `import { Command } from "commander"` | PASS |
| Quote command | quote <ticker> | `program.command("quote <ticker>")` with `-m/--market` option | PASS |
| Fear/Greed CLI | fear-greed | `program.command("fear-greed")` | PASS |
| Setup keys CLI | setup-keys | `program.command("setup-keys")` | PASS |

### CLI Coverage Gap

The plan mentions `npx invest-hub-mcp --cli quote <ticker>` pattern. The implementation uses `node dist/cli.js quote <ticker>` instead. The `package.json` bin field only points to `dist/index.js` (MCP server), not to `dist/cli.js`. There is no bin entry for the CLI mode.

Additionally, the CLI only exposes 3 of the 10 tools (quote, fear-greed, setup-keys). The remaining 7 tools (analyze-stock, get-news, get-insider, get-macro, screen-stocks, get-technical, run-backtest) are only accessible via MCP protocol, not CLI.

**Score: 3.4/4 (85%)**

---

## 6. Service Layer Comparison

### Korean Services (Design: 6, Implementation: 5)

| Service | Design | Implementation | Match |
|---------|--------|----------------|:-----:|
| naver-finance | Required | `src/services/korean/naver-finance.ts` (238 lines) | PASS |
| naver-news | Required | `src/services/korean/naver-news.ts` (75 lines) | PASS |
| naver-ranking | Required | NOT IMPLEMENTED | FAIL |
| dart | Required | `src/services/korean/dart.ts` (101 lines) | PASS |
| dart-insider | Required | `src/services/korean/dart-insider.ts` (136 lines) | PASS |
| ecos | Required | `src/services/korean/ecos.ts` (103 lines) | PASS |

### US Services (Design: 3, Implementation: 3)

| Service | Design | Implementation | Match |
|---------|--------|----------------|:-----:|
| finnhub | Required | `src/services/us/finnhub.ts` (212 lines) | PASS |
| fmp | Required | `src/services/us/fmp.ts` (51 lines) | PASS |
| fred | Required | `src/services/us/fred.ts` (91 lines) | PASS |

### Other Services

| Service | Design | Implementation | Match |
|---------|--------|----------------|:-----:|
| google-news | Required | `src/services/news/google-news.ts` (87 lines) | PASS |
| fear-greed | Required | `src/services/market/fear-greed.ts` (76 lines) | PASS |
| openai | Required (dynamic) | `src/services/ai/openai.ts` (17 lines) | PASS |

**Score: 11/12 services (92%)**

---

## 7. Convention Compliance

### Naming Convention

| Convention | Expected | Actual | Match |
|-----------|----------|--------|:-----:|
| Files | kebab-case.ts | All files use kebab-case (e.g., `memory-cache.ts`, `fear-greed.ts`) | PASS |
| Functions | camelCase | `getQuote`, `getAIScore`, `runBacktest`, etc. | PASS |
| Interfaces | PascalCase | `StockQuote`, `AIScore`, `BacktestResult`, etc. | PASS |
| Constants | UPPER_SNAKE_CASE | `FIVE_MINUTES`, `ONE_HOUR`, `STOCK_LIST`, `BASE_URL`, etc. | PASS |
| Types | PascalCase | `Operator`, `Indicator`, `Factor`, etc. | PASS |

### Code Quality

| Criterion | Status | Notes |
|-----------|--------|-------|
| Immutability (readonly) | PASS | All interfaces use `readonly` properties consistently |
| Error handling | PASS | Try/catch with graceful fallbacks in all service functions |
| No console.log in lib code | PASS | `console.log` only in CLI (`cli.ts`), appropriate context |
| File size < 800 lines | PASS | Largest file: `stock-registry.ts` at 303 lines |
| Zod validation | PASS | Used for MCP tool inputs and AI score schema |
| Import order | PASS | External libs first, then internal absolute, then relative |

### Import Pattern

All imports use relative paths with `.js` extensions as required:
```typescript
import { cache, ONE_HOUR } from "../../cache/memory-cache.js"
import type { NewsArticle } from "../../types/news-types.js"
```

**Score: 92%**

---

## Differences Found

### MISSING: Design O, Implementation X

| # | Item | Design Location | Description | Impact |
|---|------|-----------------|-------------|--------|
| 1 | `naver-ranking` service | services/korean/ | Naver stock ranking service not implemented | Low |
| 2 | `dist/` build output | Project root | `npm run build` not executed, no compiled output | High |
| 3 | CLI bin for `--cli` mode | package.json bin field | No separate bin entry for CLI mode | Medium |
| 4 | CLI coverage for all 10 tools | src/cli.ts | Only 3/10 tools exposed via CLI | Medium |

### ADDED: Design X, Implementation O

| # | Item | Implementation Location | Description | Impact |
|---|------|------------------------|-------------|--------|
| 1 | `fundamental.ts` | `src/analysis/fundamental.ts` | Fundamental scoring algorithm | Low (beneficial) |
| 2 | `score-schema.ts` | `src/ai/score-schema.ts` | Zod schema for AIScore validation | Low (beneficial) |
| 3 | `krx-types.ts` | `src/types/krx-types.ts` | Type definitions for KRX stock entries | Low (beneficial) |
| 4 | `dart-insider-types.ts` | `src/types/dart-insider-types.ts` | Type definitions for DART insider data | Low (beneficial) |
| 5 | US market indices | `src/services/us/finnhub.ts` | `getUSMetrics()` function for Finnhub metrics | Low (beneficial) |

### CHANGED: Design != Implementation

| # | Item | Design | Implementation | Impact |
|---|------|--------|----------------|--------|
| 1 | CLI invocation pattern | `npx invest-hub-mcp --cli quote <ticker>` | `node dist/cli.js quote <ticker>` | Medium |
| 2 | `fast-xml-parser` usage | Listed as dependency | Dependency installed but never imported; RSS parsed with regex | Low |

---

## Detailed Findings

### 1. Build Output Missing (High Impact)

The `dist/` directory does not exist. While the TypeScript source code appears correctly structured for compilation (Node16 module resolution, .js import extensions, proper tsconfig), the build has never been run. This means:
- The MCP server cannot be started via `node dist/index.js`
- The `npx invest-hub-mcp` command will fail
- The package cannot be published to npm

**Recommendation**: Run `npm run build` and verify successful compilation.

### 2. Unused Dependency: fast-xml-parser

`fast-xml-parser` is listed in `package.json` dependencies but is never imported anywhere in the source code. The `google-news.ts` service parses RSS XML using manual regex-based extraction (`parseRssFeed` function). This is a dead dependency that adds bundle weight.

**Recommendation**: Either use `fast-xml-parser` for RSS parsing (more robust) or remove it from dependencies.

### 3. naver-ranking Service Missing

The plan specifies a `naver-ranking` service under `services/korean/`. This service would presumably provide stock ranking data (e.g., top movers, most traded). The `stock-registry.ts` partially covers this by fetching market-cap sorted stock lists from Naver, but there is no dedicated ranking service.

**Recommendation**: Either implement `naver-ranking.ts` or document that ranking functionality is covered by the stock-registry module.

### 4. CLI Incomplete Coverage

The CLI (`src/cli.ts`) only exposes 3 commands:
- `quote <ticker>` (with `--market` option)
- `fear-greed`
- `setup-keys`

Missing CLI commands: `analyze`, `news`, `insider`, `macro`, `screen`, `technical`, `backtest`

**Recommendation**: Add remaining CLI commands or document that CLI is a minimal interface with full functionality available via MCP protocol.

---

## Recommended Actions

### Immediate Actions (High Priority)
1. **Run `npm run build`** to generate the `dist/` directory and verify TypeScript compilation succeeds
2. **Remove or use `fast-xml-parser`** -- either integrate it into RSS parsing or remove the unused dependency

### Short-term Actions (Medium Priority)
3. **Add CLI bin entry** -- add `"invest-hub-mcp-cli": "./dist/cli.js"` to package.json bin field, or implement `--cli` flag handling in index.ts
4. **Expand CLI commands** -- add remaining tool commands to cli.ts for direct terminal usage

### Documentation Updates (Low Priority)
5. **Document naver-ranking scope decision** -- clarify whether stock-registry subsumes the planned naver-ranking functionality
6. **Document added files** -- update plan to reflect beneficial additions (fundamental.ts, score-schema.ts, type files)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-14 | Initial gap analysis | gap-detector |
