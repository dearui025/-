const ccxt = require('ccxt');

// 创建Binance现货测试网实例
const binance = new ccxt.binance({
  apiKey: '2165079ebea890021772ef7d21e7e8fbf8552d54a116edbe2d19eeedf0cada54',
  secret: '2714ef687be4bdd73cfe5517250f4429461aa20bf373269e10d7076e6dd2fb86',
  hostname: 'testnet.binance.vision', // 现货测试网
  options: {
    defaultType: 'spot',
    adjustForTimeDifference: true,
    recvWindow: 60000,
    timeout: 30000,
  },
  agent: new (require('http-proxy-agent').HttpProxyAgent)('http://127.0.0.1:7890'),
  enableRateLimit: true,
});

async function testBinanceConnection() {
  try {
    console.log('Testing Binance Spot Testnet Connection...');
    
    // 测试连接
    const time = await binance.fetchTime();
    console.log('Server Time:', new Date(time).toISOString());
    
    // 测试账户信息
    const balance = await binance.fetchBalance();
    console.log('Account Balance:', balance.total);
    
    // 测试市场数据
    const ticker = await binance.fetchTicker('BTC/USDT');
    console.log('BTC/USDT Price:', ticker.last);
    
    console.log('Binance Spot Testnet Connection Successful!');
  } catch (error) {
    console.error('Binance Spot Testnet Connection Error:', error.message);
    // 如果是认证错误，提供更多信息
    if (error.message.includes('Invalid Api-Key ID')) {
      console.log('请检查API密钥是否正确，或在https://testnet.binance.vision/上创建新的API密钥');
    }
  }
}

testBinanceConnection();