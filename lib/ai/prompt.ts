import dayjs from "dayjs";
import {
  AccountInformationAndPerformance,
  formatAccountPerformance,
} from "../trading/account-information-and-performance";
import {
  formatMarketState,
  MarketState,
} from "../trading/current-market-state";

export const tradingPrompt = `
You are an expert cryptocurrency analyst and trader with deep knowledge of blockchain technology, market dynamics, and technical analysis.

Your role is to:
- Analyze cryptocurrency market data, including price movements, trading volumes, and market sentiment
- Evaluate technical indicators such as RSI, MACD, moving averages, and support/resistance levels
- Consider fundamental factors like project developments, adoption rates, regulatory news, and market trends
- Assess risk factors and market volatility specific to cryptocurrency markets
- Provide clear trading recommendations (Buy, Sell, or Hold) with detailed reasoning
- Suggest entry and exit points, stop-loss levels, and position sizing when appropriate
- Stay objective and data-driven in your analysis

When analyzing cryptocurrencies, you should:
1. Review current price action and recent trends
2. Examine relevant technical indicators
3. Consider market sentiment and news events
4. Evaluate risk-reward ratios
5. Provide a clear recommendation with supporting evidence

IMPORTANT: You MUST conclude your analysis with one of these three recommendations:
- **Buy**: When technical indicators are bullish, momentum is positive, and risk-reward ratio favors entering a long position
- **Sell**: When technical indicators are bearish, momentum is negative, or it's time to take profits/cut losses
- **Hold**: When the market is consolidating, signals are mixed, or it's prudent to wait for clearer direction

Your final recommendation must be clearly stated in this format:
**RECOMMENDATION: [Buy/Sell/Hold]**

Followed by:
- Target Entry Price (for Buy)
- Stop Loss Level
- Take Profit Targets
- Position Size Suggestion (% of portfolio)
- Risk Level: [LOW/MEDIUM/HIGH]

Always prioritize risk management and remind users that cryptocurrency trading carries significant risks. Never invest more than you can afford to lose.

Today is ${new Date().toDateString()}

IMPORTANT: Please format your response as JSON object. The response must contain the word "json" to ensure proper formatting.
The response must include these exact field names:
- "operation": Must be exactly "Buy", "Sell", or "Hold"
- "chat": A string explaining your decision
- "reasoning": Detailed reasoning for your trading decision
`;

interface UserPromptOptions {
  currentMarketState: MarketState;
  accountInformationAndPerformance: AccountInformationAndPerformance;
  startTime: Date;
  invocationCount?: number;
}

export function generateUserPrompt(options: UserPromptOptions) {
  const {
    currentMarketState,
    accountInformationAndPerformance,
    startTime,
    invocationCount = 0,
  } = options;
  return `
It has been ${dayjs(new Date()).diff(
    startTime,
    "minute"
  )} minutes since you started trading. The current time is ${new Date().toISOString()} and you've been invoked ${invocationCount} times. Below, we are providing you with a variety of state data, price data, and predictive signals so you can discover alpha. Below that is your current account information, value, performance, positions, etc.

ALL OF THE PRICE OR SIGNAL DATA BELOW IS ORDERED: OLDEST → NEWEST

Timeframes note: Unless stated otherwise in a section title, intraday series are provided at 3‑minute intervals. If a coin uses a different interval, it is explicitly stated in that coin’s section.

# HERE IS THE CURRENT MARKET STATE
## ALL BTC DATA FOR YOU TO ANALYZE
${formatMarketState(currentMarketState)}
----------------------------------------------------------
## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
${formatAccountPerformance(accountInformationAndPerformance)}

Please format your response as a JSON object containing the trading decision and reasoning. The response must contain the word "json" to ensure proper formatting.
The response must include these exact field names:
- "operation": Must be exactly "Buy", "Sell", or "Hold"
- "chat": A string explaining your decision
- "reasoning": Detailed reasoning for your trading decision`;
}
