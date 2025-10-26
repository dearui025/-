const ccxt = require('ccxt');
const { HttpProxyAgent } = require('http-proxy-agent');

// 创建不使用API密钥的Binance实例（仅用于获取市场数据）
const binance = new ccxt.binance({
  hostname: 'testnet.binance.vision',
  options: {
    defaultType: "spot",
    adjustForTimeDifference: true,
    recvWindow: 60000,
    timeout: 30000,
  },
  agent: new HttpProxyAgent('http://127.0.0.1:7890'),
  enableRateLimit: true,
});

// 启用沙盒模式
binance.setSandboxMode(true);
console.log("Binance Paper Trading (Sandbox) mode enabled");

async function testMarketData() {
  try {
    console.log('=== 测试市场数据获取 ===');
    
    // 获取BTC/USDT市场价格
    console.log('\n1. 获取BTC/USDT市场价格...');
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log(`   当前价格: $${ticker.last}`);
    
    // 获取K线数据
    console.log('\n2. 获取BTC/USDT K线数据...');
    const ohlcv = await binance.fetchOHLCV('BTC/USDT', '1m', undefined, 10);
    console.log(`   获取到 ${ohlcv.length} 根K线数据`);
    console.log(`   最新收盘价: $${ohlcv[ohlcv.length - 1][4]}`);
    
    console.log('\n=== 市场数据测试完成 ===');
    console.log('您可以成功获取市场数据，但交易功能需要有效的API密钥');
    
  } catch (error) {
    console.error('=== 测试失败 ===');
    console.error('错误信息:', error.message);
  }
}

testMarketData();