import { binance } from "./biance";

/**
 * 执行卖出交易（现货）
 * @param symbol 交易对 (例如: "BTC/USDT")
 * @param amount 卖出数量（以基础货币计）
 * @param price 价格
 * @returns 交易结果
 */
export async function sell(
  symbol: string,
  amount: number,
  price?: number
) {
  try {
    // 执行现货卖出交易
    const order = await binance.createMarketSellOrder(symbol, amount);

    console.log(`卖出订单已执行:`, {
      symbol,
      amount,
      price,
      orderId: order.id,
      status: order.status,
    });

    return {
      success: true,
      orderId: order.id,
      symbol,
      amount,
      price: order.price || price,
      timestamp: order.timestamp,
      status: order.status,
    };
  } catch (error) {
    console.error("卖出订单执行失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      symbol,
      amount,
      price,
    };
  }
}