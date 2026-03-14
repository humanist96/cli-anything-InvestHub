# invest-hub Gap Analysis

## Overall Match Rate: 90% -- PASS

| Category | Score | Status |
|----------|:-----:|:------:|
| MCP Tools (10 tools) | 100% | PASS |
| Project Structure | 93% | PASS |
| Technical Requirements | 100% | PASS |
| Build Requirements | 100% | PASS |
| CLI Requirements | 85% | WARNING |
| Service Layer | 92% | PASS |
| Convention Compliance | 92% | PASS |

## Fully Matched
- All 10 MCP tools implemented and registered
- ESM module, TypeScript Node16, Zod validation
- Dynamic import for optional openai
- In-memory LRU cache + rate limiting
- All imports relative with .js extensions
- No server-only or Next.js patterns

## Minor Gaps
- CLI exposes only 3/10 tools (quote, fear-greed, setup-keys)
- fast-xml-parser listed but unused

## Beneficial Additions
- analysis/fundamental.ts (PER/PBR/dividend scoring)
- ai/score-schema.ts (Zod output validation)
- types/krx-types.ts, types/dart-insider-types.ts

## Date
2026-03-14
