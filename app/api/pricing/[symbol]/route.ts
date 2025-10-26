import { NextRequest, NextResponse } from "next/server";
import ccxt from "ccxt";
import { HttpProxyAgent } from 'http-proxy-agent';

export const GET = async (
  request: NextRequest,
  { params }: { params: { symbol: string } }
) => {
  try {
    const { symbol } = params;
    
    // 创建不使用API密钥的Binance实例（仅用于获取市场数据）
    const binance = new ccxt.binance({
      hostname: 'testnet.binance.vision', // 使用币安现货测试网主机名
      options: {
        defaultType: "spot", // 使用现货交易
        adjustForTimeDifference: true, // 自动调整时间差
        recvWindow: 60000, // 增加接收窗口到60秒
        timeout: 30000, // 增加超时时间到30秒
      },
      // 配置代理
      agent: new HttpProxyAgent('http://127.0.0.1:7890'),
      // 添加额外的时间调整
      enableRateLimit: true, // 启用速率限制
    });

    // 启用沙盒模式
    binance.setSandboxMode(true);
    
    // 规范化交易对格式
    const normalizedSymbol = symbol.includes("/") ? symbol : `${symbol}/USDT`;
    
    // 获取ticker数据
    const ticker = await binance.fetchTicker(normalizedSymbol);
    
    return NextResponse.json({
      success: true,
      data: {
        symbol: normalizedSymbol,
        price: ticker.last,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error(`Error fetching price for ${params.symbol}:`, error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
};