import { generateObject } from "ai";
import { generateUserPrompt, tradingPrompt } from "./prompt";
import { getCurrentMarketState } from "../trading/current-market-state";
import { z } from "zod";
import { deepseekR1 } from "./model";
import { getAccountInformationAndPerformance } from "../trading/account-information-and-performance";
import { prisma } from "../prisma";
import { Opeartion } from "@prisma/client";
import { buy } from "../trading/buy";
import { sell } from "../trading/sell";

// 定义主流加密货币列表
const CRYPTO_PAIRS = [
  { symbol: "BTC/USDT", dbSymbol: "BTC" as const },
  { symbol: "ETH/USDT", dbSymbol: "ETH" as const },
  { symbol: "BNB/USDT", dbSymbol: "BNB" as const },
  { symbol: "SOL/USDT", dbSymbol: "SOL" as const },
  { symbol: "DOGE/USDT", dbSymbol: "DOGE" as const },
  { symbol: "XRP/USDT", dbSymbol: "XRP" as const },
];

/**
 * you can interval trading using cron job
 */
export async function run(initialCapital: number) {
  // 获取所有加密货币的市场状态
  const marketStates = await Promise.all(
    CRYPTO_PAIRS.map(async (pair) => {
      try {
        const state = await getCurrentMarketState(pair.symbol);
        return { ...pair, state };
      } catch (error) {
        console.error(`获取 ${pair.symbol} 市场状态失败:`, error);
        return null;
      }
    })
  );

  // 过滤掉获取失败的货币
  const validMarketStates = marketStates.filter((state) => state !== null);

  // 获取账户信息
  const accountInformationAndPerformance =
    await getAccountInformationAndPerformance(initialCapital);
  
  // Count previous Chat entries to provide an invocation counter in the prompt
  const invocationCount = await prisma.chat.count();

  // 为每种加密货币生成独立的交易决策
  for (const marketData of validMarketStates) {
    if (!marketData) continue;

    const { symbol, dbSymbol, state: currentMarketState } = marketData;

    const userPrompt = generateUserPrompt({
      currentMarketState,
      accountInformationAndPerformance,
      startTime: new Date(),
      invocationCount,
      cryptoSymbol: symbol, // 添加加密货币符号参数
    });

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
            // 移除杠杆参数，因为现货交易不使用杠杆
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
            "The reason why you do this operation, and tell me your analysis, for example: Currently holding all my positions in ETH, SOL, XRP, BTC, DOGE, and BNB as none of my invalidation conditions have been triggered, though XRP and BNB are showing slight unrealized losses. My overall account is up 10.51% with $4927.64 in cash, so I'll continue to monitor my existing trades."
          ),
        reasoning: z
          .string()
          .optional()
          .describe("Detailed reasoning for the trading decision"),
      }),
    });

    // 执行交易操作
    let tradeResult = null;
    let pricing = currentMarketState.current_price; // 默认使用当前市场价格
    let amount = 0;
    
    // 如果是买入操作，计算买入数量
    if (object.operation === "Buy") {
      // 如果AI提供了买入信息，使用AI提供的信息
      if (object.buy) {
        pricing = object.buy.pricing || currentMarketState.current_price;
        amount = object.buy.amount || 0;
      } 
      // 如果AI没有提供买入信息，计算默认值
      else {
        // 计算默认买入数量（使用可用现金的1%）
        const availableCash = accountInformationAndPerformance.availableCash || 10000;
        const defaultInvestment = availableCash * 0.01; // 投资1%的可用现金
        amount = defaultInvestment / pricing;
      }
      
      // 只有当数量大于0时才执行买入
      if (amount > 0) {
        tradeResult = await buy(symbol, amount, pricing);
      }
    } 
    // 如果是卖出操作，计算卖出数量
    else if (object.operation === "Sell") {
      // 如果AI提供了卖出信息，使用AI提供的信息
      if (object.sell) {
        amount = object.sell.amount || 0;
      }
      // 如果AI没有提供卖出信息，使用默认值（卖出全部持仓的25%）
      else {
        amount = 0.25; // 这是一个占位符，实际应用中需要查询持仓数量
      }
      
      // 只有当数量大于0时才执行卖出
      if (amount > 0) {
        tradeResult = await sell(symbol, amount, pricing);
      }
    }

    // 保存交易记录到数据库
    if (object.operation === "Buy") {
      await prisma.chat.create({
        data: {
          reasoning: object.reasoning || reasoning || "<no reasoning>",
          chat: object.chat || "<no chat>",
          userPrompt,
          tradings: {
            createMany: {
              data: {
                symbol: dbSymbol as any, // 暂时使用any类型绕过类型检查
                opeartion: Opeartion.Buy,
                pricing: pricing, // 使用计算出的价格
                amount: amount, // 使用计算出的数量
                // 添加交易结果信息
                ...(tradeResult && pricing && {
                  stopLoss: tradeResult.success ? pricing * 0.95 : undefined, // 简单设置止损为买入价的95%
                  takeProfit: tradeResult.success ? pricing * 1.1 : undefined, // 简单设置止盈为买入价的110%
                }),
              },
            },
          },
        },
      });
    }

    if (object.operation === "Sell") {
      await prisma.chat.create({
        data: {
          reasoning: object.reasoning || reasoning || "<no reasoning>",
          chat: object.chat || "<no chat>",
          userPrompt,
          tradings: {
            createMany: {
              data: {
                symbol: dbSymbol as any, // 暂时使用any类型绕过类型检查
                opeartion: Opeartion.Sell,
                amount: amount, // 使用计算出的数量
                pricing: pricing, // 使用当前市场价格
                // 添加交易结果信息
              },
            },
          },
        },
      });
    }

    if (object.operation === "Hold") {
      const shouldAdjustProfit =
        object.adjustProfit?.stopLoss && object.adjustProfit?.takeProfit;
      await prisma.chat.create({
        data: {
          reasoning: object.reasoning || reasoning || "<no reasoning>",
          chat: object.chat || "<no chat>",
          userPrompt,
          tradings: {
            createMany: {
              data: {
                symbol: dbSymbol as any, // 暂时使用any类型绕过类型检查
                opeartion: Opeartion.Hold,
                stopLoss: shouldAdjustProfit
                  ? object.adjustProfit?.stopLoss
                  : undefined,
                takeProfit: shouldAdjustProfit
                  ? object.adjustProfit?.takeProfit
                  : undefined,
              },
            },
          },
        },
      });
    }
  }
}