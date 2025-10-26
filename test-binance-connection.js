import dotenv from 'dotenv';
import ccxt from 'ccxt';
import { HttpProxyAgent } from 'http-proxy-agent';

// 加载环境变量
dotenv.config();

async function testBinanceConnection() {
  console.log('=== 币安连接测试 ===');
  
  try {
    // 创建Binance实例
    const binance = new ccxt.binance({
      apiKey: process.env.BINANCE_API_KEY,
      secret: process.env.BINANCE_API_SECRET,
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

    // 设置沙盒模式
    if (process.env.BINANCE_USE_SANDBOX === "true") {
      binance.setSandboxMode(true);
      console.log("沙盒模式已启用");
    } else {
      binance.setSandboxMode(false);
      console.log("生产模式已启用");
    }

    // 测试1: 获取服务器时间
    console.log('\n1. 测试服务器时间同步...');
    const time = await binance.fetchTime();
    console.log(`   服务器时间: ${new Date(time).toISOString()}`);
    
    // 测试2: 获取账户信息
    console.log('\n2. 测试账户信息...');
    const balance = await binance.fetchBalance();
    const usdtBalance = balance.total && balance.total['USDT'] ? balance.total['USDT'] : 0;
    console.log(`   USDT总余额: ${usdtBalance}`);
    console.log(`   USDT可用余额: ${balance.free && balance.free['USDT'] ? balance.free['USDT'] : 0}`);
    
    // 测试3: 获取交易对信息
    console.log('\n3. 测试交易对信息...');
    const markets = await binance.loadMarkets();
    console.log(`   已加载 ${Object.keys(markets).length} 个交易对`);
    
    // 测试4: 获取BTC/USDT价格
    console.log('\n4. 测试BTC/USDT价格...');
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log(`   BTC/USDT 当前价格: $${ticker.last}`);
    
    console.log('\n=== 测试完成 ===');
    console.log('币安连接正常！');
    
  } catch (error) {
    console.error('\n=== 测试失败 ===');
    console.error('错误信息:', error.message);
    if (error.body) {
      console.error('详细错误:', error.body);
    }
    
    // 提供解决建议
    console.log('\n=== 解决建议 ===');
    console.log('1. 检查API密钥是否正确');
    console.log('2. 确保API密钥已在Binance测试网启用交易权限');
    console.log('3. 检查IP白名单设置');
    console.log('4. 确认代理设置正确');
  }
}

testBinanceConnection();