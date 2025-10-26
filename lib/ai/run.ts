import { generateObject } from "ai";
import { generateUserPrompt, tradingPrompt } from "./prompt";
import { getCurrentMarketState } from "../trading/current-market-state";
import { z } from "zod";
import { deepseekR1 } from "./model";
import { getAccountInformationAndPerformance } from "../trading/account-information-and-performance";
import { prisma } from "../prisma";
import { Opeartion, Symbol } from "@prisma/client";
import { buy } from "../trading/buy";
import { sell } from "../trading/sell";

/**
 * you can interval trading using cron job
 */
export async function run(initialCapital: number) {
  const currentMarketState = await getCurrentMarketState("BTC/USDT");
  const accountInformationAndPerformance =
    await getAccountInformationAndPerformance(initialCapital);
  // Count previous Chat entries to provide an invocation counter in the prompt
  const invocationCount = await prisma.chat.count();

  const userPrompt = generateUserPrompt({
    currentMarketState,
    accountInformationAndPerformance,
    startTime: new Date(),
    invocationCount,
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
  if (object.operation === "Buy" && object.buy) {
    tradeResult = await buy(
      "BTC/USDT",
      object.buy.amount,
      object.buy.pricing
    );
  } else if (object.operation === "Sell" && object.sell) {
    tradeResult = await sell(
      "BTC/USDT",
      object.sell.amount,
      currentMarketState.current_price
    );
  }

  if (object.operation === "Buy") {
    await prisma.chat.create({
      data: {
        reasoning: object.reasoning || reasoning || "<no reasoning>",
        chat: object.chat || "<no chat>",
        userPrompt,
        tradings: {
          createMany: {
            data: {
              symbol: Symbol.BTC,
              opeartion: Opeartion.Buy,
              pricing: object.buy?.pricing,
              amount: object.buy?.amount,
              // 移除杠杆参数
              // 添加交易结果信息
              ...(tradeResult && object.buy?.pricing && {
                stopLoss: tradeResult.success ? object.buy.pricing * 0.95 : undefined, // 简单设置止损为买入价的95%
                takeProfit: tradeResult.success ? object.buy.pricing * 1.1 : undefined, // 简单设置止盈为买入价的110%
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
              symbol: Symbol.BTC,
              opeartion: Opeartion.Sell,
              amount: object.sell?.amount,
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
              symbol: Symbol.BTC,
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