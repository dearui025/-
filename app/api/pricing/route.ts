import { NextResponse } from "next/server";
import { getCurrentMarketState } from "@/lib/trading/current-market-state";

export const GET = async () => {
  try {
    // 并行获取所有主流加密货币价格
    const [
      btcPricing,
      ethPricing,
      solPricing,
      dogePricing,
      bnbPricing,
      xrpPricing,
    ] = await Promise.all([
      getCurrentMarketState("BTC/USDT"),
      getCurrentMarketState("ETH/USDT"),
      getCurrentMarketState("SOL/USDT"),
      getCurrentMarketState("DOGE/USDT"),
      getCurrentMarketState("BNB/USDT"),
      getCurrentMarketState("XRP/USDT"),
    ]);

    return NextResponse.json({
      data: {
        pricing: {
          btc: btcPricing,
          eth: ethPricing,
          sol: solPricing,
          doge: dogePricing,
          bnb: bnbPricing,
          xrp: xrpPricing,
        },
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching pricing:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pricing data",
        success: false,
      },
      { status: 500 }
    );
  }
};