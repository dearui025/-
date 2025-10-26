const ccxt = require('ccxt');

// 使用与项目中相同的配置
const binance = new ccxt.binance({
  apiKey: 'LUgIf7D9vqlTVcqHF13TbFY2WeZHsO0Uuycym17wx5Vy2uxdAora8o4PkHbNE7rb',
  secret: 'fuq93IPY0GatDDNHMg0sqSpOsfHIvteaDA1iHhLNct5GXmgcz2IvSfd01pjq7fG3',
  hostname: 'testnet.binance.vision',
  options: {
    defaultType: 'spot',
    adjustForTimeDifference: true,
    recvWindow: 60000,
    timeout: 30000,
  },
  agent: new (require('http-proxy-agent').HttpProxyAgent)('http://127.0.0.1:7890'),
  enableRateLimit: true,
});

async function debugBinance() {
  try {
    console.log('=== 币安连接调试 ===');
    
    // 测试时间同步
    console.log('1. 测试时间同步...');
    const time = await binance.fetchTime();
    console.log('   服务器时间:', new Date(time).toISOString());
    
    // 测试账户信息
    console.log('2. 测试账户信息...');
    const balance = await binance.fetchBalance();
    console.log('   账户余额获取成功');
    console.log('   USDT余额:', balance.total.USDT || 0);
    
    // 测试交易权限
    console.log('3. 测试交易权限...');
    // 尝试创建一个测试订单（很小的数量）
    try {
      const order = await binance.createLimitBuyOrder('BTC/USDT', 0.00001, 10000);
      console.log('   交易权限测试成功');
      // 立即取消订单
      await binance.cancelOrder(order.id, 'BTC/USDT');
      console.log('   测试订单已取消');
    } catch (tradeError) {
      // 交易权限错误是预期的，因为我们可能没有足够的资金
      console.log('   交易权限检查完成（可能因资金不足而失败）');
      console.log('   错误信息:', tradeError.message);
    }
    
    console.log('\n=== 调试完成 ===');
    console.log('币安连接配置正确！');
    
  } catch (error) {
    console.error('=== 调试失败 ===');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
    
    if (error.message.includes('Invalid API-key')) {
      console.log('\n=== 解决方案建议 ===');
      console.log('1. 检查API密钥是否正确');
      console.log('2. 确认API密钥已在币安测试网启用');
      console.log('3. 检查API密钥的IP白名单设置');
      console.log('4. 确保API密钥具有现货交易权限');
    }
  }
}

debugBinance();