const ccxt = require('ccxt');
const { HttpProxyAgent } = require('http-proxy-agent');

// 创建简化配置的Binance实例（用于测试）
const binance = new ccxt.binance({
  // 这里暂时使用空的API密钥进行连接测试
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

async function testConnection() {
  try {
    console.log('=== 测试Binance测试网连接 ===');
    
    // 测试连接
    console.log('\n1. 测试服务器连接...');
    const time = await binance.fetchTime();
    console.log('   服务器时间:', new Date(time).toISOString());
    
    // 获取BTC/USDT市场价格
    console.log('\n2. 获取BTC/USDT市场价格...');
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log(`   当前价格: $${ticker.last}`);
    
    console.log('\n=== 连接测试成功 ===');
    console.log('您可以访问 https://testnet.binance.vision/ 创建API密钥');
    console.log('您的公网IP地址是: 122.10.198.55');
    console.log('创建API密钥时，请将此IP地址添加到白名单中');
    
  } catch (error) {
    console.error('=== 连接测试失败 ===');
    console.error('错误信息:', error.message);
    
    console.log('\n=== 解决方案 ===');
    console.log('1. 请访问 https://testnet.binance.vision/');
    console.log('2. 创建新的API密钥');
    console.log('3. 将您的IP地址 (122.10.198.55) 添加到API密钥的IP白名单');
    console.log('4. 在 .env 文件中更新BINANCE_API_KEY和BINANCE_API_SECRET');
  }
}

testConnection();