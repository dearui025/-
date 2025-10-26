// 模拟项目中的币安配置
require('dotenv').config();
const ccxt = require('ccxt');
const { HttpProxyAgent } = require('http-proxy-agent');

// 创建Binance实例（与项目中完全相同）
const binance = new ccxt.binance({
  apiKey: process.env.BINANCE_API_KEY,
  secret: process.env.BINANCE_API_SECRET,
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

// 根据环境变量设置沙盒模式
if (process.env.BINANCE_USE_SANDBOX === "true") {
  binance.setSandboxMode(true);
  console.log("Binance sandbox mode enabled");
} else {
  binance.setSandboxMode(false);
  console.log("Binance production mode enabled");
}

async function testProjectBinance() {
  try {
    console.log('=== 项目币安配置测试 ===');
    
    // 测试时间同步
    console.log('1. 测试时间同步...');
    const time = await binance.fetchTime();
    console.log('   服务器时间:', new Date(time).toISOString());
    
    // 测试账户信息（与项目中相同的函数）
    console.log('2. 测试账户信息...');
    const balance = await binance.fetchBalance();
    const totalCashValue = (balance.total && balance.total['USDT']) ? balance.total['USDT'] : 0;
    const availableCash = (balance.free && balance.free['USDT']) ? balance.free['USDT'] : 0;
    console.log('   总现金价值:', totalCashValue);
    console.log('   可用现金:', availableCash);
    
    console.log('\n=== 测试完成 ===');
    console.log('项目币安配置工作正常！');
    
  } catch (error) {
    console.error('=== 测试失败 ===');
    console.error('错误信息:', error.message);
    console.error('错误代码:', error.code);
  }
}

testProjectBinance();