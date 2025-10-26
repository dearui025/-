const ccxt = require('ccxt');
const { HttpProxyAgent } = require('http-proxy-agent');

// 创建使用API密钥但不指定IP限制的Binance实例
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

// 启用沙盒模式
binance.setSandboxMode(true);
console.log("Binance Paper Trading (Sandbox) mode enabled");

async function testConnectionWithoutIPRestriction() {
  try {
    console.log('=== 测试不使用IP限制的连接 ===');
    
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
    
    console.log('\n=== 连接测试成功 ===');
    console.log('API密钥认证成功，可能不需要IP白名单设置');
    
  } catch (error) {
    console.error('=== 连接测试失败 ===');
    console.error('错误信息:', error.message);
    
    if (error.message.includes('Invalid API-key')) {
      console.log('\n=== 建议解决方案 ===');
      console.log('1. 请确认API密钥已正确复制');
      console.log('2. 检查API密钥是否已启用');
      console.log('3. 确认API密钥具有现货交易权限');
      console.log('4. 尝试重新生成API密钥');
    }
  }
}

testConnectionWithoutIPRestriction();