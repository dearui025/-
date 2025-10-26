import { Position } from "ccxt";
import { binance } from "./biance";

export interface AccountInformationAndPerformance {
  currentPositionsValue: number;
  contractValue: number;
  totalCashValue: number;
  availableCash: number;
  currentTotalReturn: number;
  positions: any[]; // 现货交易不使用期货持仓
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
    
    // 对于现货交易，我们简化处理持仓信息
    const positions: any[] = [];
    
    // 计算当前总回报率
    const currentTotalReturn = totalCashValue > 0 ? (totalCashValue - initialCapital) / initialCapital : 0;

    return {
      currentPositionsValue: 0, // 现货交易不适用
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
  const { currentTotalReturn, availableCash, totalCashValue } =
    accountPerformance;

  const output = `## HERE IS YOUR ACCOUNT INFORMATION & PERFORMANCE
Current Total Return (percent): ${(currentTotalReturn * 100).toFixed(2)}%
Available Cash: ${availableCash.toFixed(2)}
Current Account Value: ${totalCashValue.toFixed(2)}
Positions: No futures positions (using spot trading)
`;
  return output;
}