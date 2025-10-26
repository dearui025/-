import { Position } from "ccxt";
import { binance } from "./biance";
import { prisma } from "../prisma";
import { Opeartion } from "@prisma/client";

export interface AccountInformationAndPerformance {
  currentPositionsValue: number;
  contractValue: number;
  totalCashValue: number;
  availableCash: number;
  currentTotalReturn: number;
  positions: any[]; // 现货交易持仓
  sharpeRatio: number;
}

export async function getAccountInformationAndPerformance(
  initialCapital: number
): Promise<AccountInformationAndPerformance> {
  try {
    // 获取现货账户余额
    const balance: any = await binance.fetchBalance();
    const totalCashValue = (balance.total && balance.total['USDT']) ? balance.total['USDT'] : 0;
    const availableCash = (balance.free && balance.free['USDT']) ? balance.free['USDT'] : 0;
    
    // 计算现货持仓
    let positions: any[] = [];
    let currentPositionsValue = 0;
    
    try {
      // 从数据库获取最新的交易记录来推断持仓
      const chats = await prisma.chat.findMany({
        where: {
          model: "Deepseek",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // 获取最近50条记录
        include: {
          tradings: true,
        },
      });
      
      // 计算净持仓
      const positionMap: Record<string, { symbol: string; amount: number; avgPrice: number; }> = {};
      
      // 遍历所有交易记录，计算净持仓
      chats.forEach(chat => {
        chat.tradings.forEach(trade => {
          if (trade.opeartion === "Buy" && trade.amount && trade.pricing) {
            if (!positionMap[trade.symbol]) {
              positionMap[trade.symbol] = {
                symbol: trade.symbol,
                amount: 0,
                avgPrice: 0
              };
            }
            // 计算平均价格
            const totalValue = positionMap[trade.symbol].amount * positionMap[trade.symbol].avgPrice + trade.amount * trade.pricing;
            const totalAmount = positionMap[trade.symbol].amount + trade.amount;
            positionMap[trade.symbol].amount = totalAmount;
            positionMap[trade.symbol].avgPrice = totalAmount > 0 ? totalValue / totalAmount : 0;
          } else if (trade.opeartion === "Sell" && trade.amount && trade.pricing) {
            if (!positionMap[trade.symbol]) {
              positionMap[trade.symbol] = {
                symbol: trade.symbol,
                amount: 0,
                avgPrice: 0
              };
            }
            positionMap[trade.symbol].amount -= trade.amount;
            // 简化处理，不调整平均价格
          }
        });
      });
      
      // 过滤掉数量为0或负数的持仓，并获取当前价格
      for (const symbol in positionMap) {
        if (positionMap[symbol].amount > 0) {
          try {
            // 获取当前价格
            const ticker = await binance.fetchTicker(`${symbol}/USDT`);
            const currentPrice = ticker.last;
            
            positions.push({
              symbol: positionMap[symbol].symbol,
              amount: positionMap[symbol].amount,
              avgPrice: positionMap[symbol].avgPrice,
              currentPrice: currentPrice,
              value: positionMap[symbol].amount * currentPrice
            });
            
            currentPositionsValue += positionMap[symbol].amount * currentPrice;
          } catch (priceError) {
            console.error(`获取 ${symbol} 价格时出错:`, priceError);
            // 如果获取价格失败，使用平均价格
            positions.push({
              symbol: positionMap[symbol].symbol,
              amount: positionMap[symbol].amount,
              avgPrice: positionMap[symbol].avgPrice,
              currentPrice: positionMap[symbol].avgPrice,
              value: positionMap[symbol].amount * positionMap[symbol].avgPrice
            });
            
            currentPositionsValue += positionMap[symbol].amount * positionMap[symbol].avgPrice;
          }
        }
      }
    } catch (dbError) {
      console.error("获取持仓信息时出错:", dbError);
      positions = [];
      currentPositionsValue = 0;
    }
    
    // 计算当前总回报率
    const currentTotalReturn = totalCashValue > 0 ? (totalCashValue - initialCapital) / initialCapital : 0;

    return {
      currentPositionsValue,
      contractValue: 0, // 现货交易不适用
      totalCashValue,
      availableCash,
      currentTotalReturn,
      positions,
      sharpeRatio: 0, // 简化处理
    };
  } catch (error) {
    console.error("Error fetching account information:", error);
    // 返回默认值而不是抛出异常
    return {
      currentPositionsValue: 0,
      contractValue: 0,
      totalCashValue: initialCapital,
      availableCash: initialCapital,
      currentTotalReturn: 0,
      positions: [],
      sharpeRatio: 0,
    };
  }
}

export function formatAccountPerformance(
  accountPerformance: AccountInformationAndPerformance
) {
  const { currentTotalReturn, availableCash, totalCashValue, currentPositionsValue, positions } =
    accountPerformance;

  // 格式化持仓信息
  let positionsInfo = "No futures positions (using spot trading)";
  if (positions.length > 0) {
    positionsInfo = "Spot positions:\n";
    positions.forEach(pos => {
      positionsInfo += `  ${pos.symbol}: ${pos.amount.toFixed(4)} units @ $${pos.avgPrice.toFixed(2)} (current: $${pos.currentPrice.toFixed(2)})\n`;
    });
  }

  const output = `## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
Current Total Return (percent): ${(currentTotalReturn * 100).toFixed(2)}%
Available Cash: ${availableCash.toFixed(2)}
Current Account Value: ${totalCashValue.toFixed(2)}
Current Positions Value: ${currentPositionsValue.toFixed(2)}
Positions: ${positionsInfo}
`;
  return output;
}