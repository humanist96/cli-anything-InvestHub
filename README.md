# invest-hub-mcp

Korean & US stock analysis MCP server for Claude Code.

10 tools: real-time quotes, AI scoring, technical analysis, backtesting, news sentiment, insider trading, macro indicators, stock screening, fear & greed index.

## Quick Start

```bash
# Basic install (Korean quotes, news, technicals work without API keys)
claude mcp add --transport stdio invest-hub -- npx -y invest-hub-mcp

# With API keys (full features)
claude mcp add --transport stdio invest-hub \
  --env OPENAI_API_KEY=sk-xxx \
  --env DART_API_KEY=xxx \
  --env FINNHUB_API_KEY=xxx \
  --env NAVER_CLIENT_ID=xxx \
  --env NAVER_CLIENT_SECRET=xxx \
  -- npx -y invest-hub-mcp
```

Then just ask Claude:

```
"삼성전자 분석해줘"
"AAPL insider trading check"
"PER 낮은 코스피 종목 찾아줘"
"RSI 전략으로 005930 백테스트 해줘"
```

## Tools

| Tool | Description | API Key |
|------|-------------|:-------:|
| `get_quote` | Real-time stock quotes (KR/US) | Free(KR) / Finnhub(US) |
| `analyze_stock` | AI comprehensive analysis (score 1-10) | OpenAI (optional) |
| `get_news` | News search + sentiment analysis | Free(Google) / Naver(optional) |
| `get_insider` | Insider/institutional trading | DART(KR) / Finnhub(US) |
| `get_macro` | Macro economic indicators | ECOS(KR) / FRED(US) |
| `screen_stocks` | Stock screener (market/sector/price filters) | Free |
| `get_technical` | Technical analysis (RSI, MACD, Bollinger, etc.) | Free |
| `run_backtest` | Strategy backtesting (5 presets) | Free |
| `get_fear_greed` | KOSPI Fear & Greed Index | Free |
| `setup_keys` | API key status & setup guide | Free |

### Free (no API key needed)
- Korean stock quotes & charts (Naver Finance)
- Google News search
- Technical analysis (RSI, MACD, SMA, EMA, Bollinger Bands, ATR)
- Stock screener
- Backtesting (Golden Cross, RSI Oversold, MACD Signal, Bollinger Breakout, Dual MA)
- Fear & Greed Index

### With API keys
- US stock quotes & profiles (Finnhub)
- AI scoring with GPT-4o-mini (OpenAI) — falls back to algorithmic scoring without key
- Korean financial statements & insider trading (DART)
- Korean macro indicators (ECOS / Bank of Korea)
- US macro indicators (FRED)
- Naver News search (Naver Developers)

## API Keys

Run `setup_keys` tool in Claude to see current status and setup guide.

| API | Env Variable | Free Tier | Get Key |
|-----|-------------|-----------|---------|
| OpenAI | `OPENAI_API_KEY` | Pay-as-you-go | [platform.openai.com](https://platform.openai.com/api-keys) |
| DART | `DART_API_KEY` | 10,000/day | [opendart.fss.or.kr](https://opendart.fss.or.kr/) |
| Finnhub | `FINNHUB_API_KEY` | 60 calls/min | [finnhub.io](https://finnhub.io/register) |
| Naver | `NAVER_CLIENT_ID` + `NAVER_CLIENT_SECRET` | 25,000/day | [developers.naver.com](https://developers.naver.com/apps/#/register) |
| ECOS | `ECOS_API_KEY` | 100,000/day | [ecos.bok.or.kr](https://ecos.bok.or.kr/api/#/) |
| FRED | `FRED_API_KEY` | Unlimited | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| FMP | `FMP_API_KEY` | 250/day | [financialmodelingprep.com](https://site.financialmodelingprep.com/developer/docs) |

## CLI Usage

```bash
npx invest-hub-mcp quote 005930
npx invest-hub-mcp quote AAPL --market US
npx invest-hub-mcp fear-greed
npx invest-hub-mcp setup-keys
```

## Backtest Strategies

| Strategy | Description |
|----------|-------------|
| Golden Cross | SMA 50/200 crossover |
| RSI Oversold Bounce | Buy RSI < 30, sell RSI > 70 |
| MACD Signal Cross | MACD/Signal line crossover |
| Bollinger Band Breakout | Buy below lower band, sell above upper |
| Dual MA Trend | EMA 20/50 trend following |

## Requirements

- Node.js >= 18
- Claude Code (for MCP integration)

## License

MIT
