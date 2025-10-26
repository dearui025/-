const { getCurrentPrice, getCurrentPrices } = require('./lib/trading/price-fetcher');

async function testPriceFetcher() {
  console.log('=== 测试价格获取功能 ===');
  
  try {
    // 测试单个价格获取
    console.log('\n1. 测试获取BTC/USDT价格...');
    const btcPrice = await getCurrentPrice('BTC/USDT');
    console.log(`   BTC/USDT 当前价格: $${btcPrice.toFixed(2)}`);
    
    // 测试多个价格获取
    console.log('\n2. 测试批量获取价格...');
    const symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'];
    const prices = await getCurrentPrices(symbols);
    
    for (const [symbol, price] of Object.entries(prices)) {
      console.log(`   ${symbol}: $${price.toFixed(2)}`);
    }
    
    console.log('\n=== 价格获取测试完成 ===');
    
  } catch (error) {
    console.error('=== 测试失败 ===');
    console.error('错误信息:', error.message);
  }
}

testPriceFetcher();