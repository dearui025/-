const ccxt = require('ccxt');
const { HttpProxyAgent } = require('http-proxy-agent');

// 创建Paper Trading配置的Binance实例
const binance = new ccxt.binance({
  apiKey: '5YGE2rAu02nsqAu6uWh5BIdkHxXmZLY1FFafE9W2q1bODUZu1cktB3ebYuuFakd3',
  secret: 'e71KcVl5HMhDP1rBSBz4kmgCRAsnoNS8bACuHWeN1lArjVnynlJ0r5xWDKnoIYGp',
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

// 启用沙盒模式（Paper Trading）
binance.setSandboxMode(true);
console.log("Binance Paper Trading (Sandbox) mode enabled");

async function testPaperTrading() {
  try {
    console.log('=== Paper Trading 测试 ===');
    
    // 1. 测试连接
    console.log('\n1. 测试服务器连接...');
    const time = await binance.fetchTime();
    console.log('   服务器时间:', new Date(time).toISOString());
    
    // 2. 检查账户信息
    console.log('\n2. 检查账户信息...');
    const balance = await binance.fetchBalance();
    console.log('   账户余额:');
    for (const [currency, amount] of Object.entries(balance.total)) {
      if (amount > 0) {
        console.log(`     ${currency}: ${amount}`);
      }
    }
    
    // 3. 获取BTC/USDT市场价格
    console.log('\n3. 获取BTC/USDT市场价格...');
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log(`   当前价格: $${ticker.last}`);
    
    // 4. 模拟交易
    console.log('\n4. 模拟交易测试...');
    console.log('   模拟买入0.001 BTC...');
    
    // 使用市价单模拟买入
    try {
      const order = await binance.createMarketBuyOrder('BTC/USDT', 0.001);
      console.log('   模拟买入订单创建成功:');
      console.log(`     订单ID: ${order.id}`);
      console.log(`     状态: ${order.status}`);
      console.log(`     成交数量: ${order.filled}`);
      console.log(`     成交金额: $${order.cost}`);
      
      // 取消订单（在测试网中）
      await binance.cancelOrder(order.id, 'BTC/USDT');
      console.log('   模拟订单已取消');
    } catch (orderError) {
      console.log('   模拟交易完成（可能因资金不足而失败）');
      console.log(`   错误信息: ${orderError.message}`);
    }
    
    console.log('\n=== Paper Trading 测试完成 ===');
    console.log('您现在可以使用Paper Trading模式进行模拟交易！');
    
  } catch (error) {
    console.error('=== 测试失败 ===');
    console.error('错误信息:', error.message);
    
    if (error.message.includes('Invalid API-key')) {
      console.log('\n=== 解决方案 ===');
      console.log('1. 请确认您已在 https://testnet.binance.vision/ 创建了API密钥');
      console.log('2. 确保API密钥已启用并具有现货交易权限');
      console.log('3. 检查API密钥的IP白名单设置');
    }
  }
}

testPaperTrading();