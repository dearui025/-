import { generateObject } from "ai";
import { z } from "zod";
import { deepseekR1 } from "./lib/ai/model";
import { tradingPrompt } from "./lib/ai/prompt";

async function testAITradingOutput() {
  console.log("开始测试AI交易决策输出...");
  
  try {
    // 模拟用户提示
    const userPrompt = `
It has been 0 minutes since you started trading. The current time is 2025-10-26T20:51:37.052Z and you've been invoked 162 times. Below, we are providing you with a variety of state data, price data, and predictive signals so you can discover alpha. Below that is your current account information, value, performance, positions, etc.

ALL OF THE PRICE OR SIGNAL DATA BELOW IS ORDERED: OLDEST → NEWEST

Timeframes note: Unless stated otherwise in a section title, intraday series are provided at 3‑minute intervals. If a coin uses a different interval, it is explicitly stated in that coin’s section.

# HERE IS THE CURRENT MARKET STATE
## ALL SOL/USDT DATA FOR YOU TO ANALYZE
Current Market State:
current_price = 197.63, current_ema20 = 197.892, current_macd = -0.095, current_rsi (7 period) = 25.460

In addition, here is the latest BTC open interest and funding rate for perps:

Open Interest: Latest: 688826030.00 Average: 688826030.00

Funding Rate: 0.00e+0

Intraday series (by minute, oldest → latest):

Mid prices: [198.1, 197.9, 198.0, 198.1, 198.1, 197.9, 197.9, 197.8, 197.6, 197.6]

EMA indicators (20‑period): [197.980, 197.976, 197.976, 197.983, 197.990, 197.979, 197.968, 197.949, 197.920, 197.892]

MACD indicators: [-0.086, -0.080, -0.071, -0.057, -0.046, -0.050, -0.054, -0.064, -0.082, -0.095]

RSI indicators (7‑Period): [60.800, 49.870, 53.420, 59.310, 59.310, 41.830, 40.210, 33.390, 25.970, 25.460]

RSI indicators (14‑Period): [50.770, 46.020, 47.930, 51.180, 51.180, 43.520, 42.710, 39.180, 34.720, 34.390]

Longer‑term context (4‑hour timeframe):

20‑Period EMA: 193.919 vs. 50‑Period EMA: 191.778

3‑Period ATR: 1.943 vs. 14‑Period ATR: 3.113

Current Volume: 3767.326 vs. Average Volume: 24025.027

MACD indicators: [1.537, 1.444, 1.566, 1.589, 1.513, 1.511, 1.794, 2.147, 2.347, 2.377]

RSI indicators (14‑Period): [56.180, 54.050, 59.470, 57.590, 54.980, 57.030, 64.200, 67.160, 65.180, 61.390]

## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
Current Total Return (percent): -1.14%
Available Cash: 9886.46
Current Account Value: 9886.46
Positions: No futures positions (using spot trading)

Please format your response as a JSON object containing the trading decision and reasoning. The response must contain the word "json" to ensure proper formatting.
The response must include these exact field names:
- "operation": Must be exactly "Buy", "Sell", or "Hold"
- "chat": A string explaining your decision
- "reasoning": Detailed reasoning for your trading decision
`;

    console.log("发送提示到DeepSeek R1模型...");
    
    const { object, reasoning } = await generateObject({
      model: deepseekR1,
      system: tradingPrompt,
      prompt: userPrompt,
      output: "object",
      mode: "json",
      schema: z.object({
        operation: z.enum(["Buy", "Sell", "Hold"]),
        buy: z
          .object({
            pricing: z.number().describe("The pricing of you want to buy in."),
            amount: z.number(),
          })
          .optional()
          .describe("If operation is buy, generate object"),
        sell: z
          .object({
            amount: z
              .number()
              .describe("Amount of asset to sell"),
          })
          .optional()
          .describe("If operation is sell, generate object"),
        adjustProfit: z
          .object({
            stopLoss: z
              .number()
              .optional()
              .describe("The stop loss of you want to set."),
            takeProfit: z
              .number()
              .optional()
              .describe("The take profit of you want to set."),
          })
          .optional()
          .describe(
            "If operation is hold and you want to adjust the profit, generate object"
          ),
        chat: z
          .string()
          .describe(
            "The reason why you do this operation, and tell me your analysis"
          ),
        reasoning: z
          .string()
          .optional()
          .describe("Detailed reasoning for the trading decision"),
      }),
    });
    
    console.log("AI响应:");
    console.log(JSON.stringify(object, null, 2));
    
    console.log("\n详细推理:");
    console.log(reasoning);
    
    // 检查buy对象是否存在
    if (object.operation === "Buy" && object.buy) {
      console.log("\n✅ Buy操作包含数量和价格信息:");
      console.log(`   价格: ${object.buy.pricing}`);
      console.log(`   数量: ${object.buy.amount}`);
    } else if (object.operation === "Buy") {
      console.log("\n❌ Buy操作但缺少buy对象");
    }
    
    console.log("✅ AI交易决策测试成功!");
    
  } catch (error) {
    console.error("❌ AI交易决策测试失败:", error.message);
    console.error("错误堆栈:", error.stack);
  }
}

testAITradingOutput();